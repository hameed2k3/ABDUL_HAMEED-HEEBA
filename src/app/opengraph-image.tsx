import { ImageResponse } from "next/og";
import { invitation } from "@/config/invitation";

export const alt = "Abdul Hameed and Heeba — Nikah invitation, 3 January 2027";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#f5eddd", padding: 35 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", border: "2px solid #b58189", borderRadius: "220px 220px 12px 12px", background: "#6b1025", color: "#f5eddd", gap: 20 }}>
        <div style={{ display: "flex", fontSize: 23, letterSpacing: 8, color: "#ead2be" }}>NIKAH INVITATION</div>
        <div style={{ display: "flex", fontSize: 65 }}>{invitation.couple.first} &amp; {invitation.couple.second}</div>
        <div style={{ display: "flex", fontSize: 28 }}>{invitation.weekday}, {invitation.fullDate}</div>
        <div style={{ display: "flex", fontSize: 26 }}>{invitation.schedule.map((event) => `${event.label} · ${event.time}`).join(" | ")}</div>
        <div style={{ display: "flex", fontSize: 27, color: "#ead2be" }}>{invitation.hometown}</div>
      </div>
    </div>, size,
  );
}
