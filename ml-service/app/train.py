import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib

FEATURE_NAMES = [
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

def generate_synthetic_dataset(seed=42, n_samples=1000, output_path="app/data/synthetic_households.csv"):
    """
    Generate synthetic household dataset for demonstration, model development, and academic evaluation.
    
    Target Generation Methodology (Latent Vulnerability Index with Stochastic Noise):
    To eliminate direct target leakage (where target labels are deterministic copies of training features),
    the target risk level is constructed using a continuous latent vulnerability index V:
    
        V = 1.2 * z(expense_income_ratio) + 1.0 * z(essential_ratio) + 1.0 * z(dependency_load) - 1.5 * z(savings_rate) + noise
        where noise ~ N(0, 0.8^2) represents unobserved environmental and financial shocks.
        
    Households are discretized into LOW, MEDIUM, and HIGH risk categories based on quantiles of V:
    - HIGH risk: top 30% latent vulnerability index
    - LOW risk: bottom 30% latent vulnerability index
    - MEDIUM risk: middle 40%
    
    This ensures features are realistically correlated with risk while preventing deterministic target leakage.
    
    Disclaimer:
    The 1,000-household dataset is synthetic and designed for demonstration, model-development, and
    academic evaluation. Its distributions are assumptions created for this project and must not be
    interpreted as representative of real-world household populations.
    """
    np.random.seed(seed)
    
    total_members = np.random.randint(1, 10, size=n_samples)
    earning_members = np.array([np.random.randint(0, m + 1) for m in total_members])
    dependent_members = total_members - earning_members
    children_count = np.array([np.random.randint(0, m + 1) for m in dependent_members])
    elderly_count = dependent_members - children_count

    monthly_income = np.random.uniform(15000, 200000, size=n_samples)
    zero_inc_idx = np.random.choice(n_samples, size=int(0.05 * n_samples), replace=False)
    monthly_income[zero_inc_idx] = 0.0

    total_expenses = np.where(
        monthly_income > 0,
        monthly_income * np.random.uniform(0.3, 1.2, size=n_samples),
        np.random.uniform(10000, 40000, size=n_samples)
    )

    essential_ratio = np.random.uniform(0.5, 0.95, size=n_samples)
    savings = monthly_income - total_expenses

    with np.errstate(divide='ignore', invalid='ignore'):
        savings_rate = np.where(monthly_income > 0, savings / monthly_income, -1.0)
        expense_income_ratio = np.where(monthly_income > 0, total_expenses / monthly_income, 2.0)
        dependency_load = np.where(earning_members > 0, dependent_members / earning_members, 3.0)
    
    def z_score(arr):
        std = np.std(arr)
        return (arr - np.mean(arr)) / (std if std > 0 else 1.0)

    z_exp = z_score(expense_income_ratio)
    z_ess = z_score(essential_ratio)
    z_dep = z_score(dependency_load)
    z_sav = z_score(savings_rate)
    
    stochastic_noise = np.random.normal(0.0, 0.8, size=n_samples)

    latent_vulnerability = (1.2 * z_exp) + (1.0 * z_ess) + (1.0 * z_dep) - (1.5 * z_sav) + stochastic_noise

    p30 = np.percentile(latent_vulnerability, 30)
    p70 = np.percentile(latent_vulnerability, 70)

    conditions = [
        latent_vulnerability >= p70,
        latent_vulnerability <= p30
    ]
    choices = ['HIGH', 'LOW']
    risk_level = np.select(conditions, choices, default='MEDIUM')

    df = pd.DataFrame({
        'total_members': total_members,
        'earning_members': earning_members,
        'dependent_members': dependent_members,
        'children_count': children_count,
        'elderly_count': elderly_count,
        'monthly_income': monthly_income,
        'total_expenses': total_expenses,
        'essential_ratio': essential_ratio,
        'savings_rate': savings_rate,
        'expense_income_ratio': expense_income_ratio,
        'risk_level': risk_level
    })

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Synthetic dataset saved to {output_path} ({len(df)} rows)")
    return df

def train_model(data_path="app/data/synthetic_households.csv", model_output_path="app/models/rf_model.joblib"):
    """
    Train Random Forest Classifier on synthetic dataset and save artifact.
    """
    if not os.path.exists(data_path):
        df = generate_synthetic_dataset(output_path=data_path)
    else:
        df = pd.read_csv(data_path)

    X = df[FEATURE_NAMES]
    y = df['risk_level']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    clf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
    clf.fit(X_train_scaled, y_train)

    y_pred = clf.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='macro')
    rec = recall_score(y_test, y_pred, average='macro')
    f1 = f1_score(y_test, y_pred, average='macro')
    cm = confusion_matrix(y_test, y_pred, labels=['LOW', 'MEDIUM', 'HIGH'])

    print("\n================ MODEL EVALUATION ================")
    print(f"Accuracy  : {acc:.4f}")
    print(f"Precision : {prec:.4f}")
    print(f"Recall    : {rec:.4f}")
    print(f"F1-Score  : {f1:.4f}")
    print("\nConfusion Matrix (LOW, MEDIUM, HIGH):")
    print(cm)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    artifact = {
        'scaler': scaler,
        'model': clf,
        'features': FEATURE_NAMES,
        'classes': ['LOW', 'MEDIUM', 'HIGH'],
        'version': 'rf-v1.0.0',
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'metrics': {
            'accuracy': float(acc),
            'precision': float(prec),
            'recall': float(rec),
            'f1': float(f1)
        }
    }

    os.makedirs(os.path.dirname(model_output_path), exist_ok=True)
    joblib.dump(artifact, model_output_path)
    print(f"Model artifact successfully saved to {model_output_path}")
    return artifact

if __name__ == "__main__":
    generate_synthetic_dataset()
    train_model()
