"""Settlement: turns delivered orders into seller payables, commission, rider fees and COD owed.
Usage: python settlement.py orders.json [commission_rate]   (orders.json = output of GET /api/orders)
Money uses Decimal so rupees never pick up float errors."""
import json, sys
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP

Q = Decimal("0.01")
RIDER_FEE = Decimal("80")  # example rate, set by operations

def settle(orders, rate=Decimal("0.05")):
    seller, rider_pay, cod = defaultdict(Decimal), defaultdict(Decimal), defaultdict(Decimal)
    commission = gmv = Decimal(0)
    for o in orders:
        if o.get("status") != "Delivered":
            continue
        sub = Decimal(str(o["sub"])); com = (sub * rate).quantize(Q, ROUND_HALF_UP)
        gmv += sub; commission += com
        seller[o["shop"]] += sub - com
        rider_pay[o["rider"]] += RIDER_FEE
        if o["pay"] == "COD":  # rider holds this cash until handed over
            cod[o["rider"]] += sub + Decimal(str(o["fee"]))
    return {"gmv": gmv, "commission": commission, "seller_payable": dict(seller),
            "rider_payable": dict(rider_pay), "cod_owed_by_rider": dict(cod)}

if __name__ == "__main__":
    data = json.load(open(sys.argv[1]))
    rate = Decimal(sys.argv[2]) if len(sys.argv) > 2 else Decimal("0.05")
    for k, v in settle(data, rate).items():
        print(k, v)
