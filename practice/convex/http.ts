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
<p style="text-align:center;margin-top:40px;font-family:sans-serif">Initiating Google Sign-in...</p>
<div id="status" style="text-align:center;font-size:12px;color:#666">Contacting auth server...</div>
<script>
console.log("Initiating fetch to /api/auth/sign-in/social");
fetch("/api/auth/sign-in/social", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  credentials: "include",
  body: JSON.stringify({
    provider: "google",
    callbackURL: window.location.origin + "/api/auth/redirect-to-app"
  })
}).then(r => {
  console.log("Fetch response status:", r.status);
  if (r.ok) return r.json();
  return r.text().then(text => {
    throw new Error("Sign-in failed (" + r.status + "): " + text);
  });
}).then(data => {
  console.log("Fetch success, data received");
  var url = data.url || (data.data && data.data.url) || data.redirect;
  if (url) {
    document.getElementById("status").innerText = "Redirecting to Google...";
    window.location.href = url;
  } else {
    document.body.innerHTML = '<p style="text-align:center;color:red">No redirect URL received from auth provider.</p><pre style="font-size:10px;overflow:auto;padding:10px;background:#eee">' + JSON.stringify(data, null, 2) + '</pre>';
  }
}).catch(e => {
  console.error("Fetch error:", e);
  document.body.innerHTML = '<p style="text-align:center;color:red">Error: ' + e.message + '</p><p style="text-align:center"><button onclick="window.location.reload()">Retry</button></p>';
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
    console.log("Cookie header:", cookieHeader);

    // Look for session token with and without __Secure prefix.
    // We capture the FULL token string (including any signature after a dot).
    const stMatch = cookieHeader.match(/(?:__Secure-)?better-auth\.session_token=([^;]+)/);
    const sessionToken = stMatch ? decodeURIComponent(stMatch[1]) : "";
    
    // Look for convex JWT
    const jwtMatch = cookieHeader.match(/(?:__Secure-)?better-auth\.convex_jwt=([^;]+)/);
    const convexJwt = jwtMatch ? decodeURIComponent(jwtMatch[1]) : "";

    console.log("Extracted sessionToken:", sessionToken ? "EXISTS" : "MISSING");
    console.log("Extracted convexJwt:", convexJwt ? "EXISTS" : "MISSING");

    if (!sessionToken || !convexJwt) {
      console.error("Auth failed: Missing cookies. Found:", { 
        hasSession: !!sessionToken, 
        hasJwt: !!convexJwt 
      });
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
