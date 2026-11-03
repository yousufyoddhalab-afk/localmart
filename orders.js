'use strict';
// Order lifecycle rules. Pure functions: easy to test, no I/O.
const FEE = 80;
const FLOW = ['New', 'Confirmed', 'Preparing', 'Ready for pickup', 'Rider assigned', 'Picked up', 'Out for delivery', 'Delivered'];
// Which role may move an order INTO each status.
const WHO = {
  'Confirmed': ['seller', 'admin'], 'Preparing': ['seller', 'admin'], 'Ready for pickup': ['seller', 'admin'],
  'Rider assigned': ['rider', 'admin'], 'Picked up': ['rider', 'admin'], 'Out for delivery': ['rider', 'admin'],
  'Delivered': ['rider', 'admin'], 'Cancelled': ['customer', 'seller', 'admin'],
};
const CATALOG = {
  1: { shop: 's1', name: 'Basmati rice 5 kg', price: 950 }, 2: { shop: 's1', name: 'Mustard oil 1 L', price: 340 },
  4: { shop: 's2', name: 'Sel roti 6 pcs', price: 180 }, 6: { shop: 's3', name: 'Tomatoes 1 kg', price: 110 },
};

function createOrder(seq, input) {
  const items = Array.isArray(input.items) ? input.items : [];
  if (!items.length) throw new Error('Cart is empty');
  if (!input.addr || String(input.addr).trim().length < 3) throw new Error('Delivery address required');
  if (!['COD', 'Online'].includes(input.pay)) throw new Error('Unknown payment method');
  let sub = 0, shop = null;
  const lines = items.map(({ id, qty }) => {
    const p = CATALOG[id];
    if (!p) throw new Error('Unknown product ' + id);
    if (!Number.isInteger(qty) || qty < 1 || qty > 50) throw new Error('Bad quantity');
    if (shop && shop !== p.shop) throw new Error('One shop per order');
    shop = p.shop; sub += p.price * qty; // price always comes from the server catalog
    return { id, name: p.name, qty, price: p.price };
  });
  const now = new Date().toISOString();
  return { id: 'LM' + seq, shop, lines, sub, fee: FEE, pay: input.pay, addr: String(input.addr).trim(),
    rider: null, pin: String(1000 + Math.floor(Math.random() * 9000)), status: 'New',
    log: [{ status: 'New', by: 'system', at: now }] };
}

function transition(order, to, role, opts = {}) {
  if (to === 'Cancelled') {
    if (FLOW.indexOf(order.status) >= FLOW.indexOf('Picked up') || order.status === 'Cancelled') throw new Error('Too late to cancel');
  } else if (FLOW.indexOf(to) !== FLOW.indexOf(order.status) + 1) {
    throw new Error(`Invalid jump: ${order.status} -> ${to}`);
  }
  if (!(WHO[to] || []).includes(role)) throw new Error(`${role} cannot set ${to}`);
  if (to === 'Rider assigned') {
    if (order.rider) throw new Error('Job already assigned');
    if (!opts.riderId) throw new Error('riderId required');
    order.rider = opts.riderId;
  }
  if (to === 'Delivered' && role !== 'admin' && opts.pin !== order.pin) throw new Error('Wrong delivery PIN');
  order.status = to;
  order.log.push({ status: to, by: role, reason: opts.reason || '', at: new Date().toISOString() });
  return order;
}
module.exports = { createOrder, transition, FLOW, FEE };
