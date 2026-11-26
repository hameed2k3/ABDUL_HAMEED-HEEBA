import { existsSync } from "node:fs";
import path from "node:path";

/** Avoid Windows executable path limits in deeply nested checkouts. */
export function browserOptions(): { browserExecutable?: string; chromeMode?: "chrome-for-testing" } {
  const requested = process.env.REMOTION_BROWSER_EXECUTABLE;
  if (requested) {
    if (!existsSync(requested)) throw new Error("REMOTION_BROWSER_EXECUTABLE does not exist");
    return { browserExecutable: requested, chromeMode: "chrome-for-testing" };
  }
  if (process.platform === "win32") {
    const chrome = path.join(process.env.ProgramFiles || "C:/Program Files", "Google/Chrome/Application/chrome.exe");
    if (existsSync(chrome)) return { browserExecutable: chrome, chromeMode: "chrome-for-testing" };
  }
  return {};
}
