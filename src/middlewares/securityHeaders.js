/**
 * Baseline security response headers.
 *
 * Dependency-free on purpose: this sets the same headers Helmet would set
 * for a JSON API, without adding a package.
 *
 * Deliberately NOT set:
 *   - Content-Security-Policy: this process serves JSON only. A CSP here
 *     protects nothing and risks breaking the browser frontend and any
 *     future admin page, so it is left to the frontend host.
 *   - Cross-Origin-Resource-Policy: the default (unset) keeps the existing
 *     cross-origin API access working. CORS is handled separately.
 */

// Disable browser features this API has no use for. Kept short so it stays
// readable; an empty allowlist "()" means "no origin may use this".
const PERMISSIONS_POLICY = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "payment=()",
  "usb=()",
].join(", ");

// True when the request reached us over HTTPS, including through a proxy
// or load balancer that terminates TLS and forwards X-Forwarded-Proto.
const isHttps = (req) => {
  if (req.secure) return true;

  const forwarded = req.headers["x-forwarded-proto"];

  if (typeof forwarded !== "string") return false;

  // A proxy chain can send a comma-separated list; the first entry is the
  // protocol the client actually used.
  return forwarded.split(",")[0].trim().toLowerCase() === "https";
};

export const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", PERMISSIONS_POLICY);

  // Only advertise HSTS on connections that are already HTTPS. Sending it
  // over plain HTTP is ignored by browsers, and sending it from a local
  // HTTP dev server would pin localhost to HTTPS in the developer's
  // browser and break local work.
  if (isHttps(req)) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=15552000; includeSubDomains"
    );
  }

  next();
};

export default securityHeaders;
