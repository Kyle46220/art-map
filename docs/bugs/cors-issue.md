CORS recap  
• Cytoscape draws node‐backgrounds on an HTML5 canvas.  
• When that canvas contains a bitmap that was fetched from another origin, the browser “taints” the canvas unless the image response carried an  Access-Control-Allow-Origin header that matches the page.  
• Most art or museum sites do **not** send that header, so the canvas is tainted and Cytoscape silently discards the image → empty nodes.  
• Our current dev hack – `vite.config.js` proxying only `https://images.saatchiart.com` – fixes one host but fails everywhere else.

What a robust fix must do  
1. Fetch the image from *any* domain.  
2. Relay it back to the browser with the header  
   `Access-Control-Allow-Origin: *` (and optionally `Access-Control-Allow-Credentials: false`).  
3. Preserve the original `Content-Type` (`image/jpeg`, `image/png`, …).  
4. Work in dev **and** production, at zero/minimal cost.

Three viable approaches
──────────────────────

A) Use a public image-proxy CDN (quick & effortless)  
   Example: `https://images.weserv.nl/?url=<encoded_source_url>`  
   • Adds CORS headers automatically.  
   • Free up to ~ 5 M requests / month, supports HTTPS, caching, resizing.  
   • Downside: external service outside your control, ToS prohibits excessive volume or hot-linking copyrighted images.  
   • Code change:  
     ```js
     const proxify = (u) =>
       `https://images.weserv.nl/?url=${encodeURIComponent(u)}`;
     // later
     imageUrl = proxify(rawImageUrl);
     ```  
   • **Fastest** path if legal/volume requirements are modest.

B) Self-host a tiny proxy on Cloudflare Workers or Fly.io (recommended)  
   • <50 LOC, global edge network, free tier handles ~100 K requests / day.  
   • Completely under your control; can add caching, resizing, logging later.  

   Worker code (deploy at e.g. https://img.your-domain.xyz):
   ```js
   export default {
     async fetch(req) {
       const url = new URL(req.url).searchParams.get('url')
       if (!url) return new Response('Missing url', { status: 400 })

       const imgResp = await fetch(url, { cf: { cacheEverything: true } })
       const headers = new Headers(imgResp.headers)
       headers.set('Access-Control-Allow-Origin', '*')
       headers.set('Access-Control-Allow-Credentials', 'false')
       return new Response(imgResp.body, { status: imgResp.status, headers })
     }
   }
   ```

   Usage in the app:  
   ```js
   const proxify = (u) => `https://img.your-domain.xyz/?url=${encodeURIComponent(u)}`
   node.data.image = proxify(imageUrlFromGoogle)
   ```

   Dev-server convenience: keep a Vite proxy so local builds work offline:
   ```js
   // vite.config.js
   server: {
     port: 3000,
     proxy: {
       '/proxy': {
         target: 'https://img.your-domain.xyz',
         changeOrigin: true,
         rewrite: (p) => p.replace(/^\/proxy\//, '') // /proxy/<rest>
       }
     }
   }
   ```
   In code call `/proxy/?url=` during dev; in prod call the worker directly.

C) Run an Express micro-service and deploy beside the React app  
   • Adds an extra container / Lambda.  
   • Same idea as (B) but lives wherever you host the site.  
   • Slightly more maintenance; not edge-cached unless you add a CDN.

Minimal code touches (works with any of the above)
──────────────────────────────────────────────────
1. Helper:
   ```js
   // src/utils/proxyImage.js
   export const proxyImage = (url) =>
     import.meta.env.PROD
       ? `https://img.your-domain.xyz/?url=${encodeURIComponent(url)}`
       : `/proxy/?url=${encodeURIComponent(url)}`;
   ```
2. In `getArtistImage` (or right after Google returns the raw link):
   ```js
   const raw = response.data.items[0].link
   return proxyImage(raw)
   ```
3. In your Cytoscape stylesheet add (already allowed by Cytoscape v3.23+):
   ```js
   'background-image-crossorigin': 'anonymous',
   ```
   This tells the renderer to request the image with the `crossOrigin` flag, completing the CORS handshake once the proxy adds the header.

Recommendation
──────────────
Use **option B** (Cloudflare Worker). It is free, serverless, globally cached, and you keep control (important if the app ever scales or needs GDPR/DMCA compliance). The dev-time Vite proxy keeps your current `/proxy/...` pattern intact, so only a couple of lines inside `proxyImage` change.

Once deployed you’ll have a bullet-proof “works-with-any-image” solution and can remove the hard-coded SaatchiArt rule.