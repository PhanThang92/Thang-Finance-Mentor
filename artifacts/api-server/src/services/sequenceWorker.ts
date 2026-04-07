/* ─────────────────────────────────────────────────────────────────────────
   Sequence worker — processes email sequence enrollments on a timer.

   STEP TYPE HANDLING:
   ──────────────────
   "email"           → Send email to subscriber, advance to next step
   "wait"            → No action (timer was already set); advance to next step
   "add_tag"         → Add tagName to subscriber.tags, immediately advance
   "remove_tag"      → Remove tagName from subscriber.tags, immediately advance
   "update_field"    → Set subscriber[updateField] = updateValue, immediately advance
   "move_to_sequence"→ Enroll subscriber into targetSequenceId, mark current as completed
   "end"             → Mark enrollment as completed immediately

   ARCHITECTURE:
   ─────────────
   processEnrollment() handles one enrollment at a time. After processing
   a non-timed step (tag/field/end/move), it immediately calls itself
   recursively to process the next step (up to MAX_CHAIN_DEPTH).
   This allows chains like: email → add_tag → update_field → wait (sets timer).

   TICK: 30 minutes (configurable via SEQUENCE_WORKER_INTERVAL_MS env var)
   ───────────────────────────────────────────────────────────────────────── */

import {
  db, emailSequenceEnrollmentsTable, emailSubscribersTable,
  emailSequenceStepsTable, emailEventsTable, emailSequencesTable,
} from "@workspace/db";
import { eq, lte, and, asc, or } from "drizzle-orm";
import { sendSequenceStepToSubscriber } from "./emailService.js";

const TICK_MS = Number(process.env["SEQUENCE_WORKER_INTERVAL_MS"] ?? 30 * 60 * 1000);
const MAX_CHAIN_DEPTH = 10; // prevent infinite loops in pathological configs

/* ── Public helper: enroll subscriber into sequences triggered by tags ── */
export async function enrollInSequencesByTags(subscriberId: number, tags: string[]): Promise<void> {
  if (!tags.length) return;
  try {
    const sequences = await db
      .select()
      .from(emailSequencesTable)
      .where(and(eq(emailSequencesTable.status, "active"), eq(emailSequencesTable.triggerType, "tag_added")));

    const now = new Date();
    for (const seq of sequences) {
      const seqTags: string[] = (seq.triggerTags as string[]) ?? [];
      if (!seqTags.some((t) => tags.includes(t))) continue;

      const [existing] = await db.select({ id: emailSequenceEnrollmentsTable.id, status: emailSequenceEnrollmentsTable.status })
        .from(emailSequenceEnrollmentsTable)
        .where(and(
          eq(emailSequenceEnrollmentsTable.subscriberId, subscriberId),
          eq(emailSequenceEnrollmentsTable.sequenceId, seq.id),
          or(
            eq(emailSequenceEnrollmentsTable.status, "active"),
            eq(emailSequenceEnrollmentsTable.status, "completed"),
          ),
        )).limit(1);
      if (existing) continue;

      const [firstStep] = await db.select({ stepOrder: emailSequenceStepsTable.stepOrder, delayDays: emailSequenceStepsTable.delayDays })
        .from(emailSequenceStepsTable)
        .where(and(eq(emailSequenceStepsTable.sequenceId, seq.id), eq(emailSequenceStepsTable.isActive, true)))
        .orderBy(asc(emailSequenceStepsTable.stepOrder))
        .limit(1);
      if (!firstStep) continue;

      const nextSendAt = new Date(now.getTime() + firstStep.delayDays * 86_400_000);
      await db.insert(emailSequenceEnrollmentsTable).values({
        subscriberId, sequenceId: seq.id,
        currentStep: firstStep.stepOrder,
        status: "active", nextSendAt, enrolledAt: now,
      }).onConflictDoNothing();
    }
  } catch (e) {
    console.error("[enrollInSequencesByTags]", e);
  }
}

/* ── Merge field substitution ──────────────────────────────────────── */
function applyMergeFields(template: string, subscriber: { firstName?: string | null; fullName?: string | null }): string {
  const firstName = subscriber.firstName || subscriber.fullName?.split(" ")[0] || "bạn";
  return template.replace(/\{\{first_name\}\}/gi, firstName);
}

/* ── Process a single enrollment (may recurse for instant steps) ──── */
async function processEnrollment(
  enrollmentId: number,
  now: Date,
  depth = 0,
): Promise<void> {
  if (depth > MAX_CHAIN_DEPTH) {
    console.warn(`[sequence-worker] Max chain depth reached for enrollment ${enrollmentId}`);
    return;
  }

  const [enrollment] = await db
    .select()
    .from(emailSequenceEnrollmentsTable)
    .where(eq(emailSequenceEnrollmentsTable.id, enrollmentId));

  if (!enrollment || enrollment.status !== "active") return;

  // Load subscriber
  const [subscriber] = await db
    .select()
    .from(emailSubscribersTable)
    .where(eq(emailSubscribersTable.id, enrollment.subscriberId));

  if (!subscriber || !["subscribed"].includes(subscriber.subscriberStatus)) {
    await db.update(emailSequenceEnrollmentsTable)
      .set({ status: "cancelled" })
      .where(eq(emailSequenceEnrollmentsTable.id, enrollment.id));
    return;
  }

  // Load all active steps for this sequence
  const steps = await db
    .select()
    .from(emailSequenceStepsTable)
    .where(and(
      eq(emailSequenceStepsTable.sequenceId, enrollment.sequenceId),
      eq(emailSequenceStepsTable.isActive, true),
    ))
    .orderBy(asc(emailSequenceStepsTable.stepOrder));

  if (steps.length === 0) {
    await db.update(emailSequenceEnrollmentsTable)
      .set({ status: "completed", completedAt: now })
      .where(eq(emailSequenceEnrollmentsTable.id, enrollment.id));
    return;
  }

  const currentStepObj = steps.find((s) => s.stepOrder === enrollment.currentStep) ?? steps[0];
  if (!currentStepObj) {
    await db.update(emailSequenceEnrollmentsTable)
      .set({ status: "completed", completedAt: now })
      .where(eq(emailSequenceEnrollmentsTable.id, enrollment.id));
    return;
  }

  const stepType = currentStepObj.stepType ?? "email";

  /* ── Step type: end ─────────────────────────────────────────── */
  if (stepType === "end") {
    await db.update(emailSequenceEnrollmentsTable)
      .set({ status: "completed", completedAt: now })
      .where(eq(emailSequenceEnrollmentsTable.id, enrollment.id));
    console.log(`[sequence-worker] Enrollment ${enrollmentId} ended at 'end' step`);
    return;
  }

  /* ── Step type: add_tag ─────────────────────────────────────── */
  if (stepType === "add_tag" && currentStepObj.tagName) {
    const currentTags: string[] = (subscriber.tags as string[]) ?? [];
    if (!currentTags.includes(currentStepObj.tagName)) {
      await db.update(emailSubscribersTable)
        .set({ tags: [...currentTags, currentStepObj.tagName], updatedAt: now })
        .where(eq(emailSubscribersTable.id, subscriber.id));
    }
    await advanceToNextStep(enrollmentId, steps, currentStepObj.stepOrder, now);
    return void processEnrollment(enrollmentId, now, depth + 1);
  }

  /* ── Step type: remove_tag ──────────────────────────────────── */
  if (stepType === "remove_tag" && currentStepObj.tagName) {
    const currentTags: string[] = (subscriber.tags as string[]) ?? [];
    const newTags = currentTags.filter((t) => t !== currentStepObj.tagName);
    await db.update(emailSubscribersTable)
      .set({ tags: newTags, updatedAt: now })
      .where(eq(emailSubscribersTable.id, subscriber.id));
    await advanceToNextStep(enrollmentId, steps, currentStepObj.stepOrder, now);
    return void processEnrollment(enrollmentId, now, depth + 1);
  }

  /* ── Step type: update_field ────────────────────────────────── */
  if (stepType === "update_field" && currentStepObj.updateField) {
    const allowedFields = ["stage", "interestPrimary", "sourceType"];
    if (allowedFields.includes(currentStepObj.updateField)) {
      await db.update(emailSubscribersTable)
        .set({ [currentStepObj.updateField]: currentStepObj.updateValue || null, updatedAt: now } as any)
        .where(eq(emailSubscribersTable.id, subscriber.id));
    }
    await advanceToNextStep(enrollmentId, steps, currentStepObj.stepOrder, now);
    return void processEnrollment(enrollmentId, now, depth + 1);
  }

  /* ── Step type: move_to_sequence ────────────────────────────── */
  if (stepType === "move_to_sequence" && currentStepObj.targetSequenceId) {
    try {
      const [firstStep] = await db.select({ stepOrder: emailSequenceStepsTable.stepOrder, delayDays: emailSequenceStepsTable.delayDays })
        .from(emailSequenceStepsTable)
        .where(and(
          eq(emailSequenceStepsTable.sequenceId, currentStepObj.targetSequenceId),
          eq(emailSequenceStepsTable.isActive, true),
        ))
        .orderBy(asc(emailSequenceStepsTable.stepOrder))
        .limit(1);

      if (firstStep) {
        const nextSendAt = new Date(now.getTime() + firstStep.delayDays * 86_400_000);
        await db.insert(emailSequenceEnrollmentsTable).values({
          subscriberId: subscriber.id,
          sequenceId: currentStepObj.targetSequenceId,
          currentStep: firstStep.stepOrder,
          status: "active", nextSendAt, enrolledAt: now,
        }).onConflictDoNothing();
      }
    } catch (e) {
      console.error(`[sequence-worker] move_to_sequence error:`, e);
    }
    // Mark current enrollment as completed
    await db.update(emailSequenceEnrollmentsTable)
      .set({ status: "completed", completedAt: now })
      .where(eq(emailSequenceEnrollmentsTable.id, enrollment.id));
    return;
  }

  /* ── Step type: wait ────────────────────────────────────────── */
  // A "wait" step just means: wait delayDays from now, then process the NEXT step.
  // The timer for this step was already set when the previous step was processed.
  // So when we arrive here, we just advance.
  if (stepType === "wait") {
    await advanceToNextStep(enrollmentId, steps, currentStepObj.stepOrder, now);
    // The next step might be an instant step — process it
    return void processEnrollment(enrollmentId, now, depth + 1);
  }

  /* ── Step type: email (default) ─────────────────────────────── */
  // Apply merge fields to subject and body
  const subject     = applyMergeFields(currentStepObj.subject, subscriber);
  const contentBody = applyMergeFields(currentStepObj.contentBody ?? "", subscriber);

  const enrichedStep = { ...currentStepObj, subject, contentBody };
  const result = await sendSequenceStepToSubscriber(subscriber, enrichedStep);

  if (result.ok) {
    // Log event with direct FKs
    await db.insert(emailEventsTable).values({
      subscriberId: subscriber.id,
      eventType: "sent",
      sequenceId: enrollment.sequenceId,
      stepId: currentStepObj.id,
      eventMetadata: { stepOrder: currentStepObj.stepOrder },
    });

    // Update subscriber last sent
    await db.update(emailSubscribersTable)
      .set({ lastEmailSentAt: now, updatedAt: now })
      .where(eq(emailSubscribersTable.id, subscriber.id));

    await advanceToNextStep(enrollmentId, steps, currentStepObj.stepOrder, now);
  }
  // If send failed, we leave nextSendAt unchanged and retry next tick
}

/* ── Advance enrollment to the next step ─────────────────────────── */
async function advanceToNextStep(
  enrollmentId: number,
  steps: { stepOrder: number; delayDays: number; stepType: string | null }[],
  currentStepOrder: number,
  now: Date,
): Promise<void> {
  const nextStep = steps.find((s) => s.stepOrder > currentStepOrder);
  if (nextStep) {
    // For timed steps (email, wait), set nextSendAt based on delay
    // For instant steps (tag, field, end, move), nextSendAt = now so worker processes immediately
    const isInstant = ["add_tag", "remove_tag", "update_field", "end", "move_to_sequence"].includes(nextStep.stepType ?? "email");
    const nextSendAt = isInstant
      ? now
      : new Date(now.getTime() + nextStep.delayDays * 86_400_000);

    await db.update(emailSequenceEnrollmentsTable)
      .set({ currentStep: nextStep.stepOrder, nextSendAt })
      .where(eq(emailSequenceEnrollmentsTable.id, enrollmentId));
  } else {
    // All steps done
    await db.update(emailSequenceEnrollmentsTable)
      .set({ status: "completed", completedAt: now })
      .where(eq(emailSequenceEnrollmentsTable.id, enrollmentId));
  }
}

/* ── Main tick ───────────────────────────────────────────────────── */
async function processPendingEnrollments(): Promise<void> {
  try {
    const now = new Date();

    const due = await db
      .select({ id: emailSequenceEnrollmentsTable.id })
      .from(emailSequenceEnrollmentsTable)
      .where(and(
        eq(emailSequenceEnrollmentsTable.status, "active"),
        lte(emailSequenceEnrollmentsTable.nextSendAt, now),
      ));

    if (due.length === 0) return;
    console.log(`[sequence-worker] Processing ${due.length} pending enrollment(s)`);

    for (const { id } of due) {
      try {
        await processEnrollment(id, now);
      } catch (e) {
        console.error(`[sequence-worker] Error processing enrollment ${id}:`, e);
      }
    }
  } catch (e) {
    console.error("[sequence-worker] Tick error:", e);
  }
}

export function startSequenceWorker(): () => void {
  console.log(`[sequence-worker] Started — checking every ${Math.round(TICK_MS / 60000)} minutes`);
  const initialTimer = setTimeout(() => void processPendingEnrollments(), 5_000);
  const interval = setInterval(() => void processPendingEnrollments(), TICK_MS);
  return () => {
    clearTimeout(initialTimer);
    clearInterval(interval);
    console.log("[sequence-worker] Stopped");
  };
}
