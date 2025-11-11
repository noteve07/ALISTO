import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# load dataset
df = pd.read_csv('dataset_v4_features.csv')

# keep only needed columns
features = [
    'eq_count_last_30d', 'max_magnitude_last_30d', 'avg_magnitude_last_30d',
    'min_magnitude_last_30d', 'std_magnitude_last_30d', 'avg_depth_last_30d',
    'max_depth_last_30d', 'min_depth_last_30d', 'days_since_last_eq',
    'days_since_last_major_eq', 'eq_count_last_7d', 'eq_count_last_14d',
    'volcanic_advisory'
]

# map label_risk_level to binary: Low=0, High=1
df['label'] = df['label_risk_level'].map({'Low': 0, 'High': 1})

# drop rows with missing values
df = df.dropna(subset=features + ['label'])

X = df[features]
y = df['label']

# train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# train random forest
clf = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
clf.fit(X_train, y_train)

# predictions
y_pred = clf.predict(X_test)

# metrics
print("Classification Report:")
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

# province-level predictions
provinces = df['province'].unique()
for prov in provinces:
    prov_df = df[df['province'] == prov]
    if prov_df.empty:
        continue
    prov_X = prov_df[features]
    prov_y = prov_df['label']
    prov_pred = clf.predict(prov_X)
    print(f"\nProvince: {prov}")
    print(classification_report(prov_y, prov_pred, target_names=['Low','High']))
