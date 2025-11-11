import pandas as pd
import matplotlib.pyplot as plt

# load the feature dataset
df = pd.read_csv("dataset_v3_features.csv")

# define high risk based on thresholds
df['label_risk_level'] = df.apply(
    lambda row: 'High' if (row['label_max_magnitude_next_7d'] >= 4.0 or row['label_eq_count_next_7d'] > 200) else 'Low',
    axis=1
)

# 2D visualization
colors = {'Low': 'green', 'High': 'red'}
plt.figure(figsize=(10, 7))
plt.scatter(
    df['label_eq_count_next_7d'], 
    df['label_max_magnitude_next_7d'], 
    c=df['label_risk_level'].map(colors),
    alpha=0.6,
    s=30
)
plt.xlabel('EQ Count Next 7d')
plt.ylabel('Max Magnitude Next 7d')
plt.title('Earthquake Risk Levels (Threshold Approach)')

# add legend
for risk, color in colors.items():
    plt.scatter([], [], c=color, label=risk)
plt.legend()
plt.show()
