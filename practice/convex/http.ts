import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./betterAuth/auth";

const http = httpRouter();

// Register Better Auth HTTP routes
authComponent.registerRoutes(http, createAuth, { cors: true });

// Browser-initiated Google OAuth flow.
// Uses fetch() with JSON to call Better Auth's sign-in endpoint (which only
// accepts application/json). The state cookie gets set via Set-Cookie header
// on the response, and fetch() with credentials:"include" ensures the browser
// processes it. Then we navigate to Google via window.location.
http.route({
  path: "/api/auth/google",
  method: "GET",
  handler: httpAction(async () => {
    const html = `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Signing in...</title></head><body>
<p style="text-align:center;margin-top:40px;font-family:sans-serif">Signing in with Google...</p>
<script>
fetch("/api/auth/sign-in/social", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  credentials: "include",
  body: JSON.stringify({
    provider: "google",
    callbackURL: "https://dapper-loris-122.convex.site/api/auth/redirect-to-app"
  })
}).then(r => {
  if (r.ok) return r.json();
  throw new Error("Sign-in failed: " + r.status);
}).then(data => {
  var url = data.url || (data.data && data.data.url) || data.redirect;
  if (url) {
    window.location.href = url;
  } else {
    document.body.innerHTML = '<p style="text-align:center;color:red">No redirect URL</p><pre>' + JSON.stringify(data) + '</pre>';
  }
}).catch(e => {
  document.body.innerHTML = '<p style="text-align:center;color:red">Error: ' + e.message + '</p>';
});
</script>
</body></html>`;
    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }),
});

// After OAuth completes, the browser lands here with HttpOnly cookies.
// Extract tokens server-side and redirect to the native app via deep link.
http.route({
  path: "/api/auth/redirect-to-app",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const cookieHeader = request.headers.get("cookie") || "";

    const stMatch = cookieHeader.match(/__Secure-better-auth\.session_token=([^;]+)/);
    const sessionToken = stMatch ? decodeURIComponent(stMatch[1]) : "";

    const jwtMatch = cookieHeader.match(/__Secure-better-auth\.convex_jwt=([^;]+)/);
    const convexJwt = jwtMatch ? decodeURIComponent(jwtMatch[1]) : "";

    if (!sessionToken || !convexJwt) {
      return new Response(
        `<html><body style="text-align:center;padding-top:40px;font-family:sans-serif">
          <p style="color:red">Authentication failed — no session cookies found.</p>
          <p>Please close this tab and try again.</p>
        </body></html>`,
        { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    const params = new URLSearchParams({ st: sessionToken, jwt: convexJwt });
    const deepLink = `practice://auth/callback?${params.toString()}`;

    const html = `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Redirecting to app...</title></head><body>
<p style="text-align:center;margin-top:40px;font-family:sans-serif">Redirecting to app...</p>
<script>window.location.href = "${deepLink}";</script>
<noscript><p>Please <a href="${deepLink}">click here</a> to return to the app.</p></noscript>
</body></html>`;
    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }),
});

export default http;
