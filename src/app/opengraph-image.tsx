import { ImageResponse } from "next/og";
import { invitation } from "@/config/invitation";

export const alt = "Abdul Hameed and Heeba — Nikah invitation, 3 January 2027";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#f9f0e0", padding: 35 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", border: "2px solid #b48c3d", borderRadius: "220px 220px 12px 12px", background: "#5a0f1b", color: "#f9f0e0", gap: 20 }}>
        <div style={{ display: "flex", fontSize: 23, letterSpacing: 8, color: "#d6b878" }}>NIKAH INVITATION</div>
        <div style={{ display: "flex", fontSize: 65 }}>{invitation.couple.first} &amp; {invitation.couple.second}</div>
        <div style={{ display: "flex", fontSize: 28 }}>{invitation.weekday}, {invitation.fullDate}</div>
        <div style={{ display: "flex", fontSize: 26 }}>{invitation.schedule.map((event) => `${event.label} · ${event.time}`).join(" | ")}</div>
        <div style={{ display: "flex", fontSize: 27, color: "#d6b878" }}>{invitation.hometown}</div>
      </div>
    </div>, size,
  );
}
