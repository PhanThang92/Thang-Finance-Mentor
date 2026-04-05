/* ─────────────────────────────────────────────────────────────────────────
   Sequence worker — processes email sequence enrollments on a timer.

   Logic (runs every 30 minutes):
   1. Query enrollments where status='active' AND next_send_at <= now()
   2. For each, load subscriber + sequence steps
   3. Send the email for the current step
   4. Advance to the next step, or mark as completed
   ───────────────────────────────────────────────────────────────────────── */

import { db, emailSequenceEnrollmentsTable, emailSubscribersTable, emailSequenceStepsTable, emailEventsTable } from "@workspace/db";
import { eq, lte, and, asc, sql } from "drizzle-orm";
import { sendSequenceStepToSubscriber } from "./emailService.js";

const TICK_MS = 30 * 60 * 1000; // 30 minutes

async function processPendingEnrollments(): Promise<void> {
  try {
    const now = new Date();

    // Find all enrollments that are due
    const due = await db
      .select()
      .from(emailSequenceEnrollmentsTable)
      .where(
        and(
          eq(emailSequenceEnrollmentsTable.status, "active"),
          lte(emailSequenceEnrollmentsTable.nextSendAt, now),
        ),
      );

    if (due.length === 0) return;

    console.log(`[sequence-worker] Processing ${due.length} pending enrollment(s)`);

    for (const enrollment of due) {
      try {
        // Load subscriber
        const [subscriber] = await db
          .select()
          .from(emailSubscribersTable)
          .where(eq(emailSubscribersTable.id, enrollment.subscriberId));

        if (!subscriber || subscriber.subscriberStatus !== "subscribed") {
          // Cancel enrollment if subscriber is gone or unsubscribed
          await db
            .update(emailSequenceEnrollmentsTable)
            .set({ status: "cancelled" })
            .where(eq(emailSequenceEnrollmentsTable.id, enrollment.id));
          continue;
        }

        // Load steps for this sequence, ordered
        const steps = await db
          .select()
          .from(emailSequenceStepsTable)
          .where(
            and(
              eq(emailSequenceStepsTable.sequenceId, enrollment.sequenceId),
              eq(emailSequenceStepsTable.isActive, true),
            ),
          )
          .orderBy(asc(emailSequenceStepsTable.stepOrder));

        if (steps.length === 0) {
          await db
            .update(emailSequenceEnrollmentsTable)
            .set({ status: "completed", completedAt: now })
            .where(eq(emailSequenceEnrollmentsTable.id, enrollment.id));
          continue;
        }

        // Find current step
        const currentStepObj = steps.find((s) => s.stepOrder === enrollment.currentStep) ?? steps[0];

        if (!currentStepObj) {
          await db
            .update(emailSequenceEnrollmentsTable)
            .set({ status: "completed", completedAt: now })
            .where(eq(emailSequenceEnrollmentsTable.id, enrollment.id));
          continue;
        }

        // Send the email
        const result = await sendSequenceStepToSubscriber(subscriber, currentStepObj);

        if (result.ok) {
          // Log event
          await db.insert(emailEventsTable).values({
            subscriberId: subscriber.id,
            eventType: "sent",
            eventMetadata: { sequenceId: enrollment.sequenceId, stepId: currentStepObj.id, stepOrder: currentStepObj.stepOrder },
          });

          // Find next step
          const nextStep = steps.find((s) => s.stepOrder > currentStepObj.stepOrder);

          if (nextStep) {
            const nextSendAt = new Date(now.getTime() + nextStep.delayDays * 86_400_000);
            await db
              .update(emailSequenceEnrollmentsTable)
              .set({ currentStep: nextStep.stepOrder, nextSendAt })
              .where(eq(emailSequenceEnrollmentsTable.id, enrollment.id));
          } else {
            // All steps sent — mark complete
            await db
              .update(emailSequenceEnrollmentsTable)
              .set({ status: "completed", completedAt: now })
              .where(eq(emailSequenceEnrollmentsTable.id, enrollment.id));
          }
        }
      } catch (e) {
        console.error(`[sequence-worker] Error processing enrollment ${enrollment.id}:`, e);
      }
    }
  } catch (e) {
    console.error("[sequence-worker] Tick error:", e);
  }
}

export function startSequenceWorker(): () => void {
  console.log("[sequence-worker] Started — checking every 30 minutes");

  // Run immediately on startup (with a 5s delay to let DB settle)
  const initialTimer = setTimeout(() => void processPendingEnrollments(), 5_000);

  const interval = setInterval(() => void processPendingEnrollments(), TICK_MS);

  return () => {
    clearTimeout(initialTimer);
    clearInterval(interval);
    console.log("[sequence-worker] Stopped");
  };
}
