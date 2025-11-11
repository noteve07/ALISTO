import pandas as pd
import json
import joblib

# load trained model
clf = joblib.load('earthquake_risk_model.joblib')

# load json data
with open('province_earthquake_features_v2.json', 'r') as f:
    data = json.load(f)

province_data = pd.DataFrame(data['province_features'])

# features used for training
features = [
    'eq_count_last_30d', 'max_magnitude_last_30d', 'avg_magnitude_last_30d',
    'min_magnitude_last_30d', 'std_magnitude_last_30d', 'avg_depth_last_30d',
    'max_depth_last_30d', 'min_depth_last_30d', 'days_since_last_eq',
    'days_since_last_major_eq', 'eq_count_last_7d', 'eq_count_last_14d'
]

# predict
real_X = province_data[features]
preds = clf.predict(real_X)
province_data['predicted_risk'] = ['High' if p == 1 else 'Low' for p in preds]

# filter only high-risk provinces
high_risk = province_data[province_data['predicted_risk'] == 'High']

print("\n=== CURRENT HIGH-RISK PROVINCES ===")
if high_risk.empty:
    print("No provinces currently classified as High Risk.")
else:
    for _, row in high_risk.iterrows():
        print(f"{row['province_name']}: EQ Count 30d={row['eq_count_last_30d']}, Max Mag={row['max_magnitude_last_30d']}, Avg Mag={row['avg_magnitude_last_30d']:.2f}")
