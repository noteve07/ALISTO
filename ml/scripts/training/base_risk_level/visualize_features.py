import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os
import warnings
warnings.filterwarnings('ignore')

def load_province_features():
    """Load province features CSV"""
    print("Loading province features data...")
    
    current_dir = os.path.dirname(__file__)
    features_file = os.path.join(current_dir, 'province_features.csv')
    # Optional enriched features (with nearest_fault_km)
    fe_dir = os.path.join(os.path.dirname(os.path.dirname(current_dir)), 'feature_engineering', 'fault_line_distance')
    enriched_file = os.path.join(fe_dir, 'province_features_with_fault_distance.csv')
    
    if not os.path.exists(features_file):
        raise FileNotFoundError(f"Province features file not found: {features_file}")
    
    df = pd.read_csv(features_file)

    # If enriched file exists, merge nearest_fault_km
    if os.path.exists(enriched_file):
        try:
            df_enriched = pd.read_csv(enriched_file, usecols=['province', 'nearest_fault_km'])
            before_cols = set(df.columns)
            df = df.merge(df_enriched, on='province', how='left')
            added_cols = list(set(df.columns) - before_cols)
            if 'nearest_fault_km' in added_cols:
                print("✓ Added column from enriched features: ['nearest_fault_km']")
        except Exception as e:
            print(f"⚠️  Could not merge enriched fault distance data: {e}")

    print(f"✓ Loaded {len(df)} provinces with features")
    print(f"✓ Feature columns: {[col for col in df.columns if col != 'province']}")
    
    return df

def create_correlation_heatmap(df):
    """Create correlation heatmap of features"""
    print("\nCreating correlation heatmap...")
    
    # Select only numeric features (exclude province name)
    numeric_features = df.select_dtypes(include=[np.number]).columns.tolist()
    print(f"Analyzing correlations for: {numeric_features}")
    
    # Calculate correlation matrix
    correlation_matrix = df[numeric_features].corr()
    
    # Set up the matplotlib figure
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    
    # 1. Full Correlation Heatmap
    ax1 = axes[0, 0]
    mask = np.triu(np.ones_like(correlation_matrix, dtype=bool))  # Mask upper triangle
    sns.heatmap(correlation_matrix, mask=mask, annot=True, cmap='RdBu_r', center=0,
                square=True, linewidths=0.5, cbar_kws={"shrink": .8}, ax=ax1, fmt='.2f')
    ax1.set_title('Feature Correlation Heatmap\n(Lower Triangle)', fontweight='bold', fontsize=12)
    
    # 2. Full Correlation Heatmap (without mask for comparison)
    ax2 = axes[0, 1]
    sns.heatmap(correlation_matrix, annot=True, cmap='RdBu_r', center=0,
                square=True, linewidths=0.5, cbar_kws={"shrink": .8}, ax=ax2, fmt='.2f')
    ax2.set_title('Complete Correlation Matrix', fontweight='bold', fontsize=12)
    
    # 3. Correlation with Target Features (Core Clustering Features)
    ax3 = axes[1, 0]
    # Focus on correlations with the core clustering features (+ fault distance if present)
    core_features_all = ['total_quakes', 'major_quakes_m3plus', 'nearest_fault_km']
    core_features = [f for f in core_features_all if f in correlation_matrix.columns]
    core_correlations = correlation_matrix[core_features]
    
    sns.heatmap(core_correlations, annot=True, cmap='viridis', 
                square=False, linewidths=0.5, cbar_kws={"shrink": .8}, ax=ax3, fmt='.2f')
    core_title = 'Correlations with Core Clustering Features\n(' + \
                 ', '.join(core_features).replace('_', ' ') + ')'
    ax3.set_title(core_title, 
                  fontweight='bold', fontsize=11)
    
    # 4. Feature Importance Visualization (Absolute Correlations)
    ax4 = axes[1, 1]
    # Calculate mean absolute correlation for each feature (excluding self-correlation)
    feature_importance = []
    for feature in numeric_features:
        # Get correlations with all other features (exclude self)
        other_correlations = correlation_matrix[feature].drop(feature)
        mean_abs_corr = abs(other_correlations).mean()
        feature_importance.append((feature, mean_abs_corr))
    
    # Sort by importance
    feature_importance.sort(key=lambda x: x[1], reverse=True)
    features, importance = zip(*feature_importance)
    
    bars = ax4.barh(range(len(features)), importance, color='lightcoral', edgecolor='darkred')
    ax4.set_yticks(range(len(features)))
    ax4.set_yticklabels(features, fontsize=10)
    ax4.set_xlabel('Mean Absolute Correlation', fontweight='bold')
    ax4.set_title('Feature Interconnectedness\n(Mean Absolute Correlation with Others)', 
                  fontweight='bold', fontsize=11)
    ax4.grid(axis='x', alpha=0.3)
    
    # Add value labels on bars
    for i, bar in enumerate(bars):
        width = bar.get_width()
        ax4.text(width + 0.01, bar.get_y() + bar.get_height()/2, 
                f'{width:.3f}', ha='left', va='center', fontsize=9)
    
    plt.tight_layout()
    
    return fig, correlation_matrix

def analyze_correlations(correlation_matrix):
    """Analyze and report key correlations"""
    print(f"\n{'='*80}")
    print("CORRELATION ANALYSIS")
    print(f"{'='*80}")
    
    # Find highest positive correlations (excluding self-correlations)
    print("\nSTRONGEST POSITIVE CORRELATIONS:")
    print("-" * 50)
    
    # Get upper triangle of correlation matrix (excluding diagonal)
    upper_triangle = np.triu(correlation_matrix, k=1)
    correlation_pairs = []
    
    for i in range(len(correlation_matrix.columns)):
        for j in range(i+1, len(correlation_matrix.columns)):
            corr_value = correlation_matrix.iloc[i, j]
            feature1 = correlation_matrix.columns[i]
            feature2 = correlation_matrix.columns[j]
            correlation_pairs.append((feature1, feature2, corr_value))
    
    # Sort by correlation strength (absolute value)
    correlation_pairs.sort(key=lambda x: abs(x[2]), reverse=True)
    
    # Display top correlations
    for feature1, feature2, corr in correlation_pairs[:10]:
        direction = "↗️" if corr > 0 else "↘️"
        strength = "Very Strong" if abs(corr) > 0.8 else "Strong" if abs(corr) > 0.6 else "Moderate" if abs(corr) > 0.4 else "Weak"
        print(f"{direction} {feature1:<20} ↔ {feature2:<20} : {corr:>7.3f} ({strength})")
    
    # Analyze core clustering features
    print(f"\nCORE CLUSTERING FEATURES ANALYSIS:")
    print("-" * 50)
    present_core = [f for f in ['total_quakes', 'major_quakes_m3plus', 'nearest_fault_km'] if f in correlation_matrix.columns]
    print(f"Features used for clustering: {', '.join(present_core)}")

    if all(f in correlation_matrix.columns for f in ['total_quakes', 'major_quakes_m3plus']):
        core_corr = correlation_matrix.loc['total_quakes', 'major_quakes_m3plus']
        print(f"Correlation between total_quakes and major_quakes_m3plus: {core_corr:.3f}")
    
    if core_corr > 0.8:
        print("⚠️  Very high correlation - features might be redundant")
    elif core_corr > 0.6:
        print("⚠️  High correlation - consider feature selection")
    elif core_corr > 0.4:
        print("✓ Moderate correlation - features are related but distinct")
    else:
        print("✓ Low correlation - features capture different aspects")
    
    # Analyze relationships with core features (including nearest_fault_km if present)
    print(f"\nRELATIONSHIPS WITH CORE FEATURES:")
    print("-" * 50)
    
    for core_feature in present_core:
        print(f"\n{core_feature.upper()}:")
        correlations = correlation_matrix[core_feature].drop(core_feature)
        sorted_corr = correlations.abs().sort_values(ascending=False)
        
        for feature, corr_val in sorted_corr.head(5).items():
            actual_corr = correlations[feature]
            direction = "↗️" if actual_corr > 0 else "↘️"
            print(f"  {direction} {feature:<20} : {actual_corr:>7.3f}")

def create_feature_distribution_comparison(df):
    """Create side-by-side distribution plots for all features"""
    print("\nCreating feature distribution comparison...")
    
    # Select numeric features
    numeric_features = df.select_dtypes(include=[np.number]).columns.tolist()
    
    # Create subplots
    n_features = len(numeric_features)
    n_cols = 3
    n_rows = (n_features + n_cols - 1) // n_cols
    
    fig, axes = plt.subplots(n_rows, n_cols, figsize=(15, 4 * n_rows))
    axes = axes.flatten() if n_rows > 1 else [axes] if n_cols == 1 else axes
    
    for i, feature in enumerate(numeric_features):
        ax = axes[i]
        
        # Create histogram with KDE
        series = df[feature].dropna()
        ax.hist(series, bins=20, alpha=0.7, color='skyblue', edgecolor='navy', density=True)
        
        # Add KDE curve (guard against constant series)
        try:
            from scipy.stats import gaussian_kde
            if series.nunique() > 1:
                kde = gaussian_kde(series)
                x_range = np.linspace(series.min(), series.max(), 100)
                ax.plot(x_range, kde(x_range), color='red', linewidth=2, label='KDE')
        except Exception:
            pass
        
        ax.set_title(f'{feature}\n(μ={df[feature].mean():.2f}, σ={df[feature].std():.2f})', 
                    fontweight='bold')
        ax.set_ylabel('Density')
        ax.grid(True, alpha=0.3)
        ax.legend()
    
    # Hide unused subplots
    for i in range(len(numeric_features), len(axes)):
        axes[i].set_visible(False)
    
    plt.tight_layout()
    
    return fig

def main():
    print("="*80)
    print("FEATURE CORRELATION ANALYSIS")
    print("="*80)
    print("Analyzing correlations between province earthquake features")
    print("="*80)
    
    # Load data
    df = load_province_features()
    
    # Create correlation heatmap
    fig1, correlation_matrix = create_correlation_heatmap(df)
    
    # Analyze correlations
    analyze_correlations(correlation_matrix)
    
    # Create feature distributions
    fig2 = create_feature_distribution_comparison(df)
    
    # Save plots
    current_dir = os.path.dirname(__file__)
    
    # Save correlation heatmap
    heatmap_path = os.path.join(current_dir, 'feature_correlation_heatmap.png')
    fig1.savefig(heatmap_path, dpi=300, bbox_inches='tight')
    print(f"\n✓ Correlation heatmap saved to: {heatmap_path}")
    
    # Save distribution plots
    distribution_path = os.path.join(current_dir, 'feature_distributions.png')
    fig2.savefig(distribution_path, dpi=300, bbox_inches='tight')
    print(f"✓ Feature distributions saved to: {distribution_path}")
    
    print(f"\n{'='*80}")
    print("FEATURE ANALYSIS COMPLETE")
    print(f"{'='*80}")
    print(f"✓ Correlation analysis for {len(df)} provinces")
    print(f"✓ Heatmap showing feature relationships")
    print(f"✓ Distribution plots for all features")
    print(f"✓ Correlation insights for clustering strategy")
    
    plt.show()

if __name__ == "__main__":
    main()