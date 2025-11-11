import pandas as pd
import json
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

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

print("\n=== TRAINING PERFORMANCE ===")
print(classification_report(y_test, y_pred, target_names=['Low', 'High']))

# confusion matrix
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(5,4))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Low','High'], yticklabels=['Low','High'])
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Confusion Matrix')
plt.show()

# feature importances
importances = pd.Series(clf.feature_importances_, index=features).sort_values(ascending=False)
plt.figure(figsize=(8,4))
sns.barplot(x=importances.values, y=importances.index)
plt.title('Feature Importances')
plt.show()


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
