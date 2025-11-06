import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
from datetime import datetime
from tqdm import tqdm


def load_data(csv_path):
    print("Loading v2 earthquake features dataset...")
    with tqdm(desc="Reading CSV file", unit="rows") as pbar:
        df = pd.read_csv(csv_path)
        pbar.update(len(df))
    print(f"Dataset shape: {df.shape}")
    return df


def prepare(df):
    # Ensure columns exist
    expected = ['label_risk_level_v2', 'label_has_major_eq']
    for c in expected:
        if c not in df.columns:
            raise RuntimeError(f"Required column missing: {c}")

    # Encode province
    le_province = LabelEncoder()
    df['province_encoded'] = le_province.fit_transform(df['province'].astype(str))

    # Feature columns (same 30-day based features as before)
    feature_cols = [c for c in df.columns if c not in [
        'row_id', 'province', 'date',
        'label_risk_level', 'label_risk_level_v2', 'label_has_major_eq',
        'label_eq_count_next_7d', 'label_max_magnitude_next_7d', 'label_avg_magnitude_next_7d'
    ] and not c.startswith('label_')]
    feature_cols.append('province_encoded')

    X = df[feature_cols].fillna(0)
    y_multi = df['label_risk_level_v2'].astype(str).values
    y_bin = df['label_has_major_eq'].astype(int).values

    print(f"Feature matrix shape: {X.shape}")
    print(f"Features used ({len(feature_cols)}): {feature_cols}")

    return X, y_multi, y_bin, le_province, feature_cols


def train_multiclass(X, y, random_state=42):
    print("\nTraining multi-class Random Forest (label_risk_level_v2)")
    le = LabelEncoder()
    y_enc = le.fit_transform(y)
    X_train, X_test, y_train, y_test = train_test_split(X, y_enc, test_size=0.2, random_state=random_state, stratify=y_enc)
    print(f"Train samples: {X_train.shape[0]:,}, Test samples: {X_test.shape[0]:,}")

    rf = RandomForestClassifier(n_estimators=200, n_jobs=-1, class_weight='balanced', random_state=random_state, verbose=1)
    with tqdm(desc="Fitting multiclass RF", total=1):
        rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    print(f"Multi-class Accuracy: {acc:.3f}")
    print("Classification report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    print("Confusion matrix:")
    print(confusion_matrix(y_test, y_pred))

    return rf, {'model': rf, 'label_encoder': le, 'X_test': X_test, 'y_test': y_test, 'y_pred': y_pred}


def train_binary(X, y, random_state=42):
    print("\nTraining binary Random Forest (label_has_major_eq)")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=random_state, stratify=y)
    print(f"Train samples: {X_train.shape[0]:,}, Test samples: {X_test.shape[0]:,}")

    rf = RandomForestClassifier(n_estimators=200, n_jobs=-1, class_weight='balanced', random_state=random_state, verbose=1)
    with tqdm(desc="Fitting binary RF", total=1):
        rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)
    y_proba = rf.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    print(f"Binary Accuracy: {acc:.3f}, Precision: {prec:.3f}, Recall: {rec:.3f}, F1: {f1:.3f}")
    print("Classification report:")
    print(classification_report(y_test, y_pred, target_names=['No Major EQ', 'Major EQ']))
    print("Confusion matrix:")
    print(confusion_matrix(y_test, y_pred))

    return rf, {'model': rf, 'X_test': X_test, 'y_test': y_test, 'y_pred': y_pred, 'y_proba': y_proba}


def save_models(models_dict, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    print(f"Saving {len(models_dict)} models to {out_dir}")
    for name, obj in tqdm(models_dict.items(), desc="Saving models"):
        filename = f"{name}_rf_v2_{ts}.joblib"
        path = os.path.join(out_dir, filename)
        joblib.dump(obj, path)
        print(f"Saved: {path}")


if __name__ == '__main__':
    script_dir = os.path.dirname(__file__)
    csv_path = os.path.join(script_dir, '..', '..', 'dataset', 'earthquake', 'features', 'earthquake_features_dataset_v2.csv')
    out_dir = os.path.join(script_dir, '..', '..', 'models', 'earthquake')

    df = load_data(csv_path)
    X, y_multi, y_bin, le_province, feature_cols = prepare(df)

    # Train multiclass and binary
    multiclass_model, multiclass_res = train_multiclass(X, y_multi)
    binary_model, binary_res = train_binary(X, y_bin)

    # Save both models and the province encoder
    models_to_save = {
        'multiclass_risk_v2': multiclass_model,
        'binary_has_major_eq_v2': binary_model,
        'province_encoder_v2': le_province
    }
    save_models(models_to_save, out_dir)

    print('\nDone training v2 models.')
