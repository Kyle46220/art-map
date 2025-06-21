Ran tool

Ran tool

CORS error ­– what’s really happening
======================================

1. **Cytoscape attaches a `crossOrigin="anonymous"` attribute** to every image it loads for node backgrounds (that’s the library default, even if we never set it ourselves).  
2. When an `<img>` (or an `Image()` object created by Cytoscape) has that attribute, the browser **switches the network request to full CORS mode**.  
   • The server must now return the header  
     `Access-Control-Allow-Origin: http://localhost:3000` (or `*`).  
   • If the header is missing – as with the CloudFront link you saw – the fetch is rejected and the console logs the error you pasted.  
3. This is different from a normal CSS background image: without `crossOrigin`, the browser happily downloads the file cross-origin, draws it, and merely “taints” the canvas (you just can’t read pixels later).

Why it seemed to work earlier
-----------------------------
• Many SaatchiArt images do send `Access-Control-Allow-Origin: *`, so when your graph happened to use those URLs you didn’t notice a problem.  
• When we removed the Saatchi-only proxy, Cytoscape started requesting images from arbitrary hosts – most of which do **not** send CORS headers – hence the new failures.

Options to fix
--------------

A. **Tell Cytoscape *not* to add the `crossOrigin` attribute.**  
   Add one extra style line for nodes:

```js
{
  selector: 'node',
  style: {
    /* …existing rules… */
    'background-image-crossorigin': 'null'   // disable CORS mode
  }
}
```

`'null'` (or an empty string) prevents Cytoscape from attaching the attribute.  
Result: images load from any source, the canvas becomes tainted, but that only matters if you later call `cy.png()`, `cy.jpg()`, etc.

B. **Keep CORS mode and use a universal image proxy**  
   – Cloudflare Worker / Images.weserv.nl / your own Express proxy.  
   – Browser continues to request with `crossOrigin="anonymous"`, proxy adds the header.  
   – Needed **only** if you want un-tainted canvas exports or if some sites block hot-linking.

C. **Hybrid**  
   • Use (A) during development and normal browsing.  
   • Enable the proxy just for “Export as PNG/SVG” actions.

Recommendation
--------------
Unless you need graph export right now, **implement (A)** – one style-line change – and all images will render cross-origin with no further infrastructure. Keep option (B) on the roadmap for future export/download features.