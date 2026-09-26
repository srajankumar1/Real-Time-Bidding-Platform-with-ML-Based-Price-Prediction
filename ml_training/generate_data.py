"""
generate_data.py
Generates a realistic synthetic dataset for auction data with realistic relationships
between starting price, number of bidders, auction duration, category, time of day, and final price.
"""

import os
import csv
import math
import random

CATEGORIES = ["Electronics", "Collectibles", "Fine Art", "Jewelry", "Fashion", "Home & Garden"]
CATEGORY_CONFIGS = {
    "Electronics": {"price_range": (60.0, 900.0), "demand_factor": 1.20},
    "Collectibles": {"price_range": (30.0, 600.0), "demand_factor": 1.35},
    "Fine Art": {"price_range": (150.0, 1500.0), "demand_factor": 1.45},
    "Jewelry": {"price_range": (80.0, 1100.0), "demand_factor": 1.30},
    "Fashion": {"price_range": (25.0, 400.0), "demand_factor": 1.10},
    "Home & Garden": {"price_range": (20.0, 350.0), "demand_factor": 1.05},
}

TIMES_OF_DAY = ["Morning", "Afternoon", "Evening", "Night"]
TIME_OF_DAY_MULTIPLIERS = {
    "Morning": 1.00,
    "Afternoon": 1.06,
    "Evening": 1.14,
    "Night": 0.96,
}

DURATIONS = [12, 24, 48, 72, 120, 168]


def generate_auction_dataset(num_samples: int = 2500, random_seed: int = 42):
    random.seed(random_seed)
    records = []

    for _ in range(num_samples):
        # Pick category
        cat = random.choices(
            CATEGORIES,
            weights=[0.25, 0.20, 0.15, 0.15, 0.15, 0.10],
            k=1
        )[0]
        cfg = CATEGORY_CONFIGS[cat]

        # Starting price
        low, high = cfg["price_range"]
        starting_price = round(random.uniform(low, high), 2)

        # Time of day listed
        time_listed = random.choices(
            TIMES_OF_DAY,
            weights=[0.20, 0.35, 0.35, 0.10],
            k=1
        )[0]
        time_mult = TIME_OF_DAY_MULTIPLIERS[time_listed]

        # Duration hours
        duration = random.choices(
            DURATIONS,
            weights=[0.15, 0.30, 0.25, 0.15, 0.10, 0.05],
            k=1
        )[0]

        # Number of bidders: Poisson-like behavior with boost for evening & shorter auctions
        # lambda between 5 and 10
        base_lam = 6.0
        if time_listed in ["Evening", "Afternoon"]:
            base_lam += 2.0
        if duration <= 48:
            base_lam += 1.5

        # Sample Poisson via Knuth's algorithm
        L = math.exp(-base_lam)
        k = 0
        p = 1.0
        while p > L:
            k += 1
            p *= random.random()
        num_bidders = max(1, min(40, k - 1))

        # Relationship logic for final_price:
        # 1. More bidders -> significantly higher final price (power curve)
        bidder_boost = (num_bidders ** 1.18) * 0.055

        # 2. Shorter duration -> urgency factor pushing price higher
        duration_urgency = (120.0 / (duration + 48.0)) * 0.18

        # 3. Category demand factor
        cat_demand = cfg["demand_factor"]

        # 4. Listing time multiplier effect
        time_effect = (time_mult - 1.0) * 0.5

        # Combined growth rate
        growth_rate = (bidder_boost + duration_urgency + time_effect) * (cat_demand / 1.20)
        growth_rate = max(0.05, growth_rate)

        # Realistic Gaussian noise (~ 6%)
        noise = random.gauss(0.0, 0.06)
        growth_factor = max(0.02, growth_rate + noise)

        final_price = starting_price * (1.0 + growth_factor)

        # Ensure realistic minimum bidding increment guarantee
        min_guarantee = starting_price + (num_bidders * 2.5)
        final_price = max(final_price, min_guarantee)

        records.append({
            "item_category": cat,
            "starting_price": starting_price,
            "num_bidders": num_bidders,
            "auction_duration_hours": duration,
            "time_of_day_listed": time_listed,
            "final_price": round(final_price, 2),
        })

    return records


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "auction_data.csv")

    rows = generate_auction_dataset(num_samples=2500)

    fieldnames = [
        "item_category",
        "starting_price",
        "num_bidders",
        "auction_duration_hours",
        "time_of_day_listed",
        "final_price",
    ]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Successfully generated {len(rows)} auction records.")
    print(f"Saved to: {output_path}")

    # Print summary
    final_prices = [r["final_price"] for r in rows]
    starting_prices = [r["starting_price"] for r in rows]
    bidders = [r["num_bidders"] for r in rows]

    print("\nDataset Summary:")
    print(f"Total Rows: {len(rows)}")
    print(f"Avg Starting Price: ${sum(starting_prices)/len(rows):.2f}")
    print(f"Avg Final Price:    ${sum(final_prices)/len(rows):.2f}")
    print(f"Avg Num Bidders:    {sum(bidders)/len(rows):.1f}")
    print(f"Min Final Price:    ${min(final_prices):.2f}")
    print(f"Max Final Price:    ${max(final_prices):.2f}")
    print("\nFirst 3 rows:")
    for r in rows[:3]:
        print(" ", r)
