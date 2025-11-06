import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
import logging
from typing import Dict, List, Optional

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EarthquakeRiskPredictor:
    def __init__(self, models_dir: str):
        """Initialize the risk predictor with trained models"""
        self.models_dir = models_dir
        self.multiclass_model = None
        self.binary_model = None
        self.province_encoder = None
        self._load_models()
        
        # Load province mapping
        self.province_mapping = self._load_province_mapping()
        logger.info(f"✅ Loaded {len(self.province_mapping)} provinces mapping")
        
        # Define risk level mapping (from numeric to text labels)
        self.risk_level_mapping = {
            0: 'High',
            1: 'Low', 
            2: 'Medium'
        }
    
    def _load_models(self):
        """Load the latest trained models"""
        logger.info("Loading earthquake risk models...")
        
        try:
            # Find latest model files
            model_files = [f for f in os.listdir(self.models_dir) if f.endswith('.joblib')]
            
            multiclass_file = max([f for f in model_files if f.startswith('multiclass_risk_v2')], 
                                 default=None)
            binary_file = max([f for f in model_files if f.startswith('binary_has_major_eq_v2')], 
                             default=None)
            encoder_file = max([f for f in model_files if f.startswith('province_encoder_v2')], 
                              default=None)
            
            if not all([multiclass_file, binary_file, encoder_file]):
                raise FileNotFoundError("Required model files not found")
            
            # Load models
            self.multiclass_model = joblib.load(os.path.join(self.models_dir, multiclass_file))
            self.binary_model = joblib.load(os.path.join(self.models_dir, binary_file))
            self.province_encoder = joblib.load(os.path.join(self.models_dir, encoder_file))
            
            logger.info(f"✅ Models loaded successfully:")
            logger.info(f"   - Multiclass: {multiclass_file}")
            logger.info(f"   - Binary: {binary_file}")
            logger.info(f"   - Encoder: {encoder_file}")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise
    
    def _load_province_mapping(self) -> Dict[int, str]:
        """Load province ID to name mapping from local JSON file"""
        try:
            script_dir = os.path.dirname(__file__)
            provinces_file = os.path.join(script_dir, 'provinces_id.json')
            
            with open(provinces_file, 'r', encoding='utf-8') as f:
                name_to_id = json.load(f)
            
            # Reverse the mapping to get id -> name
            id_to_name = {v: k.title() for k, v in name_to_id.items()}
            return id_to_name
            
        except Exception as e:
            logger.error(f"Error loading province mapping: {e}")
            return {}
    
    def _encode_province_name(self, province_name: str) -> int:
        """Encode province name with multiple fallback strategies"""
        # List of variations to try
        variations = [
            province_name.lower(),
            province_name.lower().strip(),
            province_name.replace(' Del ', ' del ').lower(),
            province_name.replace(' De ', ' de ').lower(),
            province_name.replace(' Del Norte', ' del norte').lower(),
            province_name.replace(' Del Sur', ' del sur').lower(),
            province_name.replace(' Oriental', ' oriental').lower(),
            province_name.replace(' Occidental', ' occidental').lower(),
            province_name.replace('Cotabato', 'south cotabato').lower(),
            province_name.replace('Metropolitan Manila', 'metro manila').lower(),
            province_name.replace('Metropolitan Manila', 'manila').lower(),
        ]
        
        # Try each variation
        for variation in variations:
            try:
                return self.province_encoder.transform([variation])[0]
            except ValueError:
                continue
        
        # If no variation works, get the most similar province from the encoder classes
        if hasattr(self.province_encoder, 'classes_'):
            encoder_classes = list(self.province_encoder.classes_)
            # Try to find a close match
            province_lower = province_name.lower()
            
            for encoded_province in encoder_classes:
                if (encoded_province in province_lower or 
                    province_lower in encoded_province or
                    any(word in encoded_province for word in province_lower.split() if len(word) > 3)):
                    try:
                        return self.province_encoder.transform([encoded_province])[0]
                    except ValueError:
                        continue
        
        # Ultimate fallback - use a default encoding (first class)
        logger.warning(f"Province '{province_name}' not found in encoder, using default encoding")
        if hasattr(self.province_encoder, 'classes_') and len(self.province_encoder.classes_) > 0:
            return 0  # Use first class as default
        else:
            return 0
    
    def load_province_features(self, features_file: str) -> Dict:
        """Load province earthquake features from JSON file"""
        try:
            with open(features_file, 'r', encoding='utf-8') as f:
                features_data = json.load(f)
            
            logger.info(f"✅ Loaded features for {len(features_data['province_features'])} provinces")
            return features_data
            
        except Exception as e:
            logger.error(f"Error loading province features: {e}")
            raise
    
    def prepare_features_for_prediction(self, province_features: Dict) -> tuple:
        """Prepare feature vector for model prediction"""
        try:
            # Get province name and encode it
            province_name = province_features['province_name']
            
            # Try to encode the province name with various formats
            province_encoded = self._encode_province_name(province_name)
            
            # Create feature vector in the same order as training data
            # Note: Based on training output, 'province_encoded' appears twice in the feature list
            feature_vector = np.array([[
                province_features['eq_count_last_30d'],
                province_features['max_magnitude_last_30d'],
                province_features['avg_magnitude_last_30d'],
                province_features['min_magnitude_last_30d'],
                province_features['std_magnitude_last_30d'],
                province_features['avg_depth_last_30d'],
                province_features['max_depth_last_30d'],
                province_features['min_depth_last_30d'],
                province_features['days_since_last_eq'],
                province_features['days_since_last_major_eq'],
                province_features['eq_count_last_7d'],
                province_features['eq_count_last_14d'],
                province_encoded,
                province_encoded  # Added twice as it appears twice in training features
            ]])
            
            return feature_vector, province_encoded
            
        except Exception as e:
            logger.error(f"Error preparing features for {province_features.get('province_name', 'Unknown')}: {e}")
            return None, None
    
    def predict_province_risk(self, province_features: Dict) -> Dict:
        """Predict earthquake risk for a single province"""
        try:
            # Prepare features
            feature_vector, province_encoded = self.prepare_features_for_prediction(province_features)
            
            if feature_vector is None:
                return {
                    'province_id': province_features['province_id'],
                    'province_name': province_features['province_name'],
                    'error': 'Failed to prepare features',
                    'prediction_date': datetime.now().isoformat()
                }
            
            # Get multiclass risk prediction
            risk_level_numeric = self.multiclass_model.predict(feature_vector)[0]
            risk_level = self.risk_level_mapping.get(risk_level_numeric, f'Unknown-{risk_level_numeric}')
            risk_probabilities = self.multiclass_model.predict_proba(feature_vector)[0]
            risk_classes = self.multiclass_model.classes_
            
            # Get binary major earthquake prediction
            major_eq_prediction = self.binary_model.predict(feature_vector)[0]
            major_eq_probability = self.binary_model.predict_proba(feature_vector)[0][1]
            
            # Create result dictionary with proper type conversion for JSON serialization
            result = {
                'province_id': int(province_features['province_id']),
                'province_name': str(province_features['province_name']),
                'prediction_date': datetime.now().isoformat(),
                'risk_level': str(risk_level),  # Convert to string for JSON serialization
                'risk_probabilities': {
                    str(risk_classes[i]): float(prob) for i, prob in enumerate(risk_probabilities)
                },
                'major_earthquake_risk': {
                    'prediction': bool(major_eq_prediction),
                    'probability': float(major_eq_probability)
                },
                'input_features': {
                    'eq_count_last_30d': float(province_features['eq_count_last_30d']),
                    'max_magnitude_last_30d': float(province_features['max_magnitude_last_30d']),
                    'avg_magnitude_last_30d': float(province_features['avg_magnitude_last_30d']),
                    'days_since_last_eq': int(province_features['days_since_last_eq']),
                    'days_since_last_major_eq': int(province_features['days_since_last_major_eq']),
                    'eq_count_last_7d': int(province_features['eq_count_last_7d']),
                    'eq_count_last_14d': int(province_features['eq_count_last_14d'])
                }
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error predicting risk for {province_features.get('province_name', 'Unknown')}: {e}")
            return {
                'province_id': province_features['province_id'],
                'province_name': province_features['province_name'],
                'error': str(e),
                'prediction_date': datetime.now().isoformat()
            }
    
    def predict_all_provinces(self, features_file: str, output_file: Optional[str] = None) -> Dict:
        """Predict earthquake risk for all provinces"""
        try:
            # Load province features
            features_data = self.load_province_features(features_file)
            
            # Predict risk for each province
            predictions = []
            successful_predictions = 0
            failed_predictions = 0
            
            logger.info("🔮 Starting risk predictions for all provinces...")
            
            for province_features in features_data['province_features']:
                result = self.predict_province_risk(province_features)
                predictions.append(result)
                
                if 'error' in result:
                    failed_predictions += 1
                    logger.warning(f"⚠️  Failed prediction for {result['province_name']}: {result['error']}")
                else:
                    successful_predictions += 1
                    logger.info(f"✅ {result['province_name']}: {result['risk_level']} risk")
            
            # Create output structure
            output_data = {
                'metadata': {
                    'prediction_date': datetime.now().isoformat(),
                    'total_provinces': len(predictions),
                    'successful_predictions': successful_predictions,
                    'failed_predictions': failed_predictions,
                    'model_info': {
                        'multiclass_model': 'multiclass_risk_v2',
                        'binary_model': 'binary_has_major_eq_v2',
                        'features_used': 13
                    },
                    'source_features_date': features_data['metadata']['generation_date']
                },
                'risk_predictions': predictions
            }
            
            # Save to file if specified
            if output_file:
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(output_data, f, indent=2, ensure_ascii=False)
                logger.info(f"💾 Predictions saved to: {output_file}")
            
            # Print summary
            logger.info(f"📊 Prediction Summary:")
            logger.info(f"   ✅ Successful: {successful_predictions}")
            logger.info(f"   ❌ Failed: {failed_predictions}")
            
            # Count risk levels
            risk_counts = {}
            for pred in predictions:
                if 'risk_level' in pred:
                    risk_level = pred['risk_level']
                    risk_counts[risk_level] = risk_counts.get(risk_level, 0) + 1
            
            logger.info(f"📈 Risk Level Distribution:")
            for level, count in risk_counts.items():
                logger.info(f"   {level}: {count} provinces")
            
            return output_data
            
        except Exception as e:
            logger.error(f"Error in predict_all_provinces: {e}")
            raise


def main():
    """Main function to run earthquake risk predictions"""
    try:
        # Set up paths
        script_dir = os.path.dirname(__file__)
        models_dir = os.path.join(script_dir, '..', '..', 'models', 'earthquake')
        features_file = os.path.join(script_dir, 'province_earthquake_features.json')
        output_file = os.path.join(script_dir, 'province_earthquake_risk_predictions.json')
        
        # Initialize predictor
        predictor = EarthquakeRiskPredictor(models_dir)
        
        # Run predictions
        predictions = predictor.predict_all_provinces(features_file, output_file)
        
        print("\n🎯 Earthquake Risk Prediction Complete!")
        print(f"📁 Results saved to: {output_file}")
        print(f"📊 Total provinces: {predictions['metadata']['total_provinces']}")
        print(f"✅ Successful predictions: {predictions['metadata']['successful_predictions']}")
        print(f"❌ Failed predictions: {predictions['metadata']['failed_predictions']}")
        
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
        raise


if __name__ == '__main__':
    main()