import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import json

# load dataset
df = pd.read_csv("province_features_v3.csv")

# select 3 features
features = ["total_quakes", "major_quakes_m3plus", "nearest_fault_distance_km"]
X = df[features].fillna(0)

# scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# perform clustering
kmeans = KMeans(n_clusters=2, random_state=42)
labels = kmeans.fit_predict(X_scaled)

# evaluation metrics
sil_score = silhouette_score(X_scaled, labels)
db_index = davies_bouldin_score(X_scaled, labels)
ch_score = calinski_harabasz_score(X_scaled, labels)

print(f"Silhouette Score: {sil_score:.3f}")
print(f"Davies-Bouldin Index: {db_index:.3f}")
print(f"Calinski-Harabasz Score: {ch_score:.3f}")
print(f"KMeans Inertia: {kmeans.inertia_:.2f}")

# compute confidence per province
distances = kmeans.transform(X_scaled)
assigned_cluster = kmeans.labels_
scores = 1 / (1 + distances[np.arange(len(distances)), assigned_cluster])
scores = (scores - scores.min()) / (scores.max() - scores.min())

# attach to dataframe
df["cluster"] = assigned_cluster
df["confidence"] = scores
df["risk_label"] = df["cluster"].map({0: "Low Risk", 1: "Medium Risk"})

# save to json
results = df[["province", "cluster", "risk_label", "confidence"]].to_dict(orient="records")
with open("cluster_results.json", "w") as f:
    json.dump(results, f, indent=4)

print("\nCluster Results saved to cluster_results.json")

# show 3d visualization
fig = plt.figure(figsize=(10, 7))
ax = fig.add_subplot(111, projection="3d")

scatter = ax.scatter(
    X_scaled[:, 0],
    X_scaled[:, 1],
    X_scaled[:, 2],
    c=labels,
    cmap="coolwarm",
    s=50,
    alpha=0.8
)

ax.set_title("3D Clustering Visualization (KMeans, 2 Clusters)")
ax.set_xlabel("Total Quakes (scaled)")
ax.set_ylabel("Major Quakes M>3 (scaled)")
ax.set_zlabel("Nearest Fault Distance (scaled)")

# add legend
legend_labels = ["Low Risk", "Medium Risk"]
for i in range(2):
    ax.scatter([], [], [], color=scatter.cmap(scatter.norm(i)), label=legend_labels[i])
ax.legend()

plt.tight_layout()
plt.show()
