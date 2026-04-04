import React, { useState } from "react";
import { motion } from "framer-motion";

/* ── Animation presets ───────────────────────────────────── */
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.11 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] } },
};
const VP = { once: true, margin: "-56px" };

/* ── Design tokens ───────────────────────────────────────── */
const CARD_LIGHT: React.CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid hsl(var(--border) / 0.92)",
  boxShadow: "0 2px 8px rgba(10,40,35,0.06)",
  padding: "1.75rem 1.625rem",
  transition: "border-color 0.28s ease, transform 0.28s ease",
};
const CARD_DARK: React.CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid rgba(52,160,140,0.15)",
  background: "rgba(52,160,140,0.04)",
  padding: "1.75rem 1.625rem",
  transition: "border-color 0.28s ease",
};
const DARK_BG_A = "linear-gradient(160deg, #0d2622 0%, #091e1b 55%, #071815 100%)";
const DARK_BG_B = "linear-gradient(180deg, #091e1b 0%, #060f0d 100%)";

function hoverLift(e: React.MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  el.style.borderColor = "hsl(var(--primary) / 0.28)";
  el.style.transform = "translateY(-2px)";
}
function hoverReset(e: React.MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  el.style.borderColor = "hsl(var(--border) / 0.92)";
  el.style.transform = "translateY(0)";
}
function hoverLiftDark(e: React.MouseEvent) {
  (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.34)";
}
function hoverResetDark(e: React.MouseEvent) {
  (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.15)";
}

/* ── Shared editorial primitives ─────────────────────────── */
function SectionLabel({ children, dark = false }: { children: string; dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div style={{ height: "1px", width: "2rem", flexShrink: 0, background: dark ? "rgba(52,160,140,0.55)" : "hsl(var(--primary) / 0.50)" }} />
      <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: dark ? "rgba(52,160,140,0.78)" : "hsl(var(--primary))" }}>
        {children}
      </span>
    </div>
  );
}

function SectionHeading({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2 style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.25rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.018em", color: dark ? "rgba(255,255,255,0.94)" : "hsl(var(--foreground))" }}>
      {children}
    </h2>
  );
}

function AnchorLine({ children, dark = false, style }: { children: string; dark?: boolean; style?: React.CSSProperties }) {
  return (
    <p style={{ fontSize: "12.5px", fontWeight: 500, fontStyle: "italic", letterSpacing: "0.005em", lineHeight: 1.55, color: dark ? "rgba(52,160,140,0.82)" : "hsl(var(--primary) / 0.82)", ...style }}>
      {children}
    </p>
  );
}

function NumMarker({ num, dark = false }: { num: string; dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.125rem" }}>
      <span style={{ fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.10em", color: dark ? "rgba(52,160,140,0.80)" : "hsl(var(--primary) / 0.80)" }}>{num}</span>
      <div style={{ width: "1.75rem", height: "1px", background: dark ? "rgba(52,160,140,0.35)" : "hsl(var(--primary) / 0.35)" }} />
    </div>
  );
}

function Dot({ dark = false }: { dark?: boolean }) {
  return (
    <span style={{
      display: "inline-block",
      marginTop: "0.45rem",
      width: "4px", height: "4px",
      borderRadius: "50%",
      background: dark ? "rgba(52,160,140,0.55)" : "hsl(var(--primary) / 0.55)",
      flexShrink: 0,
    }} />
  );
}

/* ══════════════════════════════════════════════════════════
   1. HERO
══════════════════════════════════════════════════════════ */
function Hero() {
  const btnPrimary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", height: "44px", padding: "0 28px",
    borderRadius: "999px", fontSize: "14px", fontWeight: 500, letterSpacing: "0.01em",
    textDecoration: "none", background: "linear-gradient(140deg, #22917f, #1a7868)",
    color: "#fff", boxShadow: "0 4px 18px rgba(26,120,104,0.30)",
    transition: "transform 0.22s ease, box-shadow 0.22s ease",
  };
  const btnSecondary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", height: "44px", padding: "0 24px",
    borderRadius: "999px", fontSize: "14px", fontWeight: 400, letterSpacing: "0.01em",
    textDecoration: "none", background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(8px)", transition: "background 0.22s ease",
  };

  return (
    <section className="relative overflow-hidden flex flex-col justify-center min-h-screen"
      style={{ background: DARK_BG_A }}>
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position: "absolute", top: "10%", right: "-4%", width: "38rem", height: "38rem", borderRadius: "50%", background: "radial-gradient(circle, rgba(36,110,95,0.18) 0%, transparent 68%)", filter: "blur(72px)" }} />
        <div style={{ position: "absolute", bottom: "-6%", left: "-6%", width: "30rem", height: "30rem", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,80,72,0.14) 0%, transparent 70%)", filter: "blur(56px)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(52,160,140,0.14) 50%, transparent)" }} />
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 relative z-10 pt-32 pb-24">
        <motion.div initial="hidden" animate="visible" variants={stagger}>

          <motion.div variants={fadeUp} style={{ marginBottom: "1.75rem" }}>
            <SectionLabel dark>ATLAS · Hệ sinh thái SWC</SectionLabel>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{ fontSize: "clamp(3.2rem, 10vw, 6rem)", fontWeight: 800, lineHeight: 0.96, letterSpacing: "-0.038em", color: "rgba(255,255,255,0.96)", marginBottom: "1.375rem" }}>
            ATLAS
          </motion.h1>

          <motion.p variants={fadeUp} style={{ fontSize: "clamp(1.05rem, 2.4vw, 1.2rem)", lineHeight: 1.55, fontWeight: 400, color: "rgba(255,255,255,0.78)", maxWidth: "36rem", marginBottom: "1.125rem" }}>
            Hệ sinh thái bất động sản kỹ thuật số thế hệ mới.
          </motion.p>

          <motion.p variants={fadeUp} style={{ fontSize: "14px", lineHeight: 1.88, fontWeight: 300, color: "rgba(255,255,255,0.42)", maxWidth: "34rem", marginBottom: "2rem" }}>
            ATLAS hướng tới việc số hóa và minh bạch hóa thị trường bất động sản để giao dịch trở nên rõ ràng hơn, nhanh hơn và thanh khoản hơn — theo mô hình một cửa như thương mại điện tử.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "2.25rem" }}>
            <div style={{ marginTop: "0.38rem", width: "2.5rem", height: "1.5px", background: "rgba(52,160,140,0.60)", borderRadius: "999px", flexShrink: 0 }} />
            <p style={{ fontSize: "clamp(14px, 1.8vw, 15px)", fontStyle: "italic", fontWeight: 400, color: "rgba(52,160,140,0.92)", letterSpacing: "0.004em", lineHeight: 1.62, margin: 0 }}>
              Không chỉ là đăng tin. Mà là niềm tin + pháp lý + dòng tiền + quy trình.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <a href="#he-sinh-thai" style={btnPrimary}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,120,104,0.38)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(26,120,104,0.30)"; }}>
              Tìm hiểu hệ sinh thái
            </a>
            <a href="#dang-ky" style={btnSecondary}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}>
              Đăng ký quan tâm
            </a>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   2. PROBLEM SECTION (light)
══════════════════════════════════════════════════════════ */
function ProblemSection() {
  const problems = [
    {
      num: "01",
      title: "Quảng cáo giả mạo",
      body: "Tin đăng ảo, hình ảnh sai lệch và thông tin không đồng nhất khiến người mua mất thời gian, mất niềm tin và khó ra quyết định.",
    },
    {
      num: "02",
      title: "Thiếu minh bạch",
      body: "Giá có thể bị thao túng, thông tin có thể bị che giấu, và cơ chế 'ăn chênh' khiến giao dịch thiếu công bằng cho các bên.",
    },
    {
      num: "03",
      title: "Quy trình phân mảnh",
      body: "Trao đổi tản mát qua nhiều ứng dụng, dữ liệu dễ thất lạc, khó đối soát và giao dịch kéo dài hơn mức cần thiết.",
    },
    {
      num: "04",
      title: "Pháp lý khó kiểm chứng",
      body: "Khó xác minh quyền sở hữu thật và khó kiểm tra giấy phép hành nghề môi giới khiến rủi ro pháp lý luôn là một điểm nghẽn.",
    },
  ];

  return (
    <section className="py-20 sm:py-24" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>
          <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
            <SectionLabel>Thị trường truyền thống</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp} style={{ marginBottom: "0.875rem" }}>
            <SectionHeading>4 lỗ hổng lớn của thị trường bất động sản truyền thống</SectionHeading>
          </motion.div>
          <motion.div variants={fadeUp} style={{ marginBottom: "3rem" }}>
            <AnchorLine style={{ fontSize: "13px", color: "rgba(52,160,140,0.90)" }}>
              Không phải thị trường thiếu người mua hay người bán — mà thiếu một hệ thống đáng tin cậy để kết nối họ.
            </AnchorLine>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {problems.map((p) => (
              <motion.div
                key={p.num}
                variants={fadeUp}
                style={CARD_LIGHT}
                onMouseEnter={hoverLift}
                onMouseLeave={hoverReset}
              >
                <NumMarker num={p.num} />
                <h3 style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.012em", color: "hsl(var(--foreground))", marginBottom: "0.625rem", lineHeight: 1.3 }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.85, color: "hsl(var(--foreground) / 0.50)", fontWeight: 400 }}>
                  {p.body}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   3. SOLUTION SECTION (dark)
══════════════════════════════════════════════════════════ */
function SolutionSection() {
  const values = [
    { label: "Thông tin tài sản", desc: "Dữ liệu chuẩn, xác thực, dễ đối soát" },
    { label: "Tìm kiếm", desc: "Bộ lọc thông minh theo nhu cầu thực" },
    { label: "Kết nối 3 bên", desc: "Người mua · người bán · môi giới" },
    { label: "Quy trình giao dịch", desc: "Một luồng liền mạch, không đứt đoạn" },
    { label: "Pháp lý", desc: "Liên kết DLD, xác minh theo thời gian thực" },
    { label: "Thanh toán", desc: "Tích hợp trong nền tảng, không cần rời đi" },
    { label: "AI định giá", desc: "Phân tích dựa trên dữ liệu thị trường thật" },
    { label: "AI dự báo thanh khoản", desc: "Thời gian bán ước tính theo điều kiện hiện tại" },
    { label: "Sell Fast", desc: "Đề xuất giá tối ưu khi cần thanh khoản nhanh" },
  ];

  return (
    <section id="he-sinh-thai" className="py-20 sm:py-24" style={{ background: DARK_BG_B }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>
          <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
            <SectionLabel dark>Giải pháp</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp} style={{ marginBottom: "0.875rem" }}>
            <SectionHeading dark>ATLAS giải bài toán này như thế nào?</SectionHeading>
          </motion.div>
          <motion.p variants={fadeUp} style={{ fontSize: "14px", lineHeight: 1.88, color: "rgba(255,255,255,0.50)", fontWeight: 300, maxWidth: "40rem", marginBottom: "2.75rem" }}>
            ATLAS được xây theo mô hình tất cả trong một — không chỉ là marketplace, mà là nền tảng hỗ trợ toàn bộ vòng đời giao dịch.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginBottom: "2.5rem" }}>
            {values.map((v, i) => (
              <motion.div
                key={v.label}
                variants={fadeUp}
                style={CARD_DARK}
                onMouseEnter={hoverLiftDark}
                onMouseLeave={hoverResetDark}
              >
                <span style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.10em", color: "rgba(52,160,140,0.65)", display: "block", marginBottom: "0.5rem" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p style={{ fontSize: "13.5px", fontWeight: 600, color: "rgba(255,255,255,0.88)", marginBottom: "0.375rem", letterSpacing: "-0.008em", lineHeight: 1.25 }}>
                  {v.label}
                </p>
                <p style={{ fontSize: "12.5px", lineHeight: 1.65, color: "rgba(255,255,255,0.38)", fontWeight: 300 }}>
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(52,160,140,0.12)" }}>
            <div style={{ marginTop: "0.35rem", width: "2rem", height: "1.5px", background: "rgba(52,160,140,0.45)", borderRadius: "999px", flexShrink: 0 }} />
            <p style={{ fontSize: "13.5px", fontStyle: "italic", fontWeight: 300, color: "rgba(52,160,140,0.75)", lineHeight: 1.70, margin: 0 }}>
              Zillow giống Google của bất động sản. ATLAS hướng tới một hệ sinh thái số một cửa cho toàn bộ giao dịch.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   4. CORE VALUES (light)
══════════════════════════════════════════════════════════ */
function CoreValuesSection() {
  const blocks = [
    {
      num: "01",
      title: "AI định giá & Bán nhanh",
      body: "ATLAS dùng AI để định giá thông minh và dự báo thời gian thanh khoản. Khi người bán cần thanh khoản gấp, hệ thống có thể đề xuất mức giá tối ưu để rút ngắn thời gian giao dịch trong trường hợp phù hợp.",
    },
    {
      num: "02",
      title: "AI + DLD: lớp bảo vệ kép",
      body: "ATLAS ứng dụng AI để giám sát giao dịch, lọc tin ảo và giảm rủi ro gian lận; đồng thời liên kết với DLD để xác minh quyền sở hữu và kiểm tra thẻ hành nghề môi giới.",
    },
    {
      num: "03",
      title: "Mô hình Success Fee 1%",
      body: "Không thu phí niêm yết ban đầu. Chỉ thu phí khi giao dịch thành công. Điều này giúp doanh thu gắn với kết quả thật và giảm động cơ phí ẩn hay ăn chênh.",
    },
  ];

  return (
    <section className="py-20 sm:py-24" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>
          <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
            <SectionLabel>Giá trị cốt lõi</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp} style={{ marginBottom: "3rem" }}>
            <SectionHeading>3 giá trị cốt lõi của ATLAS</SectionHeading>
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {blocks.map((b) => (
              <motion.div
                key={b.num}
                variants={fadeUp}
                style={CARD_LIGHT}
                onMouseEnter={hoverLift}
                onMouseLeave={hoverReset}
              >
                <NumMarker num={b.num} />
                <h3 style={{ fontSize: "16px", fontWeight: 600, letterSpacing: "-0.014em", color: "hsl(var(--foreground))", marginBottom: "0.75rem", lineHeight: 1.25 }}>
                  {b.title}
                </h3>
                <p style={{ fontSize: "14px", lineHeight: 1.88, color: "hsl(var(--foreground) / 0.50)", fontWeight: 400 }}>
                  {b.body}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   5. WIN-WIN-WIN (dark)
══════════════════════════════════════════════════════════ */
function WinWinSection() {
  const parties = [
    {
      role: "Người mua",
      bullets: [
        "Tiếp cận thông tin xác thực hơn",
        "Minh bạch giá và dòng tiền",
        "Có công cụ phân tích để ra quyết định",
        "Chọn môi giới uy tín hơn",
      ],
    },
    {
      role: "Người bán",
      bullets: [
        "Hỗ trợ thanh khoản với Sell Fast",
        "Giảm nguy cơ bị thao túng giá",
        "Số hóa giấy tờ, quy trình gọn hơn",
        "Giảm rủi ro lừa đảo",
      ],
    },
    {
      role: "Môi giới",
      bullets: [
        "Xây dựng danh tiếng chuyên nghiệp",
        "Nhận nguồn khách hàng tiềm năng",
        "Làm việc trong môi trường chính quy hơn",
        "Có hệ thống tập trung để quản lý giao dịch",
      ],
    },
  ];

  return (
    <section className="py-20 sm:py-24" style={{ background: DARK_BG_B }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>
          <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
            <SectionLabel dark>Mô hình ba bên</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp} style={{ marginBottom: "3rem" }}>
            <SectionHeading dark>Mô hình win-win-win cho 3 bên</SectionHeading>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {parties.map((p) => (
              <motion.div
                key={p.role}
                variants={fadeUp}
                style={CARD_DARK}
                onMouseEnter={hoverLiftDark}
                onMouseLeave={hoverResetDark}
              >
                <h3 style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.012em", color: "rgba(255,255,255,0.90)", marginBottom: "1.125rem" }}>
                  {p.role}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {p.bullets.map((b) => (
                    <div key={b} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                      <Dot dark />
                      <span style={{ fontSize: "13.5px", lineHeight: 1.72, color: "rgba(255,255,255,0.52)", fontWeight: 300 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   6. UAE OPPORTUNITY (light)
══════════════════════════════════════════════════════════ */
function UAESection() {
  const blocks = [
    { title: "Quy mô thị trường lớn", body: "UAE là một trong những thị trường bất động sản sôi động nhất thế giới với dòng vốn quốc tế liên tục." },
    { title: "Tăng trưởng nhanh", body: "Số lượng giao dịch và giá trị tài sản tăng mạnh, kéo theo nhu cầu về hạ tầng số và minh bạch thông tin." },
    { title: "Điểm ngọt để chứng minh mô hình", body: "Phương thức giao dịch còn thủ công và manh mún — đây là lợi thế cạnh tranh lý tưởng để ATLAS chứng minh giá trị." },
  ];

  return (
    <section className="py-20 sm:py-24" style={{ background: "hsl(var(--muted) / 0.35)" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>
          <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
            <SectionLabel>Thị trường trọng điểm</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp} style={{ marginBottom: "0.875rem" }}>
            <SectionHeading>Vì sao UAE là thị trường trọng điểm?</SectionHeading>
          </motion.div>
          <motion.p variants={fadeUp} style={{ fontSize: "14px", lineHeight: 1.88, color: "hsl(var(--foreground) / 0.50)", fontWeight: 400, maxWidth: "40rem", marginBottom: "2.75rem" }}>
            ATLAS chọn UAE vì đây là một thị trường tăng trưởng nhanh, quy mô lớn nhưng phương thức giao dịch còn thủ công, manh mún và thiếu minh bạch.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" style={{ marginBottom: "2.5rem" }}>
            {blocks.map((b, i) => (
              <motion.div key={b.title} variants={fadeUp} style={CARD_LIGHT} onMouseEnter={hoverLift} onMouseLeave={hoverReset}>
                <NumMarker num={String(i + 1).padStart(2, "0")} />
                <h3 style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.012em", color: "hsl(var(--foreground))", marginBottom: "0.625rem" }}>{b.title}</h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.82, color: "hsl(var(--foreground) / 0.50)", fontWeight: 400 }}>{b.body}</p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", padding: "1.25rem 1.5rem", borderRadius: "0.75rem", border: "1px solid hsl(var(--primary) / 0.14)", background: "hsl(var(--primary) / 0.04)" }}>
            <div style={{ marginTop: "0.38rem", width: "2rem", height: "1.5px", background: "hsl(var(--primary) / 0.45)", borderRadius: "999px", flexShrink: 0 }} />
            <p style={{ fontSize: "13.5px", fontStyle: "italic", fontWeight: 400, color: "hsl(var(--primary) / 0.82)", lineHeight: 1.68, margin: 0 }}>
              Mục tiêu định hướng là chiếm 3–5% thị phần trong 2 năm đầu tại UAE.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   7. ROADMAP (dark)
══════════════════════════════════════════════════════════ */
function RoadmapSection() {
  const stages = [
    {
      num: "Giai đoạn 1",
      title: "Xây dựng & chứng minh mô hình tại UAE",
      body: "Tập trung sản phẩm lõi, xây phiên bản hoạt động đầu tiên và chứng minh mô hình ở quy mô nhỏ.",
    },
    {
      num: "Giai đoạn 2",
      title: "Mở rộng tài sản & nâng cấp AI",
      body: "Mở rộng người dùng, mở rộng danh mục tài sản và cập nhật thêm chức năng khi mô hình vận hành tốt.",
    },
    {
      num: "Giai đoạn 3",
      title: "Quốc tế hóa",
      body: "Mở rộng sang các thị trường như Singapore, Hồng Kông, Pháp và Anh khi nền tảng đã được kiểm chứng.",
    },
  ];

  return (
    <section className="py-20 sm:py-24" style={{ background: DARK_BG_A }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>
          <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
            <SectionLabel dark>Lộ trình</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp} style={{ marginBottom: "3rem" }}>
            <SectionHeading dark>Lộ trình phát triển 3 giai đoạn</SectionHeading>
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {stages.map((s, i) => (
              <motion.div
                key={s.num}
                variants={fadeUp}
                style={{ display: "flex", gap: "1.5rem", paddingBottom: i < stages.length - 1 ? "2rem" : 0, position: "relative" }}
              >
                {/* Timeline line */}
                {i < stages.length - 1 && (
                  <div style={{ position: "absolute", left: "21px", top: "2.25rem", bottom: 0, width: "1px", background: "rgba(52,160,140,0.20)" }} />
                )}
                {/* Circle */}
                <div style={{ flexShrink: 0, width: "44px", height: "44px", borderRadius: "50%", border: "1px solid rgba(52,160,140,0.30)", background: "rgba(52,160,140,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(52,160,140,0.80)", letterSpacing: "0.04em" }}>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div style={{ paddingTop: "0.625rem", flex: 1 }}>
                  <span style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(52,160,140,0.65)", display: "block", marginBottom: "0.375rem" }}>
                    {s.num}
                  </span>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "rgba(255,255,255,0.90)", letterSpacing: "-0.012em", marginBottom: "0.625rem", lineHeight: 1.28 }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: "13.5px", lineHeight: 1.82, color: "rgba(255,255,255,0.46)", fontWeight: 300 }}>
                    {s.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   8. TEAM (light)
══════════════════════════════════════════════════════════ */
function TeamSection() {
  const team = [
    {
      name: "Evgenii & Alexey",
      role: "Đồng sáng lập · Đồng sở hữu",
      note: "Hai người đồng sáng lập có vai trò khởi tạo và đồng sở hữu toàn bộ hệ sinh thái ATLAS.",
    },
    {
      name: "Leo",
      role: "CDO",
      note: "Kinh nghiệm sâu về bất động sản và mạng lưới môi giới. Phụ trách định hướng và thiết kế sản phẩm số.",
    },
    {
      name: "Anatoli Uzlov",
      role: "CEO SWC",
      note: "Phụ trách logic hệ thống, chiến lược tổng thể và tích hợp hệ sinh thái SWC với ATLAS.",
    },
    {
      name: "Đội ngũ mở rộng",
      role: "Chuyên gia & Đối tác",
      note: "Bao gồm chuyên gia thẩm định, pháp lý, kỹ thuật và triển khai tại thị trường UAE.",
    },
  ];

  return (
    <section className="py-20 sm:py-24" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>
          <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
            <SectionLabel>Đội ngũ</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp} style={{ marginBottom: "0.875rem" }}>
            <SectionHeading>Ai đứng sau dự án?</SectionHeading>
          </motion.div>
          <motion.p variants={fadeUp} style={{ fontSize: "14px", lineHeight: 1.88, color: "hsl(var(--foreground) / 0.50)", fontWeight: 400, maxWidth: "38rem", marginBottom: "3rem" }}>
            ATLAS được xây bởi những người có da thịt với thị trường — không phải chỉ là ý tưởng trên giấy.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {team.map((t) => (
              <motion.div key={t.name} variants={fadeUp} style={CARD_LIGHT} onMouseEnter={hoverLift} onMouseLeave={hoverReset}>
                <p style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(var(--primary) / 0.65)", marginBottom: "0.375rem" }}>
                  {t.role}
                </p>
                <h3 style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.012em", color: "hsl(var(--foreground))", marginBottom: "0.625rem", lineHeight: 1.28 }}>
                  {t.name}
                </h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.82, color: "hsl(var(--foreground) / 0.50)", fontWeight: 400 }}>
                  {t.note}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   9. INVESTOR PROTECTION (dark)
══════════════════════════════════════════════════════════ */
function InvestorProtectionSection() {
  const blocks = [
    {
      title: "Hoàn tiền 100%",
      body: "Nếu vòng huy động vốn không đạt chỉ tiêu tài chính ban đầu, toàn bộ số tiền đã đóng góp sẽ được hoàn lại.",
    },
    {
      title: "Due diligence nhiều tầng",
      body: "Quy trình thẩm định độc lập qua nhiều lớp — pháp lý, tài chính, kỹ thuật — trước khi bất kỳ dòng vốn nào được giải ngân.",
    },
    {
      title: "Skin-in-the-game của nhà sáng lập",
      body: "Đội sáng lập tham gia vốn cùng nhà đầu tư. Lợi ích và rủi ro được chia sẻ chung từ đầu.",
    },
    {
      title: "Minh bạch 3 vòng gọi vốn",
      body: "Cấu trúc 3 vòng rõ ràng với mục tiêu, điều kiện và cột mốc cụ thể cho từng giai đoạn.",
    },
    {
      title: "Tư vấn không áp lực",
      body: "Không có bất kỳ cơ chế thúc ép hay deadline nhân tạo. Mọi quyết định đều xuất phát từ sự tìm hiểu đầy đủ.",
    },
  ];

  return (
    <section className="py-20 sm:py-24" style={{ background: DARK_BG_B }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>
          <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
            <SectionLabel dark>Bảo vệ nhà đầu tư</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp} style={{ marginBottom: "3rem" }}>
            <SectionHeading dark>Cơ chế bảo vệ nhà đầu tư</SectionHeading>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" style={{ marginBottom: "2.25rem" }}>
            {blocks.map((b, i) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                style={{
                  ...CARD_DARK,
                  ...(i === blocks.length - 1 && blocks.length % 2 !== 0
                    ? { gridColumn: "1 / -1" }
                    : {}),
                }}
                onMouseEnter={hoverLiftDark}
                onMouseLeave={hoverResetDark}
              >
                <h3 style={{ fontSize: "14.5px", fontWeight: 600, color: "rgba(255,255,255,0.90)", letterSpacing: "-0.010em", marginBottom: "0.625rem", lineHeight: 1.28 }}>
                  {b.title}
                </h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.85, color: "rgba(255,255,255,0.46)", fontWeight: 300 }}>
                  {b.body}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Disclaimer */}
          <motion.div variants={fadeUp} style={{ padding: "1.25rem 1.5rem", borderRadius: "0.625rem", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}>
            <p style={{ fontSize: "12.5px", lineHeight: 1.75, color: "rgba(255,255,255,0.35)", fontWeight: 300, fontStyle: "italic", margin: 0 }}>
              Nội dung này mang tính chia sẻ góc nhìn và nguyên tắc để anh/chị tham khảo. Mỗi quyết định tham gia hay đầu tư cần dựa trên mục tiêu, khẩu vị rủi ro và sự tìm hiểu độc lập của từng người.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   10. SPV (light)
══════════════════════════════════════════════════════════ */
function SPVSection() {
  const blocks = [
    { title: "Tiếp cận cơ hội lớn", body: "Gộp vốn để nhiều nhà đầu tư nhỏ lẻ cùng tham gia các cơ hội mà thông thường chỉ dành cho tổ chức lớn." },
    { title: "Cách ly rủi ro", body: "Mỗi SPV là một pháp nhân độc lập. Rủi ro từ một dự án không lan sang dự án khác trong cùng hệ sinh thái." },
    { title: "Quyền sở hữu minh bạch", body: "Tỷ lệ sở hữu được ghi nhận rõ ràng theo đóng góp vốn của từng bên, không mập mờ." },
    { title: "Phân phối lợi nhuận theo tỷ lệ", body: "Lợi nhuận được phân phối đúng theo tỷ lệ sở hữu đã thỏa thuận, không có cơ chế ưu tiên ẩn." },
    { title: "Điều hướng theo khu vực pháp lý", body: "Cấu trúc SPV được tối ưu theo từng khu vực pháp lý để đảm bảo tính hợp lệ và hiệu quả thuế." },
  ];

  return (
    <section className="py-20 sm:py-24" style={{ background: "hsl(var(--muted) / 0.30)" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>
          <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
            <SectionLabel>Cấu trúc tham gia</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp} style={{ marginBottom: "0.875rem" }}>
            <SectionHeading>Mô hình SPV là gì?</SectionHeading>
          </motion.div>
          <motion.p variants={fadeUp} style={{ fontSize: "14px", lineHeight: 1.88, color: "hsl(var(--foreground) / 0.50)", fontWeight: 400, maxWidth: "40rem", marginBottom: "3rem" }}>
            Trong hệ sinh thái SWC, ATLAS áp dụng cấu trúc SPV (Special Purpose Vehicle) cho từng sản phẩm đầu tư.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" style={{ marginBottom: "2rem" }}>
            {blocks.map((b, i) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                style={{
                  ...CARD_LIGHT,
                  ...(i === blocks.length - 1 && blocks.length % 2 !== 0
                    ? { gridColumn: "1 / -1" }
                    : {}),
                }}
                onMouseEnter={hoverLift}
                onMouseLeave={hoverReset}
              >
                <NumMarker num={String(i + 1).padStart(2, "0")} />
                <h3 style={{ fontSize: "14.5px", fontWeight: 600, letterSpacing: "-0.010em", color: "hsl(var(--foreground))", marginBottom: "0.5rem" }}>{b.title}</h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.82, color: "hsl(var(--foreground) / 0.50)", fontWeight: 400 }}>{b.body}</p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp}>
            <p style={{ fontSize: "11.5px", fontWeight: 500, letterSpacing: "0.12em", color: "hsl(var(--foreground) / 0.38)", textTransform: "uppercase", textAlign: "center" }}>
              Hoa Kỳ · Châu Âu · Nga · Quốc tế
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   11. FAQ (dark)
══════════════════════════════════════════════════════════ */
function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div style={{ borderBottom: "1px solid rgba(52,160,140,0.12)" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "1.125rem 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: open ? 500 : 400, color: open ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.72)", letterSpacing: "-0.008em", lineHeight: 1.35, transition: "color 0.18s ease" }}>
          {q}
        </span>
        <span style={{
          flexShrink: 0,
          width: "22px", height: "22px",
          borderRadius: "50%",
          border: `1px solid ${open ? "rgba(52,160,140,0.50)" : "rgba(255,255,255,0.14)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: open ? "rgba(52,160,140,0.90)" : "rgba(255,255,255,0.40)",
          transition: "border-color 0.18s ease, color 0.18s ease, transform 0.22s ease",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <line x1="5" y1="1" x2="5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {open && (
        <div style={{ paddingBottom: "1.25rem" }}>
          <p style={{ fontSize: "13.5px", lineHeight: 1.85, color: "rgba(255,255,255,0.48)", fontWeight: 300 }}>
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    {
      q: "Cơ chế bảo vệ nhà đầu tư của ATLAS là gì?",
      a: "ATLAS cam kết hoàn tiền 100% nếu vòng huy động vốn không đạt chỉ tiêu tài chính ban đầu. Bên cạnh đó, quy trình due diligence nhiều tầng và cấu trúc SPV giúp tách biệt rủi ro giữa các dự án, đảm bảo một dự án gặp khó khăn không ảnh hưởng đến toàn bộ danh mục.",
    },
    {
      q: "Mô hình SPV bảo vệ quyền sở hữu như thế nào?",
      a: "Mỗi SPV là một pháp nhân độc lập, tách biệt với các dự án khác trong hệ sinh thái. Quyền sở hữu được ghi nhận minh bạch theo tỷ lệ đóng góp, và lợi nhuận được phân phối đúng theo cơ cấu đã thỏa thuận từ đầu.",
    },
    {
      q: "Tại sao chọn UAE?",
      a: "UAE là thị trường bất động sản tăng trưởng nhanh với quy mô lớn, nhưng quy trình giao dịch còn thủ công và thiếu minh bạch. Đây là điểm ngọt để ATLAS chứng minh mô hình trước khi mở rộng sang Singapore, Hồng Kông và các thị trường quốc tế khác.",
    },
    {
      q: "Mức phí success fee 1% có cạnh tranh không?",
      a: "So với phí niêm yết cố định của các nền tảng truyền thống và hoa hồng môi giới thông thường từ 2–5%, mô hình 1% success fee gắn doanh thu với kết quả thật. Điều này tạo động lực đúng cho tất cả các bên và loại bỏ động cơ phí ẩn hay ăn chênh.",
    },
    {
      q: "Tính năng Sell Fast hoạt động ra sao?",
      a: "Khi người bán cần thanh khoản nhanh, AI của ATLAS phân tích dữ liệu thị trường thời gian thực và đề xuất mức giá tối ưu để rút ngắn thời gian bán. Đây không phải bán tháo — mà là định giá thông minh dựa trên cung cầu thực tế tại thời điểm giao dịch.",
    },
    {
      q: "ATLAS bảo vệ giao dịch qua AI và DLD như thế nào?",
      a: "AI giám sát liên tục để phát hiện tin đăng ảo và hành vi bất thường trong giao dịch. Liên kết với DLD (Dubai Land Department) cho phép xác minh quyền sở hữu và kiểm tra thẻ hành nghề môi giới theo thời gian thực, tạo lớp bảo vệ kép về minh bạch và pháp lý.",
    },
  ];

  return (
    <section className="py-20 sm:py-24" style={{ background: DARK_BG_B }}>
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>
          <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
            <SectionLabel dark>FAQ</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp} style={{ marginBottom: "2.75rem" }}>
            <SectionHeading dark>Câu hỏi thường gặp</SectionHeading>
          </motion.div>

          <motion.div variants={fadeUp}>
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                q={faq.q}
                a={faq.a}
                open={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   12. FINAL CTA (dark)
══════════════════════════════════════════════════════════ */
function FinalCTASection() {
  const [showReg,  setShowReg]  = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [regSent,  setRegSent]  = useState(false);
  const [infoSent, setInfoSent] = useState(false);

  const closeReg  = () => { setShowReg(false);  setTimeout(() => setRegSent(false),  320); };
  const closeInfo = () => { setShowInfo(false); setTimeout(() => setInfoSent(false), 320); };

  /* ── shared token styles ─────────────────────────── */
  const btnPrimary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    height: "44px", padding: "0 28px", borderRadius: "999px",
    fontSize: "14px", fontWeight: 500, letterSpacing: "0.01em",
    border: "none", cursor: "pointer",
    background: "linear-gradient(140deg, #22917f, #1a7868)", color: "#fff",
    boxShadow: "0 4px 18px rgba(26,120,104,0.30)",
    transition: "transform 0.22s ease, box-shadow 0.22s ease",
  };
  const btnGhost: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    height: "44px", padding: "0 24px", borderRadius: "999px",
    fontSize: "14px", fontWeight: 400, letterSpacing: "0.01em",
    background: "transparent", cursor: "pointer",
    border: "1px solid rgba(52,160,140,0.35)", color: "rgba(52,160,140,0.85)",
    transition: "border-color 0.22s ease, color 0.22s ease",
  };
  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(3,12,10,0.84)", backdropFilter: "blur(10px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem",
  };
  const panel: React.CSSProperties = {
    width: "100%", maxWidth: "468px", position: "relative",
    background: "linear-gradient(160deg, #0f2825 0%, #081e1b 100%)",
    border: "1px solid rgba(52,160,140,0.18)", borderRadius: "1rem",
    padding: "2rem 2rem 2.25rem",
    boxShadow: "0 24px 64px rgba(0,0,0,0.50)",
    maxHeight: "90vh", overflowY: "auto",
  };
  const fieldLabel: React.CSSProperties = {
    display: "block", fontSize: "10.5px", fontWeight: 600,
    letterSpacing: "0.12em", textTransform: "uppercase",
    color: "rgba(255,255,255,0.36)", marginBottom: "7px",
  };
  const fieldBase: React.CSSProperties = {
    width: "100%", height: "42px", padding: "0 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.11)", borderRadius: "8px",
    fontSize: "13.5px", fontWeight: 400, color: "rgba(255,255,255,0.84)",
    outline: "none", transition: "border-color 0.22s ease", boxSizing: "border-box" as const,
  };
  const fieldSelect: React.CSSProperties = {
    ...fieldBase, cursor: "pointer", appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.28)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: "36px",
  };
  const fieldTextarea: React.CSSProperties = {
    ...fieldBase, height: "76px", padding: "10px 14px", resize: "vertical" as const, lineHeight: 1.6,
  };
  const submitBtn: React.CSSProperties = {
    ...btnPrimary, width: "100%", height: "46px", fontSize: "14px", marginTop: "0.25rem",
  };
  const closeBtn: React.CSSProperties = {
    position: "absolute", top: "1rem", right: "1rem",
    width: "28px", height: "28px", borderRadius: "50%",
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.46)", display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer", fontSize: "17px", lineHeight: 1,
  };
  const focusBorder  = (e: React.FocusEvent<HTMLElement>) =>
    (e.currentTarget.style.borderColor = "rgba(52,160,140,0.55)");
  const blurBorder   = (e: React.FocusEvent<HTMLElement>) =>
    (e.currentTarget.style.borderColor = "rgba(255,255,255,0.11)");
  const hoverSubmit  = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
    (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,120,104,0.42)";
  };
  const leaveSubmit  = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
    (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(26,120,104,0.30)";
  };

  /* ── shared success state UI ─────────────────────── */
  const SuccessMark = () => (
    <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(52,160,140,0.12)", border: "1px solid rgba(52,160,140,0.28)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3.5 9.5L7 13l7.5-8" stroke="rgba(52,160,140,0.90)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );

  return (
    <>
      {/* ── Section ──────────────────────────────────── */}
      <section id="dang-ky" className="py-20 sm:py-28" style={{ background: DARK_BG_A }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>

            <motion.div variants={fadeUp} style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center" }}>
              <SectionLabel dark>Bước tiếp theo</SectionLabel>
            </motion.div>

            <motion.h2 variants={fadeUp} style={{ fontSize: "clamp(1.65rem, 4vw, 2.25rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.020em", color: "rgba(255,255,255,0.94)", marginBottom: "1.125rem" }}>
              Anh/chị đang quan tâm nhiều hơn ở góc nào?
            </motion.h2>

            <motion.p variants={fadeUp} style={{ fontSize: "14px", lineHeight: 1.88, fontWeight: 300, color: "rgba(255,255,255,0.50)", maxWidth: "34rem", margin: "0 auto 2.25rem" }}>
              Công nghệ & mô hình vận hành, hay cơ chế bảo vệ & cấu trúc tham gia? Nếu anh/chị muốn, có thể bắt đầu bằng việc để lại thông tin để nhận thêm tài liệu phù hợp.
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", marginBottom: "2.5rem" }}>
              <button style={btnPrimary} onClick={() => setShowReg(true)}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,120,104,0.38)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(26,120,104,0.30)"; }}>
                Đăng ký quan tâm
              </button>
              <button style={btnGhost} onClick={() => setShowInfo(true)}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.60)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.35)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,0.85)"; }}>
                Nhận thông tin
              </button>
            </motion.div>

            <motion.p variants={fadeUp} style={{ fontSize: "13px", fontStyle: "italic", fontWeight: 300, color: "rgba(255,255,255,0.30)", lineHeight: 1.7 }}>
              Không phải mọi cơ hội đều phù hợp với mọi người. Điều quan trọng là hiểu rõ trước khi quyết định.
            </motion.p>

          </motion.div>
        </div>
      </section>

      {/* ── Registration Modal (high-intent) ─────────── */}
      {showReg && (
        <div style={overlay} onClick={closeReg}>
          <div style={panel} onClick={e => e.stopPropagation()}>
            <button style={closeBtn} onClick={closeReg} aria-label="Đóng">×</button>

            {regSent ? (
              <div style={{ textAlign: "center", padding: "2rem 0.5rem" }}>
                <SuccessMark />
                <p style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.90)", marginBottom: "0.75rem" }}>Chúng tôi đã nhận được thông tin</p>
                <p style={{ fontSize: "13.5px", fontWeight: 300, lineHeight: 1.82, color: "rgba(255,255,255,0.46)", maxWidth: "26rem", margin: "0 auto 1.75rem" }}>
                  Cảm ơn anh/chị đã dành thời gian. Đội ngũ ATLAS sẽ liên hệ trong thời gian sớm nhất để trao đổi thêm.
                </p>
                <button style={{ ...btnGhost, width: "100%" }} onClick={closeReg}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.60)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,1)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.35)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,0.85)"; }}>
                  Đóng
                </button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(52,160,140,0.68)", marginBottom: "0.5rem" }}>ATLAS · Đăng ký</p>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "rgba(255,255,255,0.92)", marginBottom: "1.75rem", lineHeight: 1.25 }}>
                  Đăng ký quan tâm đến ATLAS
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                  <div>
                    <label style={fieldLabel}>Họ và tên</label>
                    <input type="text" placeholder="Nguyễn Văn A" style={fieldBase} onFocus={focusBorder} onBlur={blurBorder} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Email</label>
                    <input type="email" placeholder="email@example.com" style={fieldBase} onFocus={focusBorder} onBlur={blurBorder} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Số điện thoại / Zalo</label>
                    <input type="tel" placeholder="09xx xxx xxx" style={fieldBase} onFocus={focusBorder} onBlur={blurBorder} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Mối quan tâm chính</label>
                    <select style={fieldSelect} defaultValue="" onFocus={focusBorder} onBlur={blurBorder}>
                      <option value="" disabled>Chọn mối quan tâm...</option>
                      <option value="buy">Tìm hiểu mua / thuê bất động sản</option>
                      <option value="sell">Đăng bán / cho thuê bất động sản</option>
                      <option value="invest">Đầu tư hoặc hợp tác</option>
                      <option value="general">Tìm hiểu chung về ATLAS</option>
                    </select>
                  </div>
                  <div>
                    <label style={fieldLabel}>
                      Ghi chú thêm{" "}
                      <span style={{ fontSize: "9px", fontWeight: 400, opacity: 0.55, letterSpacing: "0.05em" }}>(không bắt buộc)</span>
                    </label>
                    <textarea placeholder="Anh/chị muốn chia sẻ thêm điều gì..." style={fieldTextarea} onFocus={focusBorder} onBlur={blurBorder} />
                  </div>
                  <button style={submitBtn} onClick={() => setRegSent(true)} onMouseEnter={hoverSubmit} onMouseLeave={leaveSubmit}>
                    Gửi đăng ký
                  </button>
                  <p style={{ fontSize: "11.5px", fontWeight: 300, color: "rgba(255,255,255,0.26)", textAlign: "center", lineHeight: 1.65 }}>
                    Thông tin của anh/chị được bảo mật và chỉ dùng để liên hệ về ATLAS.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Info Modal (low-friction) ─────────────────── */}
      {showInfo && (
        <div style={overlay} onClick={closeInfo}>
          <div style={panel} onClick={e => e.stopPropagation()}>
            <button style={closeBtn} onClick={closeInfo} aria-label="Đóng">×</button>

            {infoSent ? (
              <div style={{ textAlign: "center", padding: "2rem 0.5rem" }}>
                <SuccessMark />
                <p style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.90)", marginBottom: "0.75rem" }}>Đã ghi nhận</p>
                <p style={{ fontSize: "13.5px", fontWeight: 300, lineHeight: 1.82, color: "rgba(255,255,255,0.46)", maxWidth: "26rem", margin: "0 auto 1.75rem" }}>
                  Tài liệu phù hợp sẽ được gửi đến email của anh/chị. Cảm ơn đã quan tâm đến ATLAS.
                </p>
                <button style={{ ...btnGhost, width: "100%" }} onClick={closeInfo}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.60)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,1)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.35)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,0.85)"; }}>
                  Đóng
                </button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(52,160,140,0.68)", marginBottom: "0.5rem" }}>ATLAS · Thông tin</p>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "rgba(255,255,255,0.92)", marginBottom: "0.75rem", lineHeight: 1.25 }}>
                  Nhận thêm thông tin về ATLAS
                </h3>
                <p style={{ fontSize: "13.5px", fontWeight: 300, lineHeight: 1.78, color: "rgba(255,255,255,0.44)", marginBottom: "1.75rem" }}>
                  Để lại email và chủ đề anh/chị muốn tìm hiểu. Chúng tôi sẽ gửi tài liệu phù hợp — không spam, không quảng cáo.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                  <div>
                    <label style={fieldLabel}>Email</label>
                    <input type="email" placeholder="email@example.com" style={fieldBase} onFocus={focusBorder} onBlur={blurBorder} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Chủ đề muốn nhận thêm thông tin</label>
                    <select style={fieldSelect} defaultValue="" onFocus={focusBorder} onBlur={blurBorder}>
                      <option value="" disabled>Chọn chủ đề...</option>
                      <option value="tech">Công nghệ & mô hình vận hành</option>
                      <option value="legal">Cơ chế bảo vệ & pháp lý</option>
                      <option value="spv">Cấu trúc SPV & đầu tư</option>
                      <option value="roadmap">Lộ trình phát triển</option>
                      <option value="all">Tổng quan về ATLAS</option>
                    </select>
                  </div>
                  <button style={submitBtn} onClick={() => setInfoSent(true)} onMouseEnter={hoverSubmit} onMouseLeave={leaveSubmit}>
                    Nhận thông tin
                  </button>
                  <p style={{ fontSize: "11.5px", fontWeight: 300, color: "rgba(255,255,255,0.26)", textAlign: "center", lineHeight: 1.65 }}>
                    Không spam. Thông tin chỉ dùng để gửi tài liệu theo chủ đề đã chọn.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE EXPORT
══════════════════════════════════════════════════════════ */
export default function ProductAtlas() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <CoreValuesSection />
      <WinWinSection />
      <UAESection />
      <RoadmapSection />
      <TeamSection />
      <InvestorProtectionSection />
      <SPVSection />
      <FAQSection />
      <FinalCTASection />
    </>
  );
}
