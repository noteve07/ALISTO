import pandas as pd
import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_curve, auc, accuracy_score, precision_score, recall_score, f1_score
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import roc_auc_score

# ---------- STEP 1: TRAIN MODEL ON HISTORICAL DATA ----------

# load dataset
df = pd.read_csv('dataset_v4_features.csv')

# selected features
features = [
    'eq_count_last_30d', 'max_magnitude_last_30d', 'avg_magnitude_last_30d',
    'min_magnitude_last_30d', 'std_magnitude_last_30d', 'avg_depth_last_30d',
    'max_depth_last_30d', 'min_depth_last_30d', 'days_since_last_eq',
    'days_since_last_major_eq', 'eq_count_last_7d', 'eq_count_last_14d'
]

# encode labels
df['label'] = df['label_risk_level'].map({'Low': 0, 'High': 1})

# drop missing
df = df.dropna(subset=features + ['label'])

X = df[features]
y = df['label']

# split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# train random forest
clf = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
clf.fit(X_train, y_train)

# predictions
y_pred = clf.predict(X_test)
y_pred_proba = clf.predict_proba(X_test)[:, 1]  # Probabilities for ROC curve

print("\n=== TRAINING PERFORMANCE ===")
print(classification_report(y_test, y_pred, target_names=['Low', 'High']))

# Calculate metrics for visualization
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_pred_proba)

# Create comprehensive visualization with 6 subplots
fig, axes = plt.subplots(2, 3, figsize=(18, 12))
fig.suptitle('Random Forest Model Performance Analysis', fontsize=16, fontweight='bold')

# 1. Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=['Low','High'], yticklabels=['Low','High'], ax=axes[0,0])
axes[0,0].set_xlabel('Predicted')
axes[0,0].set_ylabel('Actual')
axes[0,0].set_title('Confusion Matrix')

# 2. Model Performance Metrics Bar Chart
metrics = ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'ROC-AUC']
values = [accuracy, precision, recall, f1, roc_auc]
colors = ['skyblue', 'lightgreen', 'lightcoral', 'lightsalmon', 'lightsteelblue']

bars = axes[0,1].bar(metrics, values, color=colors, alpha=0.7, edgecolor='black')
axes[0,1].set_ylim(0, 1)
axes[0,1].set_title('Model Performance Metrics')
axes[0,1].set_ylabel('Score')

# Add value labels on bars
for bar, value in zip(bars, values):
    axes[0,1].text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, 
                   f'{value:.3f}', ha='center', va='bottom', fontweight='bold')

# 3. ROC Curve
fpr, tpr, thresholds = roc_curve(y_test, y_pred_proba)
axes[0,2].plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {roc_auc:.3f})')
axes[0,2].plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--', label='Random')
axes[0,2].set_xlim([0.0, 1.0])
axes[0,2].set_ylim([0.0, 1.05])
axes[0,2].set_xlabel('False Positive Rate')
axes[0,2].set_ylabel('True Positive Rate')
axes[0,2].set_title('ROC Curve')
axes[0,2].legend(loc="lower right")
axes[0,2].grid(True, alpha=0.3)

# 4. Class Distribution
class_counts = pd.Series(y).value_counts().sort_index()
class_labels = ['Low Risk', 'High Risk']
colors_pie = ['lightblue', 'lightcoral']
wedges, texts, autotexts = axes[1,0].pie(class_counts.values, labels=class_labels, 
                                         autopct='%1.1f%%', colors=colors_pie, 
                                         startangle=90)
axes[1,0].set_title('Dataset Class Distribution')

# 5. Feature Importances (Top 10)
importances = pd.Series(clf.feature_importances_, index=features).sort_values(ascending=True)
top_10_features = importances.tail(10)

bars = axes[1,1].barh(range(len(top_10_features)), top_10_features.values, 
                      color='lightgreen', alpha=0.7, edgecolor='black')
axes[1,1].set_yticks(range(len(top_10_features)))
axes[1,1].set_yticklabels(top_10_features.index, fontsize=9)
axes[1,1].set_xlabel('Importance')
axes[1,1].set_title('Top 10 Feature Importances')
axes[1,1].grid(True, alpha=0.3, axis='x')

# Add importance values on bars
for i, (bar, value) in enumerate(zip(bars, top_10_features.values)):
    axes[1,1].text(bar.get_width() + 0.001, bar.get_y() + bar.get_height()/2, 
                   f'{value:.3f}', ha='left', va='center', fontsize=8)

# 6. Prediction Probability Distribution
axes[1,2].hist(y_pred_proba[y_test == 0], bins=30, alpha=0.7, label='Low Risk (Actual)', 
               color='lightblue', density=True, edgecolor='black')
axes[1,2].hist(y_pred_proba[y_test == 1], bins=30, alpha=0.7, label='High Risk (Actual)', 
               color='lightcoral', density=True, edgecolor='black')
axes[1,2].axvline(x=0.5, color='red', linestyle='--', linewidth=2, label='Threshold (0.5)')
axes[1,2].set_xlabel('Predicted Probability')
axes[1,2].set_ylabel('Density')
axes[1,2].set_title('Prediction Probability Distribution')
axes[1,2].legend()
axes[1,2].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# Print detailed metrics
print(f"\n=== DETAILED METRICS ===")
print(f"Accuracy:  {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall:    {recall:.4f}")
print(f"F1-Score:  {f1:.4f}")
print(f"ROC-AUC:   {roc_auc:.4f}")
print(f"Total Samples: {len(y_test):,}")
print(f"Low Risk Samples: {np.sum(y_test == 0):,}")
print(f"High Risk Samples: {np.sum(y_test == 1):,}")


# ---------- SAVE MODEL ----------
import joblib
joblib.dump(clf, 'earthquake_risk_model.joblib')
print("Model saved as earthquake_risk_model.joblib")



# ---------- STEP 2: TEST MODEL ON REAL DATA ----------

# load your JSON file
with open('province_earthquake_features.json', 'r') as f:
    data = json.load(f)

province_data = pd.DataFrame(data['province_features'])

# make sure the columns match the training features
real_X = province_data[features]

# predict using the trained model
real_preds = clf.predict(real_X)
province_data['predicted_risk'] = ['High' if p == 1 else 'Low' for p in real_preds]

# ---------- STEP 3: PRINT HIGH-RISK PROVINCES ----------
high_risk_provs = province_data[province_data['predicted_risk'] == 'High']

print("\n=== CURRENT HIGH RISK PROVINCES ===")
if high_risk_provs.empty:
    print("No provinces currently classified as High Risk.")
else:
    for _, row in high_risk_provs.iterrows():
        print(f"{row['province_name']}: EQ Count (30d)={row['eq_count_last_30d']}, Max Mag={row['max_magnitude_last_30d']}, Avg Mag={row['avg_magnitude_last_30d']:.2f}")

# save to CSV if needed
province_data.to_csv('province_predictions.csv', index=False)
print("\nPredictions saved to province_predictions.csv")
