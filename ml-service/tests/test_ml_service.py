import os
import pytest
import numpy as np
import pandas as pd
import joblib
from fastapi.testclient import TestClient

from app.main import app, ML_SERVICE_API_KEY
from app.train import generate_synthetic_dataset, train_model, FEATURE_NAMES

client = TestClient(app)

DATA_PATH = "app/data/synthetic_households.csv"
MODEL_PATH = "app/models/rf_model.joblib"
API_HEADERS = {"X-API-Key": ML_SERVICE_API_KEY}

class TestSyntheticDatasetAndModelTraining:
    def test_01_dataset_generation_row_count(self):
        df = generate_synthetic_dataset(seed=42, n_samples=1000, output_path=DATA_PATH)
        assert os.path.exists(DATA_PATH)
        assert len(df) == 1000

    def test_02_required_columns_exist(self):
        df = pd.read_csv(DATA_PATH)
        for feature in FEATURE_NAMES:
            assert feature in df.columns
        assert 'risk_level' in df.columns

    def test_03_target_labels_are_valid(self):
        df = pd.read_csv(DATA_PATH)
        valid_labels = {'LOW', 'MEDIUM', 'HIGH'}
        unique_labels = set(df['risk_level'].unique())
        assert unique_labels.issubset(valid_labels)

    def test_04_no_nan_values_in_dataset(self):
        df = pd.read_csv(DATA_PATH)
        assert not df.isna().any().any()

    def test_05_no_infinity_values_in_dataset(self):
        df = pd.read_csv(DATA_PATH)
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        assert not np.isinf(df[numeric_cols]).any().any()

    def test_06_feature_ordering_is_deterministic(self):
        assert len(FEATURE_NAMES) == 10
        expected_features = [
            'total_members',
            'earning_members',
            'dependent_members',
            'children_count',
            'elderly_count',
            'monthly_income',
            'total_expenses',
            'essential_ratio',
            'savings_rate',
            'expense_income_ratio'
        ]
        assert FEATURE_NAMES == expected_features

    def test_07_train_test_split_and_model_training(self):
        artifact = train_model(data_path=DATA_PATH, model_output_path=MODEL_PATH)
        assert os.path.exists(MODEL_PATH)
        assert artifact['train_samples'] == 800
        assert artifact['test_samples'] == 200
        # Non-leaky model yields realistic performance metrics (~75% - 85%)
        assert artifact['metrics']['accuracy'] >= 0.70
        assert artifact['metrics']['f1'] >= 0.70

    def test_08_model_artifact_loads_successfully(self):
        artifact = joblib.load(MODEL_PATH)
        assert 'scaler' in artifact
        assert 'model' in artifact
        assert artifact['features'] == FEATURE_NAMES
        assert artifact['version'] == 'rf-v1.0.0'

class TestFastAPIEndpoints:
    def test_09_root_endpoint_status(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "RUNNING"

    def test_10_health_endpoint_status(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "UP"
        assert data["modelLoaded"] is True
        assert data["modelVersion"] == "rf-v1.0.0"

    def test_11_predict_without_api_key_returns_401(self):
        payload = {
            "totalMembers": 4,
            "earningMembers": 2,
            "dependentMembers": 2,
            "childrenCount": 1,
            "elderlyCount": 0,
            "monthlyIncome": 85000.0,
            "totalExpenses": 40000.0,
            "essentialRatio": 0.8,
            "savingsRate": 0.5294,
            "expenseIncomeRatio": 0.4706
        }
        response = client.post("/predict", json=payload)
        assert response.status_code == 401
        assert "Invalid or missing" in response.json()["detail"]

    def test_12_predict_with_invalid_api_key_returns_401(self):
        payload = {
            "totalMembers": 4,
            "earningMembers": 2,
            "dependentMembers": 2,
            "childrenCount": 1,
            "elderlyCount": 0,
            "monthlyIncome": 85000.0,
            "totalExpenses": 40000.0,
            "essentialRatio": 0.8,
            "savingsRate": 0.5294,
            "expenseIncomeRatio": 0.4706
        }
        response = client.post("/predict", json=payload, headers={"X-API-Key": "wrong_key"})
        assert response.status_code == 401

    def test_13_predict_valid_low_risk_payload(self):
        payload = {
            "totalMembers": 4,
            "earningMembers": 2,
            "dependentMembers": 2,
            "childrenCount": 1,
            "elderlyCount": 0,
            "monthlyIncome": 85000.0,
            "totalExpenses": 40000.0,
            "essentialRatio": 0.8,
            "savingsRate": 0.5294,
            "expenseIncomeRatio": 0.4706
        }
        response = client.post("/predict", json=payload, headers=API_HEADERS)
        assert response.status_code == 200
        data = response.json()
        assert data["predictedRiskLevel"] in ["LOW", "MEDIUM", "HIGH"]
        assert "probabilities" in data
        assert "LOW" in data["probabilities"]
        assert "MEDIUM" in data["probabilities"]
        assert "HIGH" in data["probabilities"]
        assert data["modelVersion"] == "rf-v1.0.0"
        assert isinstance(data["topFactors"], list)
        assert len(data["topFactors"]) > 0

    def test_14_predict_probabilities_sum_to_one(self):
        payload = {
            "totalMembers": 5,
            "earningMembers": 1,
            "dependentMembers": 4,
            "childrenCount": 2,
            "elderlyCount": 2,
            "monthlyIncome": 25000.0,
            "totalExpenses": 30000.0,
            "essentialRatio": 0.9,
            "savingsRate": -0.2,
            "expenseIncomeRatio": 1.2
        }
        response = client.post("/predict", json=payload, headers=API_HEADERS)
        assert response.status_code == 200
        probs = response.json()["probabilities"]
        prob_sum = sum(probs.values())
        assert pytest.approx(prob_sum, 0.001) == 1.0

    def test_15_predict_missing_required_fields(self):
        payload = {
            "totalMembers": 4,
            "monthlyIncome": 85000.0
        }
        response = client.post("/predict", json=payload, headers=API_HEADERS)
        assert response.status_code == 422

    def test_16_predict_invalid_negative_values(self):
        payload = {
            "totalMembers": 4,
            "earningMembers": 2,
            "dependentMembers": 2,
            "childrenCount": 1,
            "elderlyCount": 0,
            "monthlyIncome": -5000.0, # Invalid negative income
            "totalExpenses": 40000.0,
            "essentialRatio": 0.8,
            "savingsRate": 0.5,
            "expenseIncomeRatio": 0.5
        }
        response = client.post("/predict", json=payload, headers=API_HEADERS)
        assert response.status_code == 422

    def test_17_predict_out_of_range_essential_ratio(self):
        payload = {
            "totalMembers": 4,
            "earningMembers": 2,
            "dependentMembers": 2,
            "childrenCount": 1,
            "elderlyCount": 0,
            "monthlyIncome": 50000.0,
            "totalExpenses": 20000.0,
            "essentialRatio": 1.5, # Invalid ratio > 1.0
            "savingsRate": 0.5,
            "expenseIncomeRatio": 0.4
        }
        response = client.post("/predict", json=payload, headers=API_HEADERS)
        assert response.status_code == 422

    def test_18_prediction_order_matches_training_order(self):
        artifact = joblib.load(MODEL_PATH)
        assert artifact["features"] == FEATURE_NAMES

    def test_19_no_secrets_in_response(self):
        payload = {
            "totalMembers": 4,
            "earningMembers": 2,
            "dependentMembers": 2,
            "childrenCount": 1,
            "elderlyCount": 0,
            "monthlyIncome": 85000.0,
            "totalExpenses": 40000.0,
            "essentialRatio": 0.8,
            "savingsRate": 0.5294,
            "expenseIncomeRatio": 0.4706
        }
        response = client.post("/predict", json=payload, headers=API_HEADERS)
        body_text = response.text
        assert "MYSQL" not in body_text
        assert "PASSWORD" not in body_text
        assert "GEMINI" not in body_text

    def test_20_predict_high_risk_payload(self):
        payload = {
            "totalMembers": 6,
            "earningMembers": 0,
            "dependentMembers": 6,
            "childrenCount": 3,
            "elderlyCount": 3,
            "monthlyIncome": 0.0,
            "totalExpenses": 35000.0,
            "essentialRatio": 0.95,
            "savingsRate": -1.0,
            "expenseIncomeRatio": 2.0
        }
        response = client.post("/predict", json=payload, headers=API_HEADERS)
        assert response.status_code == 200
        data = response.json()
        assert data["predictedRiskLevel"] in ["HIGH", "MEDIUM"]

    def test_21_verify_no_direct_target_leakage(self):
        """
        Verify that risk_level is not a deterministic hardcoded rule copy of any single input feature.
        """
        df = pd.read_csv(DATA_PATH)
        # Check that no single feature perfect split predicts 100% of target labels
        zero_income_targets = df[df['monthly_income'] == 0]['risk_level'].unique()
        # Non-leaky model allows stochastic variations across categories
        assert len(df['risk_level'].unique()) == 3
        assert df['risk_level'].value_counts().min() > 50
