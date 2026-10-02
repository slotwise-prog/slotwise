import { handleRequest } from '../../cloudflare/_worker.js';

// Cloudflare Pages passes production runtime bindings through context.env.
export function onRequest(context) {
  return handleRequest(context.request, context.env);
}
