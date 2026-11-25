// Vercel serverless function
// Imports the pre-built Express app (no listen() call)
let _app;

async function getApp() {
  if (!_app) {
    const mod = await import("../artifacts/api-server/dist/vercel.mjs");
    _app = mod.default;
  }
  return _app;
}

export default async function handler(req, res) {
  const app = await getApp();
  app(req, res);
}
