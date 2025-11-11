# enhanced random forest version without volcanic_advisory
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import json

# ---------- STEP 1: LOAD DATASET ----------
df = pd.read_csv("dataset_v3_features.csv")

# base features
features = [
    "eq_count_last_30d", "max_magnitude_last_30d", "avg_magnitude_last_30d",
    "min_magnitude_last_30d", "std_magnitude_last_30d", "avg_depth_last_30d",
    "max_depth_last_30d", "min_depth_last_30d", "days_since_last_eq",
    "days_since_last_major_eq", "eq_count_last_7d", "eq_count_last_14d"
]

# enhanced feature engineering
df['seismic_activity_ratio'] = df['eq_count_last_7d'] / (df['eq_count_last_30d'] + 1)
df['magnitude_variability'] = df['std_magnitude_last_30d'] / (df['avg_magnitude_last_30d'] + 1)
df['recent_activity_trend'] = df['eq_count_last_7d'] - df['eq_count_last_14d']

features.extend(['seismic_activity_ratio', 'magnitude_variability', 'recent_activity_trend'])

# prepare data
df = df.dropna(subset=features + ['label_risk_level'])
X = df[features].fillna(0)
y = df['label_risk_level']

# ---------- STEP 2: TRAIN / TEST SPLIT ----------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ---------- STEP 3: TRAIN RANDOM FOREST ----------
rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=10,
    min_samples_leaf=5,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)

rf.fit(X_train, y_train)

# ---------- STEP 4: EVALUATE ----------
y_pred = rf.predict(X_test)

print("=== OVERALL PERFORMANCE ===")
print(classification_report(y_test, y_pred))

cv_scores = cross_val_score(rf, X, y, cv=5, scoring='f1_macro')
print(f"Cross-validation F1 scores: {cv_scores}")
print(f"Mean CV F1: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")

# ---------- STEP 5: PROVINCE-LEVEL ANALYSIS ----------
print("\n=== PROVINCE-LEVEL PERFORMANCE ===")
provinces = df['province'].unique()
province_results = []

for prov in provinces:
    idx = df['province'] == prov
    if sum(idx) > 10:
        X_prov = X[idx]
        y_true_prov = y[idx]
        y_pred_prov = rf.predict(X_prov)
        
        accuracy = (y_pred_prov == y_true_prov).mean()
        province_results.append({
            'province': prov,
            'samples': sum(idx),
            'accuracy': accuracy
        })
        
        print(f"\nProvince: {prov} (n={sum(idx)})")
        print(classification_report(y_true_prov, y_pred_prov, zero_division=0))

# ---------- STEP 6: FEATURE IMPORTANCE ----------
importances = rf.feature_importances_
feature_imp_df = pd.DataFrame({
    'feature': features,
    'importance': importances
}).sort_values('importance', ascending=False)

print("\n=== FEATURE IMPORTANCE ===")
print(feature_imp_df)

# ---------- STEP 7: VISUALIZATIONS ----------
fig, axes = plt.subplots(2, 2, figsize=(16, 12))

# feature importance
sns.barplot(data=feature_imp_df.head(10), x='importance', y='feature', ax=axes[0,0])
axes[0,0].set_title("Top 10 Feature Importance")

# confusion matrix
cm = confusion_matrix(y_test, y_pred, labels=["Low","High"])
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=["Low","High"], yticklabels=["Low","High"], ax=axes[0,1])
axes[0,1].set_title("Confusion Matrix")

# province accuracy
prov_df = pd.DataFrame(province_results).sort_values('accuracy', ascending=False)
sns.barplot(data=prov_df, x='accuracy', y='province', ax=axes[1,0])
axes[1,0].set_title("Accuracy by Province")

# class distribution
sns.countplot(data=df, x='label_risk_level', ax=axes[1,1])
axes[1,1].set_title("Class Distribution")

plt.tight_layout()
plt.show()

print("\n=== MODEL TRAINING COMPLETE ===")
print(f"Best features: {list(feature_imp_df.head(5)['feature'])}")

# ---------- STEP 8: APPLY MODEL TO REAL DATA ----------
with open('province_earthquake_features.json', 'r') as f:
    real_data = json.load(f)

real_df = pd.DataFrame(real_data['province_features'])

# compute same engineered features
real_df['seismic_activity_ratio'] = real_df['eq_count_last_7d'] / (real_df['eq_count_last_30d'] + 1)
real_df['magnitude_variability'] = real_df['std_magnitude_last_30d'] / (real_df['avg_magnitude_last_30d'] + 1)
real_df['recent_activity_trend'] = real_df['eq_count_last_7d'] - real_df['eq_count_last_14d']

real_df = real_df.fillna(0)
real_X = real_df[features]

# predict
real_df['predicted_risk'] = rf.predict(real_X)

# ---------- STEP 9: PRINT HIGH RISK PROVINCES ----------
print("\n=== CURRENT HIGH RISK PROVINCES ===")
high_risk = real_df[real_df['predicted_risk'] == 'High']

if high_risk.empty:
    print("No provinces currently classified as High Risk.")
else:
    for _, row in high_risk.iterrows():
        print(f"{row['province_name']}: EQ Count={row['eq_count_last_30d']}, Max Mag={row['max_magnitude_last_30d']}, Avg Mag={row['avg_magnitude_last_30d']:.2f}")

# save predictions
real_df.to_csv("province_predictions_v2.csv", index=False)
print("\nPredictions saved to province_predictions_v2.csv")
