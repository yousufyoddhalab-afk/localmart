// Nearest-rider finder. Reads: "shopLat shopLon" then lines "riderId lat lon" from stdin.
// Prints: "<riderId> <km>" for the closest available rider, or "NONE". Build: make
#include <cmath>
#include <iostream>
#include <string>
static double km(double a, double b, double c, double d) {  // haversine distance
    const double R = 6371.0, k = M_PI / 180.0;
    double dl = (c - a) * k, dn = (d - b) * k;
    double h = std::sin(dl / 2) * std::sin(dl / 2) + std::cos(a * k) * std::cos(c * k) * std::sin(dn / 2) * std::sin(dn / 2);
    return 2 * R * std::asin(std::sqrt(h));
}
int main() {
    double sl, sn; if (!(std::cin >> sl >> sn)) { std::cout << "NONE\n"; return 1; }
    std::string id, best; double la, lo, bd = 1e18;
    while (std::cin >> id >> la >> lo) { double d = km(sl, sn, la, lo); if (d < bd) { bd = d; best = id; } }
    if (best.empty()) { std::cout << "NONE\n"; return 0; }
    std::cout << best << " " << std::round(bd * 100) / 100 << "\n";
}
