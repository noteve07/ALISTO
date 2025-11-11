import os
import pandas as pd
import joblib
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class RiskPredictionService:
    """Service to predict earthquake risk levels using trained ML model"""
    
    def __init__(self, model_path: str = None):
        """Initialize the prediction service with ML model"""
        if model_path is None:
            # Default path to the model in the ml directory
            current_dir = os.path.dirname(__file__)
            model_path = os.path.join(
                current_dir, 
                '..', '..', '..', '..', 
                'ml', 'scripts', 'dataset_v3', 'random_forest', 'integration', 
                'earthquake_risk_model.joblib'
            )
        
        try:
            self.model = joblib.load(model_path)
            logger.info(f"✅ ML model loaded from: {model_path}")
        except Exception as e:
            logger.error(f"❌ Failed to load ML model from {model_path}: {e}")
            raise
        
        # Features used for training (must match exactly)
        self.model_features = [
            'eq_count_last_30d', 
            'max_magnitude_last_30d', 
            'avg_magnitude_last_30d',
            'min_magnitude_last_30d', 
            'std_magnitude_last_30d', 
            'avg_depth_last_30d',
            'max_depth_last_30d', 
            'min_depth_last_30d', 
            'days_since_last_eq',
            'days_since_last_major_eq', 
            'eq_count_last_7d', 
            'eq_count_last_14d'
        ]
        
        logger.info(f"✅ Model features configured: {len(self.model_features)} features")
    
    def prepare_features_for_prediction(self, province_features: List[Dict]) -> pd.DataFrame:
        """Prepare province features data for ML model prediction"""
        try:
            # Convert to DataFrame
            df = pd.DataFrame(province_features)
            
            # Ensure all required features are present
            missing_features = []
            for feature in self.model_features:
                if feature not in df.columns:
                    missing_features.append(feature)
                    df[feature] = 0.0  # Fill missing features with default values
            
            if missing_features:
                logger.warning(f"Missing features filled with default values: {missing_features}")
            
            # Select only the features needed for prediction
            feature_data = df[self.model_features]
            
            # Handle any remaining NaN values
            feature_data = feature_data.fillna(0.0)
            
            logger.info(f"✅ Prepared features for {len(feature_data)} provinces")
            return feature_data
            
        except Exception as e:
            logger.error(f"Error preparing features for prediction: {e}")
            raise
    
    def predict_risk_levels(self, province_features: List[Dict]) -> List[Dict]:
        """Predict risk levels for all provinces"""
        try:
            # Prepare features for prediction
            feature_data = self.prepare_features_for_prediction(province_features)
            
            # Make predictions
            predictions = self.model.predict(feature_data)
            prediction_probabilities = self.model.predict_proba(feature_data)
            
            # Combine results with province information
            results = []
            for i, province_data in enumerate(province_features):
                prediction = predictions[i]
                probability = prediction_probabilities[i][1] if len(prediction_probabilities[i]) > 1 else 0.0
                
                result = {
                    'province_id': province_data['province_id'],
                    'province_name': province_data['province_name'],
                    'predicted_risk_binary': int(prediction),
                    'predicted_risk_level': 'High' if prediction == 1 else 'Low',
                    'risk_probability': float(probability),
                    'earthquake_features': {
                        'eq_count_last_30d': province_data.get('eq_count_last_30d', 0),
                        'max_magnitude_last_30d': province_data.get('max_magnitude_last_30d', 0.0),
                        'avg_magnitude_last_30d': province_data.get('avg_magnitude_last_30d', 0.0),
                        'days_since_last_eq': province_data.get('days_since_last_eq', 9999),
                        'eq_count_last_7d': province_data.get('eq_count_last_7d', 0)
                    }
                }
                results.append(result)
            
            high_risk_count = sum(1 for r in results if r['predicted_risk_level'] == 'High')
            logger.info(f"✅ Predictions completed: {high_risk_count} high-risk provinces out of {len(results)} total")
            
            return results
            
        except Exception as e:
            logger.error(f"Error making risk predictions: {e}")
            raise
    
    def get_high_risk_provinces_only(self, province_features: List[Dict]) -> List[Dict]:
        """Get only the provinces predicted as high-risk"""
        try:
            all_predictions = self.predict_risk_levels(province_features)
            
            # Filter only high-risk provinces
            high_risk_provinces = [
                pred for pred in all_predictions 
                if pred['predicted_risk_level'] == 'High'
            ]
            
            logger.info(f"✅ Found {len(high_risk_provinces)} high-risk provinces")
            return high_risk_provinces
            
        except Exception as e:
            logger.error(f"Error filtering high-risk provinces: {e}")
            raise
    
    def validate_model_health(self) -> Dict:
        """Validate that the model is working properly"""
        try:
            # Create dummy data for testing
            dummy_features = [{
                'province_id': 999,
                'province_name': 'Test Province',
                'eq_count_last_30d': 5,
                'max_magnitude_last_30d': 4.5,
                'avg_magnitude_last_30d': 3.2,
                'min_magnitude_last_30d': 2.1,
                'std_magnitude_last_30d': 0.8,
                'avg_depth_last_30d': 15.0,
                'max_depth_last_30d': 25.0,
                'min_depth_last_30d': 5.0,
                'days_since_last_eq': 2,
                'days_since_last_major_eq': 30,
                'eq_count_last_7d': 1,
                'eq_count_last_14d': 3
            }]
            
            # Test prediction
            result = self.predict_risk_levels(dummy_features)
            
            return {
                'status': 'healthy',
                'model_loaded': True,
                'features_count': len(self.model_features),
                'test_prediction_successful': len(result) > 0,
                'test_result': result[0] if result else None
            }
            
        except Exception as e:
            logger.error(f"Model validation failed: {e}")
            return {
                'status': 'unhealthy',
                'model_loaded': False,
                'error': str(e)
            }