import React, { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { emailApi } from "@/lib/newsApi";

type State = "loading" | "success" | "already" | "error";

export default function HuyDangKy() {
  const search  = useSearch();
  const token   = new URLSearchParams(search).get("token") ?? "";
  const [state, setState] = useState<State>("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrMsg("Liên kết không hợp lệ.");
      return;
    }
    emailApi.unsubscribe(token)
      .then((res) => {
        if (res.ok) {
          setEmail(res.email ?? null);
          setState((res as { alreadyUnsubscribed?: boolean }).alreadyUnsubscribed ? "already" : "success");
        } else {
          setState("error");
          setErrMsg(res.error ?? "Có lỗi xảy ra.");
        }
      })
      .catch(() => {
        setState("error");
        setErrMsg("Không thể kết nối. Vui lòng thử lại.");
      });
  }, [token]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        background: "hsl(var(--background))",
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
          padding: "3rem 2.5rem",
          borderRadius: "16px",
          border: "1px solid hsl(var(--border) / 0.7)",
          background: "hsl(var(--card))",
          boxShadow: "0 4px 24px rgba(10,40,35,0.06)",
        }}
      >
        {state === "loading" && (
          <div>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "2.5px solid hsl(var(--primary) / 0.18)",
                borderTopColor: "hsl(var(--primary))",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 1.25rem",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p
              style={{
                fontSize: "14px",
                color: "hsl(var(--muted-foreground))",
                margin: 0,
              }}
            >
              Đang xử lý...
            </p>
          </div>
        )}

        {state === "success" && (
          <div>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "hsl(var(--primary) / 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.375rem",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "hsl(var(--foreground))",
                margin: "0 0 0.75rem",
                letterSpacing: "-0.016em",
              }}
            >
              Đã huỷ đăng ký thành công
            </h1>
            {email && (
              <p
                style={{
                  fontSize: "13.5px",
                  color: "hsl(var(--muted-foreground))",
                  margin: "0 0 0.5rem",
                  lineHeight: 1.7,
                }}
              >
                Địa chỉ <strong style={{ color: "hsl(var(--foreground))" }}>{email}</strong> sẽ không còn nhận email từ chúng tôi.
              </p>
            )}
            <p
              style={{
                fontSize: "13px",
                color: "hsl(var(--muted-foreground) / 0.75)",
                margin: "0 0 2rem",
                lineHeight: 1.7,
              }}
            >
              Anh/chị có thể đăng ký lại bất kỳ lúc nào nếu muốn nhận cập nhật.
            </p>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "2.5rem",
                padding: "0 1.5rem",
                borderRadius: "999px",
                background: "hsl(var(--primary))",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
                letterSpacing: "0.01em",
              }}
            >
              Về trang chủ
            </a>
          </div>
        )}

        {state === "already" && (
          <div>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.045)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.375rem",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="hsl(var(--muted-foreground) / 0.55)" strokeWidth="2"/>
                <path d="M12 8v5" stroke="hsl(var(--muted-foreground) / 0.55)" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="0.8" fill="hsl(var(--muted-foreground) / 0.55)"/>
              </svg>
            </div>
            <h1
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "hsl(var(--foreground))",
                margin: "0 0 0.75rem",
                letterSpacing: "-0.016em",
              }}
            >
              Đã huỷ đăng ký trước đó
            </h1>
            <p
              style={{
                fontSize: "13.5px",
                color: "hsl(var(--muted-foreground))",
                margin: "0 0 2rem",
                lineHeight: 1.7,
              }}
            >
              {email ? `${email} đã` : "Email này đã"} được huỷ đăng ký trước đó. Không cần thực hiện thêm thao tác nào.
            </p>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "2.5rem",
                padding: "0 1.5rem",
                borderRadius: "999px",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Về trang chủ
            </a>
          </div>
        )}

        {state === "error" && (
          <div>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "rgba(220,38,38,0.07)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.375rem",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v5" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="17" r="0.8" fill="#dc2626"/>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#dc2626" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "hsl(var(--foreground))",
                margin: "0 0 0.75rem",
                letterSpacing: "-0.016em",
              }}
            >
              Không thể xử lý yêu cầu
            </h1>
            <p
              style={{
                fontSize: "13.5px",
                color: "hsl(var(--muted-foreground))",
                margin: "0 0 2rem",
                lineHeight: 1.7,
              }}
            >
              {errMsg ?? "Liên kết huỷ đăng ký không hợp lệ hoặc đã hết hạn."}
            </p>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "2.5rem",
                padding: "0 1.5rem",
                borderRadius: "999px",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Về trang chủ
            </a>
          </div>
        )}
      </div>

      <p
        style={{
          marginTop: "1.5rem",
          fontSize: "12px",
          color: "hsl(var(--muted-foreground) / 0.6)",
          textAlign: "center",
        }}
      >
        Phan Van Thang SWC
      </p>
    </div>
  );
}
