"""
train_model.py
Phase 2: Exploratory Data Analysis, Feature Preprocessing, Model Training & Comparison.
Trains Linear Regression, Random Forest, and Gradient Boosting regressor pipelines.
Saves the best-performing model as price_model.pkl using joblib.
"""

import os
import shutil
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score


def run_training_pipeline():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(current_dir, "auction_data.csv")

    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Could not find dataset at {csv_path}. Run generate_data.py first.")

    print(f"Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)

    # 1. Basic EDA
    print("\n" + "=" * 60)
    print("1. EXPLORATORY DATA ANALYSIS (EDA)")
    print("=" * 60)
    print(f"Total Rows: {len(df)}")
    print("\nFeature Summary Statistics:")
    print(df.describe().to_string())

    print("\nCategorical Distributions:")
    print("Item Categories:")
    print(df["item_category"].value_counts().to_string())
    print("\nTime of Day Listed:")
    print(df["time_of_day_listed"].value_counts().to_string())

    print("\nCorrelations with final_price (numeric features):")
    numeric_df = df[["starting_price", "num_bidders", "auction_duration_hours", "final_price"]]
    corr = numeric_df.corr()["final_price"].sort_values(ascending=False)
    print(corr.to_string())

    # 2. Features and Target Definition
    categorical_features = ["item_category", "time_of_day_listed"]
    numerical_features = ["starting_price", "num_bidders", "auction_duration_hours"]
    target_column = "final_price"

    X = df[categorical_features + numerical_features]
    y = df[target_column]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"\nTrain set size: {len(X_train)} rows | Test set size: {len(X_test)} rows")

    # 3. Preprocessor Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features),
            ("num", StandardScaler(), numerical_features),
        ],
        remainder="drop"
    )

    # 4. Define Candidate Models
    models = {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(n_estimators=120, max_depth=15, random_state=42, n_jobs=-1),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=120, learning_rate=0.1, max_depth=5, random_state=42),
    }

    # 5. Train & Evaluate Models
    print("\n" + "=" * 60)
    print("2. MODEL TRAINING & COMPARISON")
    print("=" * 60)

    results = []
    trained_pipelines = {}

    for name, regressor in models.items():
        pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", regressor),
        ])

        print(f"Training {name}...")
        pipeline.fit(X_train, y_train)
        trained_pipelines[name] = pipeline

        y_pred = pipeline.predict(X_test)

        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)

        results.append({
            "Model": name,
            "MAE ($)": round(mae, 2),
            "RMSE ($)": round(rmse, 2),
            "R2 Score": round(r2, 4),
        })

    # Results Table
    results_df = pd.DataFrame(results)
    results_df = results_df.sort_values(by="RMSE ($)", ascending=True).reset_index(drop=True)

    print("\n" + "=" * 60)
    print("3. MODEL EVALUATION COMPARISON TABLE")
    print("=" * 60)
    print(results_df.to_string(index=False))

    best_model_name = results_df.iloc[0]["Model"]
    best_pipeline = trained_pipelines[best_model_name]
    print(f"\nBest Performing Model: {best_model_name} (RMSE: ${results_df.iloc[0]['RMSE ($)']})")

    # 6. Save Model
    save_path = os.path.join(current_dir, "price_model.pkl")
    joblib.dump(best_pipeline, save_path)
    print(f"Saved best model pipeline to: {save_path}")

    # Also copy to ml_service directory for Phase 3
    ml_service_dir = os.path.join(os.path.dirname(current_dir), "ml_service")
    os.makedirs(ml_service_dir, exist_ok=True)
    service_model_path = os.path.join(ml_service_dir, "price_model.pkl")
    shutil.copy(save_path, service_model_path)
    print(f"Copied model to ML service directory: {service_model_path}")

    # 7. Verification sanity test
    test_sample = pd.DataFrame([{
        "item_category": "Electronics",
        "starting_price": 150.00,
        "num_bidders": 5,
        "auction_duration_hours": 24,
        "time_of_day_listed": "Evening"
    }])
    sample_pred = best_pipeline.predict(test_sample)[0]
    print(f"\nSanity Check Prediction for test item:")
    print(f"  Input: {test_sample.to_dict(orient='records')[0]}")
    print(f"  Predicted Final Price: ${sample_pred:.2f}")

    return results_df, best_model_name


if __name__ == "__main__":
    run_training_pipeline()
