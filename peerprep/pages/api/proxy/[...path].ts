// Solution for websocket derived from https://github.com/vercel/next.js/discussions/38057
import { createProxyMiddleware } from "http-proxy-middleware";
import { NextApiRequest, NextApiResponse } from "next/types";

const proxy = createProxyMiddleware<NextApiRequest, NextApiResponse>({
  target: process.env.NEXT_PUBLIC_COLLAB,
  ws: true, // enable proxying WebSockets
  pathRewrite: { "^/api/proxy": "/ws" }, // remove `/api/proxy` prefix
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  proxy(req, res, (err) => {
    if (err) {
      throw err;
    }

    throw new Error(`Local proxy received bad request for ${req.url}`);
  });
}

export const config = {
  api: {
    // Proxy middleware will handle requests itself, so Next.js should
    // ignore that our handler doesn't directly return a response
    externalResolver: true,
    // Pass request bodies through unmodified so that the origin API server
    // receives them in the intended format
    bodyParser: false,
  },
};
