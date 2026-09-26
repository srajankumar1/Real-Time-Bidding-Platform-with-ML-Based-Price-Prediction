"""
test_predict.py
Quick test script to test Flask ML prediction endpoint or in-process predictions.
"""

import sys
import json
from app import app

client = app.test_client()

# Test 1: Health check
res = client.get("/health")
print("Health Check Response:", res.status_code, res.get_json())
assert res.status_code == 200

# Test 2: Predict price
sample = {
    "item_category": "Fine Art",
    "starting_price": 500.0,
    "num_bidders": 8,
    "auction_duration_hours": 48,
    "time_of_day_listed": "Evening"
}

res2 = client.post("/predict-price", json=sample)
print("Predict Price Response:", res2.status_code, res2.get_json())
assert res2.status_code == 200
data = res2.get_json()
assert "predicted_price" in data
assert data["predicted_price"] > 500.0

# Test 3: Edge case with minimum bidders
sample_low = {
    "item_category": "Collectibles",
    "starting_price": 45.0,
    "num_bidders": 1,
    "auction_duration_hours": 72,
    "time_of_day_listed": "Morning"
}
res3 = client.post("/predict-price", json=sample_low)
print("Low Bidder Predict Response:", res3.status_code, res3.get_json())
assert res3.status_code == 200

print("\nAll ML Service test cases PASSED successfully!")
