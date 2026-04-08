from django.shortcuts import render
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.authtoken.models import Token


class IsAdminUser(permissions.BasePermission):
    """Custom permission to only allow admin users to access admin endpoints"""

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.is_admin
        )
from .models import BikeService, DoorstepService, Contact, PriceEstimate, ResellValue, Vehicle, UserProfile
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    AdminLoginSerializer, UserProfileSerializer,
    BikeServiceSerializer, DoorstepServiceSerializer, ContactSerializer,
    PriceEstimateSerializer, PriceEstimateRequestSerializer,
    ResellValueSerializer, ResellValueRequestSerializer,
    ServiceHistorySerializer, VehicleSerializer
)
import random
from decimal import Decimal


class UserRegistrationView(APIView):
    """API view for user registration"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        print(f"Registration data received: {request.data}")  # Debug log
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Create or get authentication token
            token, created = Token.objects.get_or_create(user=user)
            # Auto login after registration
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)
            request.session.save()
            print(f"User registered and logged in: {request.user.is_authenticated}")
            print(f"Token created: {token.key}")
            user_data = UserSerializer(user).data
            return Response({
                'message': 'User registered successfully',
                'user': user_data,
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        print(f"Registration errors: {serializer.errors}")  # Debug log
        return Response({
            'message': 'Registration failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    """API view for user login"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        print(f"Login data received: {request.data}")  # Debug log
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            # Create or get authentication token
            token, created = Token.objects.get_or_create(user=user)
            # Login user for session-based auth as well
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)
            request.session.save()
            print(f"User logged in: {request.user.is_authenticated}")
            print(f"Token: {token.key}")
            user_data = UserSerializer(user).data
            return Response({
                'message': 'Login successful',
                'user': user_data,
                'token': token.key
            }, status=status.HTTP_200_OK)
        print(f"Login errors: {serializer.errors}")  # Debug log
        return Response({
            'message': 'Login failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    """API view for user logout"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    """API view for user profile"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_data = UserSerializer(request.user).data
        return Response({
            'user': user_data
        }, status=status.HTTP_200_OK)


class AdminLoginView(APIView):
    """API view for admin login with role validation"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        print(f"Admin login data received: {request.data}")  # Debug log
        serializer = AdminLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            # Create or get authentication token
            token, created = Token.objects.get_or_create(user=user)
            # Login user for session-based auth as well
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)
            request.session.save()
            print(f"Admin logged in: {request.user.is_authenticated}")
            print(f"Token: {token.key}")
            user_data = UserSerializer(user).data
            return Response({
                'message': 'Admin login successful',
                'user': user_data,
                'token': token.key,
                'is_admin': True
            }, status=status.HTTP_200_OK)
        print(f"Admin login errors: {serializer.errors}")  # Debug log
        return Response({
            'message': 'Admin login failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_auth_status(request):
    """Check if user is authenticated"""
    print(f"Auth status check - User: {request.user}, Authenticated: {request.user.is_authenticated}")  # Debug log
    print(f"Session key: {request.session.session_key}")  # Debug log
    if request.user.is_authenticated:
        user_data = UserSerializer(request.user).data
        return Response({
            'authenticated': True,
            'user': user_data
        })
    return Response({
        'authenticated': False,
        'user': None
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_admin_status(request):
    """Check if user has admin privileges"""
    is_admin = hasattr(request.user, 'profile') and request.user.profile.is_admin
    user_data = UserSerializer(request.user).data if is_admin else None
    return Response({
        'is_admin': is_admin,
        'user': user_data
    })


class BikeServiceView(APIView):
    """API view for bike service bookings"""
    permission_classes = [permissions.AllowAny]  # Temporarily allow any for development

    def get(self, request):
        """Get user's bike service bookings"""
        services = BikeService.objects.filter(user=request.user)
        serializer = BikeServiceSerializer(services, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new bike service booking"""
        serializer = BikeServiceSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            service = serializer.save()
            return Response({
                'message': 'Service booked successfully',
                'service': BikeServiceSerializer(service).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DoorstepServiceView(APIView):
    """API view for doorstep service requests"""
    permission_classes = [permissions.AllowAny]  # Temporarily allow any for development

    def get(self, request):
        """Get user's doorstep service requests"""
        services = DoorstepService.objects.filter(user=request.user)
        serializer = DoorstepServiceSerializer(services, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new doorstep service request"""
        serializer = DoorstepServiceSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            service = serializer.save()
            return Response({
                'message': 'Doorstep service scheduled successfully',
                'service': DoorstepServiceSerializer(service).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ServiceHistoryView(APIView):
    """API view for combined service history"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get user's complete service history"""
        user = request.user

        # Get bike services for the authenticated user
        bike_services = BikeService.objects.filter(user=user).order_by('-created_at')
        bike_service_data = []
        for service in bike_services:
            vehicle_name = service.vehicle.get_display_name() if service.vehicle else service.get_bike_model_display()
            bike_service_data.append({
                'id': service.id,
                'service_type': service.service_type,
                'service_type_display': service.get_service_type_display(),
                'bike_model': service.bike_model,
                'bike_model_display': service.get_bike_model_display(),
                'vehicle_display_name': vehicle_name,
                'vehicle_registration': service.vehicle.registration_number if service.vehicle else None,
                'date': service.preferred_date,
                'status': service.status,
                'status_display': service.get_status_display(),
                'service_category': 'bike_service',
                'address': service.address if service.doorstep_service else 'Service Center',
                'notes': service.notes,
                'created_at': service.created_at
            })

        # Get doorstep services for the authenticated user
        doorstep_services = DoorstepService.objects.filter(user=user).order_by('-created_at')
        doorstep_service_data = []
        for service in doorstep_services:
            vehicle_name = service.vehicle.get_display_name() if service.vehicle else 'Unknown Vehicle'
            doorstep_service_data.append({
                'id': service.id,
                'service_type': service.service_type,
                'service_type_display': service.get_service_type_display(),
                'bike_model': '',  # Not directly applicable for doorstep services
                'bike_model_display': '',
                'vehicle_display_name': vehicle_name,
                'vehicle_registration': service.vehicle.registration_number if service.vehicle else None,
                'date': service.created_at.date(),  # Use creation date as service date
                'status': service.status,
                'status_display': service.get_status_display(),
                'service_category': 'doorstep_service',
                'address': service.address,
                'time_slot': service.time_slot,
                'contact_number': service.contact_number,
                'emergency_service': service.emergency_service,
                'special_instructions': service.special_instructions,
                'created_at': service.created_at
            })

        # Combine and sort by creation date
        all_services = bike_service_data + doorstep_service_data
        all_services.sort(key=lambda x: x['created_at'], reverse=True)

        return Response({
            'message': 'Service history retrieved successfully',
            'services': all_services,
            'total_services': len(all_services)
        }, status=status.HTTP_200_OK)


class ContactView(APIView):
    """API view for contact form submissions"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """Submit contact form"""
        serializer = ContactSerializer(data=request.data)
        if serializer.is_valid():
            contact = serializer.save()
            return Response({
                'message': 'Thank you for your message! We will get back to you soon.',
                'contact': ContactSerializer(contact).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PriceEstimateView(APIView):
    """API view for price estimation"""
    permission_classes = [permissions.AllowAny]  # Temporarily allow any for development

    def post(self, request):
        """Calculate price estimate using dummy ML model"""
        serializer = PriceEstimateRequestSerializer(data=request.data)
        if serializer.is_valid():
            # Dummy ML model for price estimation
            estimated_price = self.calculate_price_estimate(serializer.validated_data)

            # Save the estimate
            user = request.user if request.user.is_authenticated else None
            estimate = PriceEstimate.objects.create(
                user=user,
                bike_model=serializer.validated_data['bike_model'],
                service_type=serializer.validated_data['service_type'],
                doorstep_service=serializer.validated_data['doorstep_service'],
                urgent_service=serializer.validated_data['urgent_service'],
                estimated_price=estimated_price
            )

            return Response({
                'message': 'Price estimate calculated successfully',
                'estimate': {
                    'bike_model': estimate.bike_model,
                    'service_type': estimate.service_type,
                    'base_price': float(estimated_price),
                    'doorstep_charge': 100 if estimate.doorstep_service else 0,
                    'urgent_charge': 200 if estimate.urgent_service else 0,
                    'subtotal': float(estimated_price) + (100 if estimate.doorstep_service else 0) + (200 if estimate.urgent_service else 0),
                    'tax': round((float(estimated_price) + (100 if estimate.doorstep_service else 0) + (200 if estimate.urgent_service else 0)) * 0.18, 2),
                    'total': round((float(estimated_price) + (100 if estimate.doorstep_service else 0) + (200 if estimate.urgent_service else 0)) * 1.18, 2),
                    'estimated_time': self.get_estimated_time(estimate.service_type),
                    'warranty': self.get_warranty(estimate.service_type)
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def calculate_price_estimate(self, data):
        """Dummy ML model for price estimation"""
        # Base prices for different service types
        base_prices = {
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

        # Bike category multipliers
        bike_categories = {
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

        base_price = base_prices.get(data['service_type'], 500)
        multiplier = bike_categories.get(data['bike_model'], 1.0)

        # Add some randomness to simulate ML prediction
        variation = random.uniform(0.9, 1.1)

        estimated_price = base_price * multiplier * variation
        return round(Decimal(str(estimated_price)), 2)

    def get_estimated_time(self, service_type):
        """Get estimated time for service"""
        time_map = {
            'basic': '2-3 hours',
            'standard': '3-4 hours',
            'premium': '4-6 hours',
            'oil-change': '30 minutes',
            'brake-service': '1-2 hours',
            'chain-cleaning': '30 minutes',
            'tire-replacement': '1 hour',
            'engine-tuning': '4-6 hours',
            'electrical-check': '1-2 hours',
            'carburetor-cleaning': '2-3 hours'
        }
        return time_map.get(service_type, '2-4 hours')

    def get_warranty(self, service_type):
        """Get warranty period for service"""
        warranty_map = {
            'basic': '15 days',
            'standard': '30 days',
            'premium': '45 days',
            'oil-change': '15 days',
            'brake-service': '30 days',
            'chain-cleaning': '15 days',
            'tire-replacement': '90 days',
            'engine-tuning': '60 days',
            'electrical-check': '30 days',
            'carburetor-cleaning': '30 days'
        }
        return warranty_map.get(service_type, '30 days')


class ResellValueView(APIView):
    """API view for resell value estimation"""
    permission_classes = [permissions.AllowAny]  # Temporarily allow any for development

    def post(self, request):
        """Calculate resell value using dummy ML model"""
        serializer = ResellValueRequestSerializer(data=request.data)
        if serializer.is_valid():
            # Dummy ML model for resell value estimation
            estimated_value = self.calculate_resell_value(serializer.validated_data)

            # Save the estimate
            user = request.user if request.user.is_authenticated else None
            resell_value = ResellValue.objects.create(
                user=user,
                bike_model=serializer.validated_data['bike_model'],
                year=serializer.validated_data['year'],
                km_run=serializer.validated_data['km_run'],
                condition=serializer.validated_data['condition'],
                location=serializer.validated_data['location'],
                has_accidents=serializer.validated_data['has_accidents'],
                modifications=serializer.validated_data['modifications'],
                estimated_value=estimated_value
            )

            min_value = round(float(estimated_value) * 0.85, 2)
            max_value = round(float(estimated_value) * 1.15, 2)

            return Response({
                'message': 'Resell value calculated successfully',
                'valuation': {
                    'bike_model': resell_value.bike_model,
                    'year': resell_value.year,
                    'km_run': resell_value.km_run,
                    'condition': resell_value.condition,
                    'original_price': self.get_original_price(resell_value.bike_model),
                    'estimated_value': float(estimated_value),
                    'min_value': min_value,
                    'max_value': max_value,
                    'depreciation_percent': self.calculate_depreciation_percent(resell_value.bike_model, resell_value.year),
                    'bike_age': 2024 - resell_value.year,
                    'market_demand': self.get_market_demand(resell_value.bike_model),
                    'tips': self.get_selling_tips(resell_value.condition)
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def calculate_resell_value(self, data):
        """Dummy ML model for resell value estimation"""
        # Original prices for different bike models
        original_prices = {
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

        base_value = original_prices.get(data['bike_model'], 80000)
        current_year = 2024
        bike_age = current_year - data['year']

        # Depreciation based on age
        depreciation_rate = 0.15  # First year
        if bike_age > 1:
            depreciation_rate = 0.15 + (bike_age - 1) * 0.10
        depreciation_rate = min(depreciation_rate, 0.80)  # Max 80% depreciation

        base_value *= (1 - depreciation_rate)

        # Condition adjustment
        condition_multiplier = {
            'excellent': 1.0,
            'good': 0.85,
            'fair': 0.70,
            'poor': 0.50
        }
        base_value *= condition_multiplier.get(data['condition'], 0.85)

        # KM run adjustment
        km_run = data['km_run']
        if km_run > 50000:
            base_value *= 0.80
        elif km_run > 30000:
            base_value *= 0.90
        elif km_run > 15000:
            base_value *= 0.95

        # Accident history
        if data['has_accidents']:
            base_value *= 0.75

        # Modifications
        if data['modifications']:
            base_value *= 0.90

        # Location adjustment (metro cities have higher resale value)
        metro_cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad']
        if data['location'] in metro_cities:
            base_value *= 1.05

        # Add some randomness to simulate ML prediction
        variation = random.uniform(0.95, 1.05)
        estimated_value = base_value * variation

        return round(Decimal(str(estimated_value)), 2)

    def get_original_price(self, bike_model):
        """Get original price of the bike"""
        original_prices = {
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
        return original_prices.get(bike_model, 80000)

    def calculate_depreciation_percent(self, bike_model, year):
        """Calculate depreciation percentage"""
        current_year = 2024
        bike_age = current_year - year
        depreciation_rate = 0.15  # First year
        if bike_age > 1:
            depreciation_rate = 0.15 + (bike_age - 1) * 0.10
        return min(round(depreciation_rate * 100), 80)

    def get_market_demand(self, bike_model):
        """Get market demand for the bike model"""
        demand_map = {
            'honda-cb-shine': 'High',
            'hero-splendor': 'High',
            'bajaj-pulsar-150': 'Medium',
            'tvs-apache': 'Medium',
            'yamaha-fz': 'Medium',
            're-classic': 'High',
            'ktm-duke': 'Medium',
            'suzuki-gixxer': 'Medium',
            'other': 'Medium'
        }
        return demand_map.get(bike_model, 'Medium')

    def get_selling_tips(self, condition):
        """Get selling tips based on condition"""
        tips = {
            'excellent': [
                'Highlight the excellent condition in your listing',
                'Include detailed photos from all angles',
                'Provide complete service history'
            ],
            'good': [
                'Clean the bike thoroughly before showing',
                'Fix minor issues to improve value',
                'Be transparent about any wear and tear'
            ],
            'fair': [
                'Consider basic repairs to increase value',
                'Price competitively for quick sale',
                'Highlight any recent maintenance'
            ],
            'poor': [
                'Be honest about the condition',
                'Consider selling to dealers or scrap buyers',
                'Price significantly below market rate'
            ]
        }
        return tips.get(condition, tips['good'])


class VehicleListCreateView(ListCreateAPIView):
    """API view for listing and creating vehicles"""
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return vehicles for the authenticated user only"""
        return Vehicle.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Create vehicle for the authenticated user"""
        serializer.save(user=self.request.user)


class VehicleDetailView(RetrieveUpdateDestroyAPIView):
    """API view for retrieving, updating, and deleting a specific vehicle"""
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return vehicles for the authenticated user only"""
        return Vehicle.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def set_primary_vehicle(request, vehicle_id):
    """Set a vehicle as primary for the user"""
    try:
        vehicle = Vehicle.objects.get(id=vehicle_id, user=request.user)

        # Unset other primary vehicles
        Vehicle.objects.filter(user=request.user, is_primary=True).update(is_primary=False)

        # Set this vehicle as primary
        vehicle.is_primary = True
        vehicle.save()

        serializer = VehicleSerializer(vehicle)
        return Response({
            'message': 'Primary vehicle updated successfully',
            'vehicle': serializer.data
        }, status=status.HTTP_200_OK)

    except Vehicle.DoesNotExist:
        return Response({
            'message': 'Vehicle not found'
        }, status=status.HTTP_404_NOT_FOUND)


# ============================================================================
# ADMIN CRUD VIEWS
# ============================================================================

class AdminUserListView(APIView):
    """Admin view for managing users"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        """Get all users with their profiles"""
        users = User.objects.all().order_by('-date_joined')
        serializer = UserSerializer(users, many=True)
        return Response({
            'users': serializer.data,
            'total_count': users.count()
        }, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new user (admin only)"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Set role if provided
            role = request.data.get('role', 'user')
            if role in ['user', 'admin']:
                user.profile.role = role
                user.profile.save()

            user_data = UserSerializer(user).data
            return Response({
                'message': 'User created successfully',
                'user': user_data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'message': 'User creation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class AdminUserDetailView(APIView):
    """Admin view for managing individual users"""
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        """Get specific user details"""
        try:
            user = User.objects.get(id=user_id)
            serializer = UserSerializer(user)
            return Response({
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, user_id):
        """Update user details"""
        try:
            user = User.objects.get(id=user_id)

            # Update user fields
            user.first_name = request.data.get('first_name', user.first_name)
            user.last_name = request.data.get('last_name', user.last_name)
            user.email = request.data.get('email', user.email)
            user.is_active = request.data.get('is_active', user.is_active)
            user.save()

            # Update profile fields
            if hasattr(user, 'profile'):
                profile = user.profile
                new_role = request.data.get('role', profile.role)
                # Validate role
                if new_role in ['user', 'admin']:
                    profile.role = new_role
                profile.phone_number = request.data.get('phone_number', profile.phone_number)
                profile.address = request.data.get('address', profile.address)
                profile.save()
            else:
                # Create profile if it doesn't exist
                role = request.data.get('role', 'user')
                if role in ['user', 'admin']:
                    UserProfile.objects.create(user=user, role=role)

            user_data = UserSerializer(user).data
            return Response({
                'message': 'User updated successfully',
                'user': user_data
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, user_id):
        """Delete user (admin only)"""
        try:
            user = User.objects.get(id=user_id)
            # Prevent admin from deleting themselves
            if user.id == request.user.id:
                return Response({
                    'message': 'Cannot delete your own account'
                }, status=status.HTTP_400_BAD_REQUEST)

            user.delete()
            return Response({
                'message': 'User deleted successfully'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AdminServiceListView(APIView):
    """Admin view for managing all services"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        """Get all bike services and doorstep services"""
        bike_services = BikeService.objects.all().order_by('-created_at')
        doorstep_services = DoorstepService.objects.all().order_by('-created_at')

        bike_service_data = BikeServiceSerializer(bike_services, many=True).data
        doorstep_service_data = DoorstepServiceSerializer(doorstep_services, many=True).data

        return Response({
            'bike_services': bike_service_data,
            'doorstep_services': doorstep_service_data,
            'bike_services_count': bike_services.count(),
            'doorstep_services_count': doorstep_services.count(),
            'total_services': bike_services.count() + doorstep_services.count()
        }, status=status.HTTP_200_OK)


class AdminBikeServiceDetailView(APIView):
    """Admin view for managing individual bike services"""
    permission_classes = [IsAdminUser]

    def get(self, request, service_id):
        """Get specific bike service details"""
        try:
            service = BikeService.objects.get(id=service_id)
            serializer = BikeServiceSerializer(service)
            return Response({
                'service': serializer.data
            }, status=status.HTTP_200_OK)
        except BikeService.DoesNotExist:
            return Response({
                'message': 'Service not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, service_id):
        """Update bike service status and details"""
        try:
            service = BikeService.objects.get(id=service_id)

            # Update service fields
            service.status = request.data.get('status', service.status)
            service.notes = request.data.get('notes', service.notes)
            service.save()

            service_data = BikeServiceSerializer(service).data
            return Response({
                'message': 'Service updated successfully',
                'service': service_data
            }, status=status.HTTP_200_OK)
        except BikeService.DoesNotExist:
            return Response({
                'message': 'Service not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, service_id):
        """Delete bike service"""
        try:
            service = BikeService.objects.get(id=service_id)
            service.delete()
            return Response({
                'message': 'Service deleted successfully'
            }, status=status.HTTP_200_OK)
        except BikeService.DoesNotExist:
            return Response({
                'message': 'Service not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AdminDoorstepServiceDetailView(APIView):
    """Admin view for managing individual doorstep services"""
    permission_classes = [IsAdminUser]

    def get(self, request, service_id):
        """Get specific doorstep service details"""
        try:
            service = DoorstepService.objects.get(id=service_id)
            serializer = DoorstepServiceSerializer(service)
            return Response({
                'service': serializer.data
            }, status=status.HTTP_200_OK)
        except DoorstepService.DoesNotExist:
            return Response({
                'message': 'Service not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, service_id):
        """Update doorstep service status and details"""
        try:
            service = DoorstepService.objects.get(id=service_id)

            # Update service fields
            service.status = request.data.get('status', service.status)
            service.special_instructions = request.data.get('special_instructions', service.special_instructions)
            service.save()

            service_data = DoorstepServiceSerializer(service).data
            return Response({
                'message': 'Service updated successfully',
                'service': service_data
            }, status=status.HTTP_200_OK)
        except DoorstepService.DoesNotExist:
            return Response({
                'message': 'Service not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, service_id):
        """Delete doorstep service"""
        try:
            service = DoorstepService.objects.get(id=service_id)
            service.delete()
            return Response({
                'message': 'Service deleted successfully'
            }, status=status.HTTP_200_OK)
        except DoorstepService.DoesNotExist:
            return Response({
                'message': 'Service not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AdminContactListView(APIView):
    """Admin view for managing contact form submissions"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        """Get all contact form submissions"""
        contacts = Contact.objects.all().order_by('-created_at')
        serializer = ContactSerializer(contacts, many=True)
        return Response({
            'contacts': serializer.data,
            'total_count': contacts.count(),
            'unresolved_count': contacts.filter(is_resolved=False).count()
        }, status=status.HTTP_200_OK)


class AdminContactDetailView(APIView):
    """Admin view for managing individual contact submissions"""
    permission_classes = [IsAdminUser]

    def get(self, request, contact_id):
        """Get specific contact details"""
        try:
            contact = Contact.objects.get(id=contact_id)
            serializer = ContactSerializer(contact)
            return Response({
                'contact': serializer.data
            }, status=status.HTTP_200_OK)
        except Contact.DoesNotExist:
            return Response({
                'message': 'Contact not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, contact_id):
        """Update contact resolution status"""
        try:
            contact = Contact.objects.get(id=contact_id)
            contact.is_resolved = request.data.get('is_resolved', contact.is_resolved)
            contact.save()

            contact_data = ContactSerializer(contact).data
            return Response({
                'message': 'Contact updated successfully',
                'contact': contact_data
            }, status=status.HTTP_200_OK)
        except Contact.DoesNotExist:
            return Response({
                'message': 'Contact not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, contact_id):
        """Delete contact submission"""
        try:
            contact = Contact.objects.get(id=contact_id)
            contact.delete()
            return Response({
                'message': 'Contact deleted successfully'
            }, status=status.HTTP_200_OK)
        except Contact.DoesNotExist:
            return Response({
                'message': 'Contact not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AdminDashboardView(APIView):
    """Admin dashboard with statistics and overview"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        """Get dashboard statistics"""
        from django.db.models import Count, Q
        from datetime import datetime, timedelta

        # Get current date and 30 days ago
        today = datetime.now().date()
        thirty_days_ago = today - timedelta(days=30)

        # User statistics
        total_users = User.objects.count()
        admin_users = User.objects.filter(profile__role='admin').count()
        regular_users = total_users - admin_users
        new_users_this_month = User.objects.filter(date_joined__date__gte=thirty_days_ago).count()

        # Service statistics
        total_bike_services = BikeService.objects.count()
        total_doorstep_services = DoorstepService.objects.count()
        pending_services = (
            BikeService.objects.filter(status='pending').count() +
            DoorstepService.objects.filter(status='pending').count()
        )
        completed_services = (
            BikeService.objects.filter(status='completed').count() +
            DoorstepService.objects.filter(status='completed').count()
        )

        # Contact statistics
        total_contacts = Contact.objects.count()
        unresolved_contacts = Contact.objects.filter(is_resolved=False).count()

        # Recent activity
        recent_services = BikeService.objects.filter(
            created_at__date__gte=thirty_days_ago
        ).count() + DoorstepService.objects.filter(
            created_at__date__gte=thirty_days_ago
        ).count()

        return Response({
            'users': {
                'total': total_users,
                'admin': admin_users,
                'regular': regular_users,
                'new_this_month': new_users_this_month
            },
            'services': {
                'total_bike_services': total_bike_services,
                'total_doorstep_services': total_doorstep_services,
                'total_services': total_bike_services + total_doorstep_services,
                'pending': pending_services,
                'completed': completed_services,
                'recent_services': recent_services
            },
            'contacts': {
                'total': total_contacts,
                'unresolved': unresolved_contacts,
                'resolved': total_contacts - unresolved_contacts
            }
        }, status=status.HTTP_200_OK)
