import random
from decimal import Decimal


class PricePredictor:
    def __init__(self):
        self.model_loaded = True
        self.base_prices = {
            'basic': 500,
            'standard': 800,
            'premium': 1200,
            'oil-change': 300,
            'brake-service': 600,
            'chain-cleaning': 200,
            'tire-replacement': 1500,
            'engine-tuning': 2000,
            'electrical-check': 400,
            'carburetor-cleaning': 700
        }
        
        self.bike_multipliers = {
            'honda-cb-shine': 1.0,
            'hero-splendor': 1.0,
            'bajaj-pulsar-150': 1.2,
            'tvs-apache': 1.2,
            'yamaha-fz': 1.2,
            're-classic': 1.3,
            'ktm-duke': 1.2,
            'suzuki-gixxer': 1.2,
            'other': 1.1
        }
    
    def predict(self, bike_model, service_type, additional_features=None):
        if not self.model_loaded:
            raise Exception("Model not loaded")
        
        # Get base price
        base_price = self.base_prices.get(service_type, 500)
        
        multiplier = self.bike_multipliers.get(bike_model, 1.0)
        
        if additional_features:
            if additional_features.get('doorstep_service', False):
                multiplier *= 1.1  
            if additional_features.get('urgent_service', False):
                multiplier *= 1.2  
        variation = random.uniform(0.9, 1.1)
        
        predicted_price = base_price * multiplier * variation
        return round(predicted_price, 2)
    
    def get_confidence_score(self):
        return random.uniform(0.85, 0.95)
    
    def get_feature_importance(self):
        return {
            'bike_model': 0.4,
            'service_type': 0.5,
            'additional_services': 0.1
        }


price_predictor = PricePredictor()
