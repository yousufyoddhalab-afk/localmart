'use strict';
// Zero-dependency API server (Node 20+). Replace the in-memory Map with PostgreSQL before real orders.
const http = require('node:http');
const { createOrder, transition } = require('./orders');
const TOKENS = { [process.env.SELLER_TOKEN || 'dev-seller']: 'seller', [process.env.RIDER_TOKEN || 'dev-rider']: 'rider', [process.env.ADMIN_TOKEN || 'dev-admin']: 'admin' };
const orders = new Map(); let seq = 1001;

function send(res, code, body) { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); }
function body(req) { return new Promise((ok, no) => { let d = ''; req.on('data', c => { d += c; if (d.length > 1e5) req.destroy(); }); req.on('end', () => { try { ok(d ? JSON.parse(d) : {}); } catch { no(new Error('Invalid JSON')); } }); }); }
function role(req) { const t = (req.headers.authorization || '').replace('Bearer ', ''); return TOKENS[t] || null; }

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x'); const m = url.pathname.match(/^\/api\/orders\/(LM\d+)\/status$/);
    if (req.method === 'GET' && url.pathname === '/api/health') return send(res, 200, { ok: true });
    if (req.method === 'POST' && url.pathname === '/api/orders') {
      const o = createOrder(seq++, await body(req)); orders.set(o.id, o); return send(res, 201, o);
    }
    if (req.method === 'GET' && url.pathname === '/api/orders') {
      if (!role(req)) return send(res, 401, { error: 'Sign in required' });
      return send(res, 200, [...orders.values()]);
    }
    if (m && req.method === 'POST') {
      const o = orders.get(m[1]); if (!o) return send(res, 404, { error: 'No such order' });
      const b = await body(req); const r = role(req) || (b.to === 'Cancelled' && b.pin === o.pin ? 'customer' : null);
      if (!r) return send(res, 401, { error: 'Sign in required' });
      return send(res, 200, transition(o, b.to, r, b));
    }
    send(res, 404, { error: 'Not found' });
  } catch (e) { send(res, 400, { error: e.message }); }
});
if (require.main === module) server.listen(process.env.PORT || 3000, () => console.log('LocalMart API on :' + (process.env.PORT || 3000)));
module.exports = server;
