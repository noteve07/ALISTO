import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# load dataset
df = pd.read_csv("dataset_v4_features.csv")

# features and label
features = [
    "eq_count_last_30d","max_magnitude_last_30d","avg_magnitude_last_30d",
    "min_magnitude_last_30d","std_magnitude_last_30d","avg_depth_last_30d",
    "max_depth_last_30d","min_depth_last_30d","days_since_last_eq",
    "days_since_last_major_eq","eq_count_last_7d","eq_count_last_14d",
    "volcanic_advisory"
]

# bias volcanic_advisory
df['volcanic_advisory'] = df['volcanic_advisory'] * 5  # scale up

X = df[features]
y = df['label_risk_level']

# train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# train random forest with balanced class weight
rf = RandomForestClassifier(n_estimators=200, random_state=42, class_weight='balanced')
rf.fit(X_train, y_train)

# predictions
y_pred = rf.predict(X_test)

# overall classification report
print("Classification Report:\n", classification_report(y_test, y_pred))

# province-level reports
provinces = df['province'].unique()
for prov in provinces:
    idx = df['province'] == prov
    y_true_prov = y[idx]
    y_pred_prov = rf.predict(X[idx][features])
    print(f"\nProvince: {prov}")
    print(classification_report(y_true_prov, y_pred_prov, zero_division=0))

# feature importance
importances = rf.feature_importances_
feat_imp = pd.Series(importances, index=features).sort_values(ascending=False)

# confusion matrix
cm = confusion_matrix(y_test, y_pred, labels=["Low","High"])

# visualization
fig, axes = plt.subplots(1,2,figsize=(16,6))

# feature importance
sns.barplot(x=feat_imp.values, y=feat_imp.index, ax=axes[0])
axes[0].set_title("Feature Importance")
axes[0].set_xlabel("Importance")
axes[0].set_ylabel("Features")

# confusion matrix heatmap
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=["Low","High"], yticklabels=["Low","High"], ax=axes[1])
axes[1].set_title("Confusion Matrix")
axes[1].set_xlabel("Predicted")
axes[1].set_ylabel("Actual")

plt.tight_layout()
plt.show()
