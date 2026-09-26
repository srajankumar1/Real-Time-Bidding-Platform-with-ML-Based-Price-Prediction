/**
 * services/mlClient.js
 * Client to communicate with Flask ML Price Prediction microservice (http://localhost:5001).
 * Resilient against network issues or ML service downtime.
 */

const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';

/**
 * Predict final price for an auction given current attributes.
 * @param {Object} params
 * @param {string} params.item_category
 * @param {number} params.starting_price
 * @param {number} params.num_bidders
 * @param {number} params.auction_duration_hours
 * @param {string} params.time_of_day_listed
 * @param {number} [params.current_bid]
 * @returns {Promise<{ predicted_price: number, is_fallback: boolean }>}
 */
async function predictFinalPrice({
  item_category = 'Electronics',
  starting_price = 100,
  num_bidders = 1,
  auction_duration_hours = 24,
  time_of_day_listed = 'Evening',
  current_bid = null,
}) {
  try {
    const payload = {
      item_category,
      starting_price: Number(starting_price),
      num_bidders: Math.max(1, Number(num_bidders)),
      auction_duration_hours: Number(auction_duration_hours),
      time_of_day_listed,
    };

    const response = await axios.post(`${ML_SERVICE_URL}/predict-price`, payload, {
      timeout: 2000, // 2-second timeout to maintain rapid bidding throughput
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.data && response.data.predicted_price !== undefined) {
      let predicted = Number(response.data.predicted_price);
      // Ensure predicted price is never lower than current bid or starting price
      const baseline = current_bid ? Math.max(starting_price, current_bid) : starting_price;
      predicted = Math.max(baseline, predicted);

      return {
        predicted_price: Math.round(predicted * 100) / 100,
        is_fallback: false,
      };
    }
  } catch (error) {
    console.warn(`[ML Service Warning] Unable to reach ML service at ${ML_SERVICE_URL}: ${error.message}`);
  }

  // Graceful fallback if ML service is unreachable or errors
  // Bidding continues without interruption
  const baseline = current_bid ? Math.max(starting_price, current_bid) : starting_price;
  const growthRate = 0.08 * Math.pow(Math.max(1, num_bidders), 1.1) + 0.1;
  const fallbackPrice = Math.max(baseline, Math.round(starting_price * (1 + growthRate) * 100) / 100);

  return {
    predicted_price: fallbackPrice,
    is_fallback: true,
  };
}

module.exports = { predictFinalPrice };
