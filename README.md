# LocalMart Nepal

A local-shop marketplace: customers order from nearby shops, sellers fulfil, independent riders deliver, operations supervise. Built from the *Complete Workflow Guide*.

> **Status: pre-pilot.** The API keeps data in memory and uses dev tokens. Do not take real orders or payments until the items under "Before real orders" are done.

| Folder | Language | What it does |
|---|---|---|
| `web/` | HTML + JavaScript | Clickable four-portal demo of the whole workflow (open `web/index.html`) |
| `api/` | JavaScript (Node 20+) | Order API: server-side prices, status rules, role checks, delivery PIN |
| `services/settlement/` | Python 3 | Commission, seller payable, rider fees, COD owed (uses `Decimal`) |
| `services/dispatch/` | C++17 | Nearest-rider finder (haversine distance) for dispatchers |
| `apply/` | PHP 8 | Public shop and rider application form with CSRF protection |

## Run it
```bash
cd api && npm test && npm start          # API on :3000
cd services/settlement && python3 -m unittest
cd services/dispatch && make test
cd apply && php -S localhost:8080        # form at http://localhost:8080
```
API tokens come from `SELLER_TOKEN`, `RIDER_TOKEN`, `ADMIN_TOKEN` (defaults `dev-seller` etc., change them).

Create an order: `curl -X POST localhost:3000/api/orders -d '{"items":[{"id":1,"qty":2}],"addr":"Pulchowk","pay":"COD"}'`

## Before real orders
Real database (PostgreSQL) and backups, real accounts and per-shop data isolation, payment-provider integration, privacy and security review, seller/rider/customer terms, and Nepal legal and tax advice.

## Roadmap
MVP 1 customer site, MVP 2 seller and admin, MVP 3 riders, MVP 4 payments and settlements, MVP 5 Android app.
