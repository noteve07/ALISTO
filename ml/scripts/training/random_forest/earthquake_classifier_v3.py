import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score, TimeSeriesSplit
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.preprocessing import LabelEncoder
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import os
from datetime import datetime
from tqdm import tqdm

def load_and_prepare_data(csv_path):
    """Load and prepare the earthquake features dataset"""
    print("Loading earthquake features dataset...")
    with tqdm(desc="Reading CSV file", unit=" rows") as pbar:
        df = pd.read_csv(csv_path)
        pbar.update(len(df))
    
    print(f"Dataset shape: {df.shape}")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")
    print(f"Provinces: {df['province'].nunique()}")
    
    # Basic statistics
    print("\n" + "="*60)
    print("DATASET OVERVIEW")
    print("="*60)
    print(f"Total samples: {len(df):,}")
    print(f"Features: {len([col for col in df.columns if not col.startswith('label') and col not in ['row_id', 'province', 'date']])}")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")
    
    # Target distribution
    print(f"\nTarget distribution (has_major_eq):")
    target_counts = df['label_has_major_eq'].value_counts()
    for target, count in target_counts.items():
        percentage = (count / len(df)) * 100
        print(f"  {target}: {count:,} ({percentage:.1f}%)")
    
    print(f"\nRisk level distribution:")
    risk_counts = df['label_risk_level'].value_counts()
    for risk, count in risk_counts.items():
        percentage = (count / len(df)) * 100
        print(f"  {risk}: {count:,} ({percentage:.1f}%)")
    
    return df

def prepare_features_and_targets(df):
    """Prepare feature matrix X and target vectors y"""
    
    # Define feature columns (exclude metadata and target columns)
    feature_columns = [col for col in df.columns if not col.startswith('label') and col not in ['row_id', 'province', 'date']]
    
    # Encode province as categorical feature
    le_province = LabelEncoder()
    df['province_encoded'] = le_province.fit_transform(df['province'])
    feature_columns.append('province_encoded')
    
    # Prepare features
    X = df[feature_columns].copy()
    
    # Handle any remaining NaN values
    X = X.fillna(0)
    
    # Prepare targets
    targets = {
        'has_major_eq': df['label_has_major_eq'].values,
        'risk_level': df['label_risk_level'].values,
        'eq_count': df['label_eq_count_next_7d'].values,
        'max_magnitude': df['label_max_magnitude_next_7d'].values
    }
    
    print(f"\nFeature matrix shape: {X.shape}")
    print(f"Feature columns: {feature_columns}")
    
    return X, targets, feature_columns, le_province

def train_binary_classifier(X, y, test_size=0.2, random_state=42):
    """Train Random Forest for binary classification (has_major_eq)"""
    
    print("\n" + "="*60)
    print("TRAINING BINARY CLASSIFIER (Has Major Earthquake)")
    print("="*60)
    
    # Split data chronologically (important for time series)
    # Sort by date first if needed, but we'll use simple train_test_split for now
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    
    print(f"Training set: {X_train.shape[0]:,} samples")
    print(f"Test set: {X_test.shape[0]:,} samples")
    print(f"Training target distribution: {np.bincount(y_train)}")
    print(f"Test target distribution: {np.bincount(y_test)}")
    
    # Train Random Forest
    print("\nTraining Random Forest Classifier...")
    rf_classifier = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=random_state,
        n_jobs=-1,
        class_weight='balanced',  # Handle class imbalance
        verbose=1  # Show progress
    )
    
    # Fit with progress
    with tqdm(desc="Training Binary Classifier", total=1) as pbar:
        rf_classifier.fit(X_train, y_train)
        pbar.update(1)
    
    # Predictions
    print("Making predictions...")
    with tqdm(desc="Predicting", total=2) as pbar:
        y_pred = rf_classifier.predict(X_test)
        pbar.update(1)
        y_pred_proba = rf_classifier.predict_proba(X_test)[:, 1]
        pbar.update(1)
    
    # Evaluate
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    print(f"\n📊 BINARY CLASSIFICATION RESULTS:")
    print(f"Accuracy:  {accuracy:.3f}")
    print(f"Precision: {precision:.3f}")
    print(f"Recall:    {recall:.3f}")
    print(f"F1-Score:  {f1:.3f}")
    
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['No Major EQ', 'Major EQ']))
    
    print(f"\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    
    return rf_classifier, {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'y_test': y_test,
        'y_pred': y_pred,
        'y_pred_proba': y_pred_proba
    }

def train_multiclass_classifier(X, y, test_size=0.2, random_state=42):
    """Train Random Forest for multi-class classification (risk_level)"""
    
    print("\n" + "="*60)
    print("TRAINING MULTI-CLASS CLASSIFIER (Risk Level)")
    print("="*60)
    
    # Encode risk levels
    le_risk = LabelEncoder()
    y_encoded = le_risk.fit_transform(y)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=test_size, random_state=random_state, stratify=y_encoded
    )
    
    print(f"Training set: {X_train.shape[0]:,} samples")
    print(f"Test set: {X_test.shape[0]:,} samples")
    print(f"Risk levels: {le_risk.classes_}")
    
    # Train Random Forest
    print("\nTraining Random Forest Classifier...")
    rf_multiclass = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=random_state,
        n_jobs=-1,
        class_weight='balanced',
        verbose=1  # Show progress
    )
    
    # Fit with progress
    with tqdm(desc="Training Multi-class Classifier", total=1) as pbar:
        rf_multiclass.fit(X_train, y_train)
        pbar.update(1)
    
    # Predictions
    print("Making predictions...")
    with tqdm(desc="Predicting", total=1) as pbar:
        y_pred = rf_multiclass.predict(X_test)
        pbar.update(1)
    
    # Evaluate
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n📊 MULTI-CLASS CLASSIFICATION RESULTS:")
    print(f"Accuracy: {accuracy:.3f}")
    
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le_risk.classes_))
    
    print(f"\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    
    return rf_multiclass, {
        'accuracy': accuracy,
        'y_test': y_test,
        'y_pred': y_pred,
        'label_encoder': le_risk
    }

def train_regressor(X, y, target_name, test_size=0.2, random_state=42):
    """Train Random Forest for regression"""
    
    print(f"\n" + "="*60)
    print(f"TRAINING REGRESSOR ({target_name})")
    print("="*60)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    
    print(f"Training set: {X_train.shape[0]:,} samples")
    print(f"Test set: {X_test.shape[0]:,} samples")
    print(f"Target range: {y.min():.2f} to {y.max():.2f}")
    
    # Train Random Forest
    print(f"\nTraining Random Forest Regressor for {target_name}...")
    rf_regressor = RandomForestRegressor(
        n_estimators=100,
        max_depth=20,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=random_state,
        n_jobs=-1,
        verbose=1  # Show progress
    )
    
    # Fit with progress
    with tqdm(desc=f"Training {target_name} Regressor", total=1) as pbar:
        rf_regressor.fit(X_train, y_train)
        pbar.update(1)
    
    # Predictions
    print("Making predictions...")
    with tqdm(desc="Predicting", total=1) as pbar:
        y_pred = rf_regressor.predict(X_test)
        pbar.update(1)
    
    # Evaluate
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"\n📊 REGRESSION RESULTS ({target_name}):")
    print(f"MSE:  {mse:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"MAE:  {mae:.4f}")
    print(f"R²:   {r2:.4f}")
    
    return rf_regressor, {
        'mse': mse,
        'rmse': rmse,
        'mae': mae,
        'r2': r2,
        'y_test': y_test,
        'y_pred': y_pred
    }

def plot_feature_importance(model, feature_columns, model_name, top_n=15):
    """Plot feature importance"""
    
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    plt.figure(figsize=(12, 8))
    plt.title(f'Top {top_n} Feature Importances - {model_name}')
    plt.bar(range(min(top_n, len(feature_columns))), 
             importances[indices[:min(top_n, len(feature_columns))]])
    plt.xticks(range(min(top_n, len(feature_columns))), 
               [feature_columns[i] for i in indices[:min(top_n, len(feature_columns))]], 
               rotation=45, ha='right')
    plt.tight_layout()
    plt.show()
    
    print(f"\nTop {top_n} Most Important Features ({model_name}):")
    for i in range(min(top_n, len(feature_columns))):
        idx = indices[i]
        print(f"{i+1:2d}. {feature_columns[idx]:<30} {importances[idx]:.4f}")

def save_models(models, output_dir):
    """Save trained models"""
    
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    print("\nSaving models...")
    for model_name, model in tqdm(models.items(), desc="Saving models"):
        filename = f"{model_name}_rf_model_{timestamp}.joblib"
        filepath = os.path.join(output_dir, filename)
        joblib.dump(model, filepath)
        print(f"✓ Saved {model_name} model: {filepath}")

def main():
    # Define paths
    script_dir = os.path.dirname(__file__)
    csv_path = os.path.join(script_dir, '..', '..', 'dataset', 'earthquake', 'features', 'earthquake_features_dataset.csv')
    models_dir = os.path.join(script_dir, '..', '..', 'models', 'earthquake')
    
    print("=" * 60)
    print("EARTHQUAKE RISK PREDICTION MODEL TRAINING")
    print("=" * 60)
    
    # Load data
    df = load_and_prepare_data(csv_path)
    
    # Prepare features and targets
    X, targets, feature_columns, le_province = prepare_features_and_targets(df)
    
    # Store models
    trained_models = {}
    results = {}
    
    # 1. Binary Classification (Has Major Earthquake)
    binary_model, binary_results = train_binary_classifier(X, targets['has_major_eq'])
    trained_models['binary_classifier'] = binary_model
    results['binary'] = binary_results
    
    # 2. Multi-class Classification (Risk Level)
    multiclass_model, multiclass_results = train_multiclass_classifier(X, targets['risk_level'])
    trained_models['multiclass_classifier'] = multiclass_model
    results['multiclass'] = multiclass_results
    
    # 3. Regression (Earthquake Count)
    eq_count_model, eq_count_results = train_regressor(X, targets['eq_count'], 'Earthquake Count')
    trained_models['eq_count_regressor'] = eq_count_model
    results['eq_count'] = eq_count_results
    
    # 4. Regression (Max Magnitude)
    magnitude_model, magnitude_results = train_regressor(X, targets['max_magnitude'], 'Max Magnitude')
    trained_models['magnitude_regressor'] = magnitude_model
    results['magnitude'] = magnitude_results
    
    # Feature importance analysis
    print("\n" + "="*60)
    print("FEATURE IMPORTANCE ANALYSIS")
    print("="*60)
    
    plot_feature_importance(binary_model, feature_columns, "Binary Classifier")
    plot_feature_importance(multiclass_model, feature_columns, "Multi-class Classifier")
    
    # Save models
    save_models(trained_models, models_dir)
    
    # Summary
    print("\n" + "="*60)
    print("TRAINING SUMMARY")
    print("="*60)
    print(f"✓ Binary Classification Accuracy:    {results['binary']['accuracy']:.3f}")
    print(f"✓ Multi-class Classification Accuracy: {results['multiclass']['accuracy']:.3f}")
    print(f"✓ Earthquake Count R²:              {results['eq_count']['r2']:.3f}")
    print(f"✓ Max Magnitude R²:                 {results['magnitude']['r2']:.3f}")
    print(f"✓ Models saved to: {models_dir}")
    
    return trained_models, results

if __name__ == "__main__":
    models, results = main()