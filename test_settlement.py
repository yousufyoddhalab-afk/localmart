import unittest
from decimal import Decimal
from settlement import settle

class T(unittest.TestCase):
    def test_example_from_guide(self):  # Rs.1000 order, 5% commission, Rs.80 delivery
        o = [{"status": "Delivered", "sub": 1000, "fee": 80, "shop": "s1", "rider": "r1", "pay": "COD"}]
        r = settle(o)
        self.assertEqual(r["commission"], Decimal("50.00"))
        self.assertEqual(r["seller_payable"]["s1"], Decimal("950.00"))
        self.assertEqual(r["cod_owed_by_rider"]["r1"], Decimal("1080"))
    def test_ignores_undelivered_and_prepaid_cash(self):
        o = [{"status": "Cancelled", "sub": 500, "fee": 80, "shop": "s1", "rider": None, "pay": "COD"},
             {"status": "Delivered", "sub": 200, "fee": 80, "shop": "s2", "rider": "r2", "pay": "Online"}]
        r = settle(o); self.assertEqual(r["gmv"], Decimal(200)); self.assertEqual(r["cod_owed_by_rider"], {})
if __name__ == "__main__": unittest.main()
