import random
from decimal import Decimal


class ResellValuePredictor:
    def __init__(self):
        self.model_loaded = True
        self.original_prices = {
            'honda-cb-shine': 75000,
            'hero-splendor': 65000,
            'bajaj-pulsar-150': 95000,
            'tvs-apache': 110000,
            'yamaha-fz': 105000,
            're-classic': 185000,
            'ktm-duke': 175000,
            'suzuki-gixxer': 115000,
            'other': 80000
        }
        
        self.condition_multipliers = {
            'excellent': 1.0,
            'good': 0.85,
            'fair': 0.70,
            'poor': 0.50
        }
        
        self.location_multipliers = {
            'Mumbai': 1.05,
            'Delhi': 1.05,
            'Bangalore': 1.05,
            'Chennai': 1.05,
            'Kolkata': 1.05,
            'Hyderabad': 1.05,
            'Pune': 1.03,
            'Ahmedabad': 1.02,
            'Jaipur': 1.01,
            'Lucknow': 1.01,
            'Other': 1.0
        }
    
    def predict(self, bike_model, year, km_run, condition, location, 
                has_accidents=False, modifications=False):
        if not self.model_loaded:
            raise Exception("Model not loaded")
        
        original_price = self.original_prices.get(bike_model, 80000)
        
        current_year = 2024
        bike_age = current_year - year
        
        depreciation_rate = 0.15  
        if bike_age > 1:
            depreciation_rate = 0.15 + (bike_age - 1) * 0.10
        depreciation_rate = min(depreciation_rate, 0.80)  
        
        current_value = original_price * (1 - depreciation_rate)
        
        condition_multiplier = self.condition_multipliers.get(condition, 0.85)
        current_value *= condition_multiplier
        
        if km_run > 50000:
            current_value *= 0.80
        elif km_run > 30000:
            current_value *= 0.90
        elif km_run > 15000:
            current_value *= 0.95
        
        if has_accidents:
            current_value *= 0.75
        
        if modifications:
            current_value *= 0.90
        
        location_multiplier = self.location_multipliers.get(location, 1.0)
        current_value *= location_multiplier
        
        variation = random.uniform(0.95, 1.05)
        
        predicted_value = current_value * variation
        return round(predicted_value, 2)
    
    def get_confidence_score(self):
        return random.uniform(0.80, 0.92)
    
    def get_feature_importance(self):
        return {
            'bike_age': 0.25,
            'km_run': 0.20,
            'condition': 0.20,
            'bike_model': 0.15,
            'location': 0.08,
            'accidents': 0.07,
            'modifications': 0.05
        }
    
    def get_market_trends(self, bike_model):
        trends = {
            'honda-cb-shine': {'trend': 'stable', 'demand': 'high'},
            'hero-splendor': {'trend': 'stable', 'demand': 'high'},
            'bajaj-pulsar-150': {'trend': 'declining', 'demand': 'medium'},
            'tvs-apache': {'trend': 'stable', 'demand': 'medium'},
            'yamaha-fz': {'trend': 'stable', 'demand': 'medium'},
            're-classic': {'trend': 'increasing', 'demand': 'high'},
            'ktm-duke': {'trend': 'stable', 'demand': 'medium'},
            'suzuki-gixxer': {'trend': 'stable', 'demand': 'medium'},
            'other': {'trend': 'stable', 'demand': 'medium'}
        }
        return trends.get(bike_model, {'trend': 'stable', 'demand': 'medium'})


resell_predictor = ResellValuePredictor()
