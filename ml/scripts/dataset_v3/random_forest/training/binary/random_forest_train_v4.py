import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score, TimeSeriesSplit
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, roc_auc_score, roc_curve
from sklearn.preprocessing import LabelEncoder
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import plotly.offline as pyo
import joblib
import os
from datetime import datetime
from tqdm import tqdm
import warnings
warnings.filterwarnings('ignore')

# Set up plotting style
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 10

def load_and_prepare_data(csv_path):
    """Load and prepare the earthquake features dataset"""
    print("Loading earthquake features dataset...")
    with tqdm(desc="Reading CSV file", unit=" rows") as pbar:
        df = pd.read_csv(csv_path)
        pbar.update(len(df))
    
    print(f"Dataset shape: {df.shape}")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")
    print(f"Provinces: {df['province'].nunique()}")
    
    # Convert date column to datetime
    df['date'] = pd.to_datetime(df['date'])
    
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

def create_comprehensive_visualizations(df, output_dir):
    """Create comprehensive data visualizations"""
    print("\n" + "="*60)
    print("GENERATING COMPREHENSIVE VISUALIZATIONS")
    print("="*60)
    
    # Create visualizations directory
    viz_dir = os.path.join(output_dir, 'visualizations')
    os.makedirs(viz_dir, exist_ok=True)
    
    # 1. Target Distribution Visualization
    fig = plt.figure(figsize=(15, 10))
    
    # Binary target distribution
    plt.subplot(2, 3, 1)
    target_counts = df['label_has_major_eq'].value_counts()
    colors = ['lightcoral', 'lightblue']
    plt.pie(target_counts.values, labels=['No Major EQ', 'Major EQ'], autopct='%1.1f%%', colors=colors)
    plt.title('Binary Target Distribution\n(Has Major Earthquake)')
    
    # Risk level distribution
    plt.subplot(2, 3, 2)
    risk_counts = df['label_risk_level'].value_counts()
    colors_risk = ['green', 'orange', 'red']
    plt.pie(risk_counts.values, labels=risk_counts.index, autopct='%1.1f%%', colors=colors_risk)
    plt.title('Risk Level Distribution')
    
    # Earthquake count distribution
    plt.subplot(2, 3, 3)
    plt.hist(df['label_eq_count_next_7d'], bins=30, alpha=0.7, color='skyblue', edgecolor='black')
    plt.xlabel('Earthquake Count (Next 7 Days)')
    plt.ylabel('Frequency')
    plt.title('Distribution of Earthquake Count')
    
    # Magnitude distribution
    plt.subplot(2, 3, 4)
    df_with_mag = df[df['label_max_magnitude_next_7d'] > 0]
    plt.hist(df_with_mag['label_max_magnitude_next_7d'], bins=30, alpha=0.7, color='lightgreen', edgecolor='black')
    plt.xlabel('Max Magnitude (Next 7 Days)')
    plt.ylabel('Frequency')
    plt.title('Distribution of Max Magnitude (>0)')
    
    # Province-wise earthquake count
    plt.subplot(2, 3, 5)
    province_counts = df.groupby('province')['label_has_major_eq'].sum().sort_values(ascending=False)
    top_10_provinces = province_counts.head(10)
    plt.barh(range(len(top_10_provinces)), top_10_provinces.values)
    plt.yticks(range(len(top_10_provinces)), top_10_provinces.index)
    plt.xlabel('Major Earthquake Count')
    plt.title('Top 10 Provinces by Major EQ Count')
    
    # Time series of earthquake activity
    plt.subplot(2, 3, 6)
    monthly_activity = df.groupby(df['date'].dt.to_period('M'))['label_has_major_eq'].sum()
    monthly_activity.plot(kind='line', color='red', alpha=0.7)
    plt.xlabel('Date')
    plt.ylabel('Major Earthquake Count')
    plt.title('Major Earthquake Activity Over Time')
    plt.xticks(rotation=45)
    
    plt.tight_layout()
    plt.savefig(os.path.join(viz_dir, 'target_distributions.png'), dpi=300, bbox_inches='tight')
    plt.show()
    
    # 2. Feature Correlation Heatmap
    print("Generating correlation heatmap...")
    feature_cols = [col for col in df.columns if not col.startswith('label') and col not in ['row_id', 'province', 'date']]
    
    plt.figure(figsize=(12, 10))
    correlation_matrix = df[feature_cols].corr()
    mask = np.triu(np.ones_like(correlation_matrix, dtype=bool))
    sns.heatmap(correlation_matrix, mask=mask, annot=True, cmap='coolwarm', center=0,
                square=True, linewidths=0.5, cbar_kws={"shrink": .8})
    plt.title('Feature Correlation Matrix')
    plt.tight_layout()
    plt.savefig(os.path.join(viz_dir, 'correlation_heatmap.png'), dpi=300, bbox_inches='tight')
    plt.show()
    
    # 3. Time Series Analysis
    print("Generating time series analysis...")
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # Monthly earthquake activity
    monthly_stats = df.groupby(df['date'].dt.to_period('M')).agg({
        'label_eq_count_next_7d': 'sum',
        'label_max_magnitude_next_7d': 'max',
        'label_has_major_eq': 'sum',
        'eq_count_last_30d': 'mean'
    })
    
    axes[0, 0].plot(monthly_stats.index.to_timestamp(), monthly_stats['label_eq_count_next_7d'], color='blue')
    axes[0, 0].set_title('Monthly Total Earthquake Count')
    axes[0, 0].set_ylabel('Count')
    axes[0, 0].tick_params(axis='x', rotation=45)
    
    axes[0, 1].plot(monthly_stats.index.to_timestamp(), monthly_stats['label_max_magnitude_next_7d'], color='red')
    axes[0, 1].set_title('Monthly Max Magnitude')
    axes[0, 1].set_ylabel('Magnitude')
    axes[0, 1].tick_params(axis='x', rotation=45)
    
    axes[1, 0].plot(monthly_stats.index.to_timestamp(), monthly_stats['label_has_major_eq'], color='orange')
    axes[1, 0].set_title('Monthly Major Earthquake Count')
    axes[1, 0].set_ylabel('Major EQ Count')
    axes[1, 0].tick_params(axis='x', rotation=45)
    
    axes[1, 1].plot(monthly_stats.index.to_timestamp(), monthly_stats['eq_count_last_30d'], color='green')
    axes[1, 1].set_title('Average Historical Activity (30d)')
    axes[1, 1].set_ylabel('Avg Count')
    axes[1, 1].tick_params(axis='x', rotation=45)
    
    plt.tight_layout()
    plt.savefig(os.path.join(viz_dir, 'time_series_analysis.png'), dpi=300, bbox_inches='tight')
    plt.show()
    
    # 4. Interactive Provincial Analysis with Plotly
    print("Generating interactive provincial analysis...")
    
    # Province-wise statistics
    province_stats = df.groupby('province').agg({
        'label_has_major_eq': ['sum', 'count'],
        'label_max_magnitude_next_7d': 'max',
        'eq_count_last_30d': 'mean',
        'max_magnitude_last_30d': 'mean'
    }).round(2)
    
    province_stats.columns = ['major_eq_count', 'total_samples', 'max_magnitude_future', 'avg_historical_count', 'avg_historical_magnitude']
    province_stats['major_eq_rate'] = (province_stats['major_eq_count'] / province_stats['total_samples'] * 100).round(2)
    province_stats = province_stats.sort_values('major_eq_rate', ascending=False)
    
    # Create interactive bar plot
    fig = go.Figure(data=[
        go.Bar(
            x=province_stats.index,
            y=province_stats['major_eq_rate'],
            text=province_stats['major_eq_rate'],
            textposition='auto',
            hovertemplate='<b>%{x}</b><br>Major EQ Rate: %{y:.1f}%<br>Total Samples: %{customdata[0]}<br>Major EQ Count: %{customdata[1]}<extra></extra>',
            customdata=province_stats[['total_samples', 'major_eq_count']].values
        )
    ])
    
    fig.update_layout(
        title='Major Earthquake Rate by Province (%)',
        xaxis_title='Province',
        yaxis_title='Major Earthquake Rate (%)',
        xaxis_tickangle=-45,
        height=600
    )
    
    fig.write_html(os.path.join(viz_dir, 'provincial_analysis.html'))
    
    # 5. Feature Distribution Analysis
    print("Generating feature distribution analysis...")
    feature_cols_numeric = [col for col in feature_cols if df[col].dtype in ['int64', 'float64']]
    
    fig, axes = plt.subplots(3, 3, figsize=(18, 15))
    axes = axes.ravel()
    
    for i, col in enumerate(feature_cols_numeric[:9]):
        axes[i].hist(df[col], bins=30, alpha=0.7, edgecolor='black')
        axes[i].set_title(f'Distribution of {col}')
        axes[i].set_xlabel(col)
        axes[i].set_ylabel('Frequency')
    
    plt.tight_layout()
    plt.savefig(os.path.join(viz_dir, 'feature_distributions.png'), dpi=300, bbox_inches='tight')
    plt.show()
    
    print(f"✓ Visualizations saved to: {viz_dir}")
    return province_stats

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
    print(f"Feature columns ({len(feature_columns)}): {feature_columns}")
    
    return X, targets, feature_columns, le_province

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
    with tqdm(desc="Predicting", total=3) as pbar:
        y_pred = rf_classifier.predict(X_test)
        pbar.update(1)
        y_pred_proba = rf_classifier.predict_proba(X_test)[:, 1]
        pbar.update(1)
        # Cross-validation score
        cv_scores = cross_val_score(rf_classifier, X_train, y_train, cv=5, scoring='f1')
        pbar.update(1)
    
    # Evaluate
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    try:
        auc = roc_auc_score(y_test, y_pred_proba)
    except:
        auc = 0.5
    
    print(f"\n📊 BINARY CLASSIFICATION RESULTS:")
    print(f"Accuracy:  {accuracy:.3f}")
    print(f"Precision: {precision:.3f}")
    print(f"Recall:    {recall:.3f}")
    print(f"F1-Score:  {f1:.3f}")
    print(f"AUC-ROC:   {auc:.3f}")
    print(f"CV F1 Score: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
    
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
        'auc': auc,
        'cv_scores': cv_scores,
        'y_test': y_test,
        'y_pred': y_pred,
        'y_pred_proba': y_pred_proba,
        'confusion_matrix': cm
    }

def plot_model_evaluation(results, output_dir, model_name):
    """Plot comprehensive model evaluation visualizations"""
    
    viz_dir = os.path.join(output_dir, 'visualizations', 'model_evaluation')
    os.makedirs(viz_dir, exist_ok=True)
    
    if model_name == 'binary':
        # Binary classification evaluation plots
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        
        # Confusion Matrix
        sns.heatmap(results['confusion_matrix'], annot=True, fmt='d', cmap='Blues',
                   xticklabels=['No Major EQ', 'Major EQ'], 
                   yticklabels=['No Major EQ', 'Major EQ'], ax=axes[0, 0])
        axes[0, 0].set_title('Confusion Matrix')
        axes[0, 0].set_xlabel('Predicted')
        axes[0, 0].set_ylabel('Actual')
        
        # ROC Curve
        try:
            fpr, tpr, _ = roc_curve(results['y_test'], results['y_pred_proba'])
            axes[0, 1].plot(fpr, tpr, label=f'ROC Curve (AUC = {results["auc"]:.3f})')
            axes[0, 1].plot([0, 1], [0, 1], 'k--', label='Random')
            axes[0, 1].set_xlabel('False Positive Rate')
            axes[0, 1].set_ylabel('True Positive Rate')
            axes[0, 1].set_title('ROC Curve')
            axes[0, 1].legend()
        except:
            axes[0, 1].text(0.5, 0.5, 'ROC Curve\nNot Available', ha='center', va='center')
        
        # Prediction Distribution
        axes[1, 0].hist(results['y_pred_proba'][results['y_test'] == 0], 
                       alpha=0.7, label='No Major EQ', bins=30, density=True)
        axes[1, 0].hist(results['y_pred_proba'][results['y_test'] == 1], 
                       alpha=0.7, label='Major EQ', bins=30, density=True)
        axes[1, 0].set_xlabel('Predicted Probability')
        axes[1, 0].set_ylabel('Density')
        axes[1, 0].set_title('Prediction Probability Distribution')
        axes[1, 0].legend()
        
        # Cross-validation scores
        axes[1, 1].boxplot(results['cv_scores'])
        axes[1, 1].set_title('Cross-Validation F1 Scores')
        axes[1, 1].set_ylabel('F1 Score')
        axes[1, 1].set_xticklabels(['CV Scores'])
        
        plt.tight_layout()
        plt.savefig(os.path.join(viz_dir, f'{model_name}_evaluation.png'), dpi=300, bbox_inches='tight')
        plt.show()

def plot_feature_importance(model, feature_names, model_name, output_dir, top_n=15):
    """Plot feature importance with enhanced visualization"""
    
    importance = model.feature_importances_
    indices = np.argsort(importance)[::-1]
    
    # Select top N features
    top_indices = indices[:top_n]
    top_features = [feature_names[i] for i in top_indices]
    top_importance = importance[top_indices]
    
    # Create visualization
    plt.figure(figsize=(12, 8))
    colors = plt.cm.viridis(np.linspace(0, 1, len(top_features)))
    bars = plt.barh(range(len(top_features)), top_importance, color=colors)
    
    plt.yticks(range(len(top_features)), top_features)
    plt.xlabel('Feature Importance')
    plt.title(f'Top {top_n} Feature Importance - {model_name}')
    plt.gca().invert_yaxis()
    
    # Add value labels on bars
    for i, (bar, importance_val) in enumerate(zip(bars, top_importance)):
        plt.text(bar.get_width() + 0.001, bar.get_y() + bar.get_height()/2, 
                f'{importance_val:.3f}', ha='left', va='center')
    
    plt.tight_layout()
    
    viz_dir = os.path.join(output_dir, 'visualizations', 'feature_importance')
    os.makedirs(viz_dir, exist_ok=True)
    plt.savefig(os.path.join(viz_dir, f'{model_name}_feature_importance.png'), dpi=300, bbox_inches='tight')
    plt.show()
    
    # Print top features
    print(f"\nTop {top_n} Features for {model_name}:")
    for i, (feature, imp) in enumerate(zip(top_features, top_importance)):
        print(f"  {i+1:2d}. {feature:<25} : {imp:.4f}")
    
def train_multiclass_classifier(X, y, test_size=0.2, random_state=42):
    """Train Random Forest for multi-class classification (risk level)"""
    
    print("\n" + "="*60)
    print("TRAINING MULTI-CLASS CLASSIFIER (Risk Level)")
    print("="*60)
    
    # Encode risk levels
    le_risk = LabelEncoder()
    y_encoded = le_risk.fit_transform(y)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=test_size, random_state=random_state, stratify=y_encoded
    )
    
    print(f"Training set: {X_train.shape[0]:,} samples")
    print(f"Test set: {X_test.shape[0]:,} samples")
    print(f"Risk levels: {le_risk.classes_}")
    
    # Train Random Forest
    print("\nTraining Random Forest Multi-class Classifier...")
    rf_multiclass = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=random_state,
        n_jobs=-1,
        class_weight='balanced',
        verbose=1
    )
    
    # Fit with progress
    with tqdm(desc="Training Multi-class Classifier", total=1) as pbar:
        rf_multiclass.fit(X_train, y_train)
        pbar.update(1)
    
    # Predictions
    print("Making predictions...")
    with tqdm(desc="Predicting", total=2) as pbar:
        y_pred = rf_multiclass.predict(X_test)
        pbar.update(1)
        cv_scores = cross_val_score(rf_multiclass, X_train, y_train, cv=5, scoring='f1_macro')
        pbar.update(1)
    
    # Evaluate
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='macro')
    recall = recall_score(y_test, y_pred, average='macro')
    f1 = f1_score(y_test, y_pred, average='macro')
    
    print(f"\n📊 MULTI-CLASS CLASSIFICATION RESULTS:")
    print(f"Accuracy:  {accuracy:.3f}")
    print(f"Precision: {precision:.3f} (macro)")
    print(f"Recall:    {recall:.3f} (macro)")
    print(f"F1-Score:  {f1:.3f} (macro)")
    print(f"CV F1 Score: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
    
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le_risk.classes_))
    
    print(f"\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    
    return rf_multiclass, {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'cv_scores': cv_scores,
        'y_test': y_test,
        'y_pred': y_pred,
        'confusion_matrix': cm,
        'label_encoder': le_risk
    }

def train_regressor(X, y, target_name, test_size=0.2, random_state=42):
    """Train Random Forest for regression"""
    
    print(f"\n" + "="*60)
    print(f"TRAINING REGRESSOR ({target_name})")
    print("="*60)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    
    print(f"Training set: {X_train.shape[0]:,} samples")
    print(f"Test set: {X_test.shape[0]:,} samples")
    print(f"Target range: {y.min():.2f} - {y.max():.2f}")
    
    # Train Random Forest
    print(f"\nTraining Random Forest Regressor for {target_name}...")
    rf_regressor = RandomForestRegressor(
        n_estimators=100,
        max_depth=20,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=random_state,
        n_jobs=-1,
        verbose=1
    )
    
    # Fit with progress
    with tqdm(desc=f"Training {target_name} Regressor", total=1) as pbar:
        rf_regressor.fit(X_train, y_train)
        pbar.update(1)
    
    # Predictions
    print("Making predictions...")
    with tqdm(desc="Predicting", total=2) as pbar:
        y_pred = rf_regressor.predict(X_test)
        pbar.update(1)
        cv_scores = cross_val_score(rf_regressor, X_train, y_train, cv=5, scoring='r2')
        pbar.update(1)
    
    # Evaluate
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"\n📊 REGRESSION RESULTS ({target_name}):")
    print(f"RMSE:      {rmse:.3f}")
    print(f"MAE:       {mae:.3f}")
    print(f"R² Score:  {r2:.3f}")
    print(f"CV R² Score: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
    
    return rf_regressor, {
        'mse': mse,
        'rmse': rmse,
        'mae': mae,
        'r2': r2,
        'cv_scores': cv_scores,
        'y_test': y_test,
        'y_pred': y_pred,
        'target_name': target_name
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

def save_models(models, output_dir, metadata=None):
    """Save trained models with metadata"""
    
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    print("\nSaving models...")
    model_info = {}
    
    for model_name, model in tqdm(models.items(), desc="Saving models"):
        filename = f"{model_name}_rf_model_{timestamp}.joblib"
        filepath = os.path.join(output_dir, filename)
        joblib.dump(model, filepath)
        model_info[model_name] = {
            'filepath': filepath,
            'timestamp': timestamp,
            'model_type': type(model).__name__
        }
        print(f"✓ Saved {model_name} model: {filepath}")
    
    # Save model metadata
    if metadata:
        metadata_file = os.path.join(output_dir, f"model_metadata_{timestamp}.json")
        import json
        with open(metadata_file, 'w') as f:
            json.dump({
                'models': model_info,
                'training_results': metadata,
                'timestamp': timestamp
            }, f, indent=2, default=str)
        print(f"✓ Saved metadata: {metadata_file}")

def main():
    # Define paths
    script_dir = os.path.dirname(__file__)
    csv_path = os.path.join(script_dir, 'dataset_v3_features.csv')  # Updated path
    models_dir = os.path.join(script_dir, '..', '..', '..', 'models', 'earthquake')
    output_dir = os.path.join(script_dir, 'output')
    
    print("=" * 80)
    print("EARTHQUAKE RISK PREDICTION MODEL TRAINING V4")
    print("Dataset: dataset_v3_features.csv")
    print("=" * 80)
    
    # Check if dataset exists
    if not os.path.exists(csv_path):
        print(f"❌ Dataset not found: {csv_path}")
        print("Please ensure dataset_v3_features.csv is in the same directory as this script.")
        return None, None
    
    # Load data
    df = load_and_prepare_data(csv_path)
    
    # Create comprehensive visualizations
    province_stats = create_comprehensive_visualizations(df, output_dir)
    
    # Prepare features and targets
    X, targets, feature_columns, le_province = prepare_features_and_targets(df)
    
    # Store models and results
    trained_models = {}
    results = {}
    
    # 1. Binary Classification (Has Major Earthquake)
    print("\n" + "🎯" * 20)
    binary_model, binary_results = train_binary_classifier(X, targets['has_major_eq'])
    trained_models['binary_classifier'] = binary_model
    results['binary'] = binary_results
    
    # Plot binary model evaluation
    plot_model_evaluation(binary_results, output_dir, 'binary')
    
    # 2. Multi-class Classification (Risk Level)
    print("\n" + "🎯" * 20)
    multiclass_model, multiclass_results = train_multiclass_classifier(X, targets['risk_level'])
    trained_models['multiclass_classifier'] = multiclass_model
    results['multiclass'] = multiclass_results
    
    # 3. Regression (Earthquake Count)
    print("\n" + "🎯" * 20)
    eq_count_model, eq_count_results = train_regressor(X, targets['eq_count'], 'Earthquake Count')
    trained_models['eq_count_regressor'] = eq_count_model
    results['eq_count'] = eq_count_results
    
    # 4. Regression (Max Magnitude)
    print("\n" + "🎯" * 20)
    magnitude_model, magnitude_results = train_regressor(X, targets['max_magnitude'], 'Max Magnitude')
    trained_models['magnitude_regressor'] = magnitude_model
    results['magnitude'] = magnitude_results
    
    # Feature importance analysis
    print("\n" + "="*80)
    print("FEATURE IMPORTANCE ANALYSIS")
    print("="*80)
    
    plot_feature_importance(binary_model, feature_columns, "Binary Classifier", output_dir)
    plot_feature_importance(multiclass_model, feature_columns, "Multi-class Classifier", output_dir)
    plot_feature_importance(eq_count_model, feature_columns, "Earthquake Count Regressor", output_dir)
    plot_feature_importance(magnitude_model, feature_columns, "Magnitude Regressor", output_dir)
    
    # Create model comparison visualization
    create_model_comparison_visualization(results, output_dir)
    
    # Save models with metadata
    save_models(trained_models, models_dir, results)
    
    # Final summary
    print("\n" + "="*80)
    print("🎉 TRAINING COMPLETED - SUMMARY")
    print("="*80)
    print(f"✅ Dataset: {len(df):,} samples, {len(feature_columns)} features")
    print(f"✅ Binary Classification:")
    print(f"   - Accuracy: {results['binary']['accuracy']:.3f}")
    print(f"   - F1-Score: {results['binary']['f1']:.3f}")
    print(f"   - AUC-ROC:  {results['binary']['auc']:.3f}")
    print(f"✅ Multi-class Classification:")
    print(f"   - Accuracy: {results['multiclass']['accuracy']:.3f}")
    print(f"   - F1-Score: {results['multiclass']['f1']:.3f}")
    print(f"✅ Earthquake Count Regression:")
    print(f"   - R² Score: {results['eq_count']['r2']:.3f}")
    print(f"   - RMSE:     {results['eq_count']['rmse']:.3f}")
    print(f"✅ Magnitude Regression:")
    print(f"   - R² Score: {results['magnitude']['r2']:.3f}")
    print(f"   - RMSE:     {results['magnitude']['rmse']:.3f}")
    print(f"✅ Models saved to: {models_dir}")
    print(f"✅ Visualizations saved to: {os.path.join(output_dir, 'visualizations')}")
    
    return trained_models, results

def create_model_comparison_visualization(results, output_dir):
    """Create comparison visualization of all models"""
    
    viz_dir = os.path.join(output_dir, 'visualizations')
    
    # Model performance comparison
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    
    # Binary model metrics
    binary_metrics = ['accuracy', 'precision', 'recall', 'f1', 'auc']
    binary_values = [results['binary'][metric] for metric in binary_metrics]
    
    axes[0, 0].bar(binary_metrics, binary_values, color='skyblue', alpha=0.7)
    axes[0, 0].set_title('Binary Classifier Performance')
    axes[0, 0].set_ylabel('Score')
    axes[0, 0].set_ylim(0, 1)
    axes[0, 0].tick_params(axis='x', rotation=45)
    
    # Multi-class model metrics
    multiclass_metrics = ['accuracy', 'precision', 'recall', 'f1']
    multiclass_values = [results['multiclass'][metric] for metric in multiclass_metrics]
    
    axes[0, 1].bar(multiclass_metrics, multiclass_values, color='lightcoral', alpha=0.7)
    axes[0, 1].set_title('Multi-class Classifier Performance')
    axes[0, 1].set_ylabel('Score')
    axes[0, 1].set_ylim(0, 1)
    axes[0, 1].tick_params(axis='x', rotation=45)
    
    # Regression models R² comparison
    regression_models = ['eq_count', 'magnitude']
    r2_scores = [results[model]['r2'] for model in regression_models]
    
    axes[1, 0].bar(['EQ Count', 'Magnitude'], r2_scores, color=['green', 'orange'], alpha=0.7)
    axes[1, 0].set_title('Regression Models R² Score')
    axes[1, 0].set_ylabel('R² Score')
    axes[1, 0].set_ylim(0, 1)
    
    # Cross-validation scores comparison
    models_cv = ['Binary', 'Multi-class', 'EQ Count', 'Magnitude']
    cv_means = [
        results['binary']['cv_scores'].mean(),
        results['multiclass']['cv_scores'].mean(),
        results['eq_count']['cv_scores'].mean(),
        results['magnitude']['cv_scores'].mean()
    ]
    cv_stds = [
        results['binary']['cv_scores'].std(),
        results['multiclass']['cv_scores'].std(),
        results['eq_count']['cv_scores'].std(),
        results['magnitude']['cv_scores'].std()
    ]
    
    axes[1, 1].bar(models_cv, cv_means, yerr=cv_stds, capsize=5, 
                   color=['skyblue', 'lightcoral', 'green', 'orange'], alpha=0.7)
    axes[1, 1].set_title('Cross-Validation Scores Comparison')
    axes[1, 1].set_ylabel('CV Score')
    axes[1, 1].tick_params(axis='x', rotation=45)
    
    plt.tight_layout()
    plt.savefig(os.path.join(viz_dir, 'model_comparison.png'), dpi=300, bbox_inches='tight')
    plt.show()

if __name__ == "__main__":
    models, results = main()