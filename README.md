# Tangent — a topic terminal

## Run locally
```
npm install
npm run dev
```
Then open the local URL it prints (usually http://localhost:5173).

## Build for production
```
npm run build
```
This creates a `dist/` folder — that's what you deploy.

## Note on "Wire" mode
Wire mode calls `https://api.anthropic.com/v1/messages` directly from the browser.
That works inside Claude.ai's artifact sandbox (which injects an API key for you),
but it will NOT work once this is hosted on its own — there's no key, and Anthropic's
API blocks direct browser calls (CORS) for security. When the call fails, the app
already catches the error and quietly falls back to drawing from the Archive instead,
so nothing breaks — Wire mode just always behaves like Archive mode until you wire up
a real backend.

If you want genuine AI-generated topics on the live site, you'd need a small serverless
function (e.g. a Vercel Function or Netlify Function) that holds your own Anthropic API
key server-side and proxies the request. Happy to build that if you want it.
