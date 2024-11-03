// Solution for websocket derived from https://github.com/vercel/next.js/discussions/38057
import { createProxyMiddleware } from "http-proxy-middleware";
import { NextApiRequest, NextApiResponse } from "next/types";

export const proxyMiddleware = createProxyMiddleware<
  NextApiRequest,
  NextApiResponse
>({
  target: `http://localhost:3000/api/testApi`,
  //   ws: true, // enable proxying WebSockets
  //   pathFilter: "/api/collab",
  //   pathRewrite: { "^/api/collab": "/ws" }, // remove `/api/proxy` prefix
  logger: console,
});
