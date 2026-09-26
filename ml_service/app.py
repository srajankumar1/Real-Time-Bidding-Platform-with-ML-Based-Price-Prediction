"""
ml_service/app.py
Flask microservice for ML-based auction final price prediction.
Exposes POST /predict-price and GET /health on port 5001.
"""

import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load model pipeline on startup
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "price_model.pkl")

if not os.path.exists(MODEL_PATH):
    # Fallback to ml_training if not yet copied
    fallback_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ml_training", "price_model.pkl")
    if os.path.exists(fallback_path):
        MODEL_PATH = fallback_path

print(f"Loading ML model pipeline from: {MODEL_PATH}")
model = joblib.load(MODEL_PATH)
print("Model loaded successfully into memory.")

VALID_CATEGORIES = ["Electronics", "Collectibles", "Fine Art", "Jewelry", "Fashion", "Home & Garden"]
VALID_TIMES = ["Morning", "Afternoon", "Evening", "Night"]


@app.route("/", methods=["GET"])
def index():
    html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>BidPulse ML Microservice</title>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #0a0d14;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .card {
          background: rgba(22, 28, 42, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 25px 60px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.2);
          border-radius: 24px;
          padding: 40px;
          max-width: 500px;
          width: 90%;
          text-align: center;
        }
        .pill {
          display: inline-block;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #10b981;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 4px 14px;
          border-radius: 999px;
          margin-bottom: 16px;
        }
        h1 { margin: 0 0 10px 0; font-size: 1.6rem; font-weight: 800; }
        p { color: rgba(255, 255, 255, 0.6); font-size: 0.95rem; line-height: 1.5; margin-bottom: 28px; }
        .btn {
          display: block;
          background: linear-gradient(135deg, #ff6b35, #ff8c42);
          color: #fff;
          text-decoration: none;
          padding: 14px 24px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 1rem;
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
          transition: transform 0.2s;
        }
        .btn:hover { transform: translateY(-2px); }
        .endpoints {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.5);
          text-align: left;
          font-family: 'JetBrains Mono', monospace;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="pill">● ML Prediction Service Active</div>
        <h1>Port 5001 (Backend ML API)</h1>
        <p>This is the Python Flask microservice that serves real-time price predictions. The visual application dashboard is running on <strong>Port 3000</strong>.</p>
        <a class="btn" href="http://localhost:3000">👉 Open BidPulse UI (Port 3000)</a>
        <div class="endpoints">
          <strong>Available Microservice Endpoints:</strong><br>
          • <code>POST /predict-price</code> - Input auction features<br>
          • <code>GET /health</code> - Service & model telemetry
        </div>
      </div>
    </body>
    </html>
    """
    return html, 200


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Auction Price Prediction ML Service",
        "model_loaded": model is not None,
        "supported_categories": VALID_CATEGORIES,
        "port": 5001
    }), 200


@app.route("/predict-price", methods=["POST"])
def predict_price():
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON payload"}), 400

    try:
        # Extract features with robust type coercion & fallbacks
        starting_price = float(data.get("starting_price", 10.0))
        if starting_price <= 0:
            return jsonify({"error": "starting_price must be a positive number"}), 400

        num_bidders = int(data.get("num_bidders", 1))
        num_bidders = max(1, num_bidders)

        auction_duration_hours = int(data.get("auction_duration_hours", 24))
        auction_duration_hours = max(1, auction_duration_hours)

        item_category = str(data.get("item_category", "Electronics")).strip()
        if item_category not in VALID_CATEGORIES:
            item_category = "Electronics"

        time_of_day_listed = str(data.get("time_of_day_listed", "Evening")).strip()
        if time_of_day_listed not in VALID_TIMES:
            time_of_day_listed = "Evening"

        # Create DataFrame matching training feature columns
        input_df = pd.DataFrame([{
            "item_category": item_category,
            "starting_price": starting_price,
            "num_bidders": num_bidders,
            "auction_duration_hours": auction_duration_hours,
            "time_of_day_listed": time_of_day_listed,
        }])

        raw_pred = float(model.predict(input_df)[0])

        # A predicted final price cannot be lower than the starting price
        predicted_price = max(starting_price, round(raw_pred, 2))

        return jsonify({
            "predicted_price": predicted_price,
            "starting_price": starting_price,
            "num_bidders": num_bidders,
            "item_category": item_category,
            "status": "success"
        }), 200

    except Exception as e:
        app.logger.error(f"Prediction failed with error: {str(e)}")
        return jsonify({"error": f"Prediction computation failed: {str(e)}"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"Starting ML Price Prediction Service on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
