/** Match the public Host too: Next can normalize the development URL to localhost. */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const requestUrl = new URL(request.url);
    const host = request.headers.get("host");
    const allowed = new Set([requestUrl.origin]);
    if (host) allowed.add(`${requestUrl.protocol}//${host}`);
    return allowed.has(new URL(origin).origin);
  } catch {
    return false;
  }
}
