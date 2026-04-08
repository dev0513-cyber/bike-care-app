from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import BikeService, DoorstepService, Contact, PriceEstimate, ResellValue, Vehicle, UserProfile


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'confirm_password')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            username=validated_data['email'],  # Use email as username
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password')

        return attrs


class AdminLoginSerializer(serializers.Serializer):
    """Serializer for admin login with role validation"""
    email = serializers.CharField()  # Can be email or username
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Try to authenticate with email first, then username
            user = authenticate(username=email, password=password)
            if not user:
                # If email doesn't work, try using it as username
                from django.contrib.auth.models import User
                try:
                    user_obj = User.objects.get(email=email)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    user = None
            
            if not user:
                raise serializers.ValidationError('Invalid email or password')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')

            # Check if user has admin role or is superuser
            is_admin = user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'admin')
            if not is_admin:
                raise serializers.ValidationError('Access denied. Admin privileges required.')

            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password')

        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    class Meta:
        model = UserProfile
        fields = ('role', 'phone_number', 'address', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data"""
    profile = UserProfileSerializer(read_only=True)
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'profile', 'is_admin')
        read_only_fields = ('id', 'username', 'date_joined')

    def get_is_admin(self, obj):
        """Check if user has admin role"""
        return hasattr(obj, 'profile') and obj.profile.is_admin


class VehicleSerializer(serializers.ModelSerializer):
    """Serializer for Vehicle model"""
    display_name = serializers.CharField(source='get_display_name', read_only=True)
    bike_model_display = serializers.CharField(source='get_bike_model_display', read_only=True)
    fuel_type_display = serializers.CharField(source='get_fuel_type_display', read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            'id', 'bike_model', 'bike_model_display', 'custom_model_name',
            'registration_number', 'year', 'fuel_type', 'fuel_type_display',
            'engine_capacity', 'color', 'purchase_date', 'last_service_date',
            'next_service_due', 'km_run', 'is_primary', 'notes', 'display_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_registration_number(self, value):
        """Validate registration number uniqueness for the user"""
        user = self.context['request'].user
        vehicle_id = self.instance.id if self.instance else None

        # Check if another vehicle with same registration exists for this user
        queryset = Vehicle.objects.filter(user=user, registration_number=value)
        if vehicle_id:
            queryset = queryset.exclude(id=vehicle_id)

        if queryset.exists():
            raise serializers.ValidationError("You already have a vehicle with this registration number.")
        return value

    def validate(self, attrs):
        """Custom validation for vehicle data"""
        if attrs.get('bike_model') == 'other' and not attrs.get('custom_model_name'):
            raise serializers.ValidationError({
                'custom_model_name': 'Custom model name is required when "Other" is selected.'
            })
        return attrs

    def create(self, validated_data):
        """Create vehicle with user from request"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BikeServiceSerializer(serializers.ModelSerializer):
    """Serializer for bike service bookings"""
    user = UserSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)
    vehicle_id = serializers.IntegerField(write_only=True, required=False)
    service_type_display = serializers.CharField(source='get_service_type_display', read_only=True)
    bike_model_display = serializers.CharField(source='get_bike_model_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    vehicle_display_name = serializers.SerializerMethodField()

    class Meta:
        model = BikeService
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

    def get_vehicle_display_name(self, obj):
        """Get vehicle display name"""
        if obj.vehicle:
            return obj.vehicle.get_display_name()
        return obj.get_bike_model_display() if obj.bike_model else None

    def validate_vehicle_id(self, value):
        """Validate that vehicle belongs to the user"""
        if value:
            user = self.context['request'].user
            if not Vehicle.objects.filter(id=value, user=user).exists():
                raise serializers.ValidationError("Vehicle not found or doesn't belong to you.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user if user.is_authenticated else None

        # Handle vehicle assignment
        vehicle_id = validated_data.pop('vehicle_id', None)
        if vehicle_id:
            try:
                vehicle = Vehicle.objects.get(id=vehicle_id, user=user)
                validated_data['vehicle'] = vehicle
                validated_data['bike_model'] = vehicle.bike_model  # For backward compatibility
            except Vehicle.DoesNotExist:
                pass

        return super().create(validated_data)


class DoorstepServiceSerializer(serializers.ModelSerializer):
    """Serializer for doorstep service requests"""
    user = UserSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)
    vehicle_id = serializers.IntegerField(write_only=True, required=False)
    service_type_display = serializers.CharField(source='get_service_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    time_slot_display = serializers.CharField(source='get_time_slot_display', read_only=True)
    vehicle_display_name = serializers.SerializerMethodField()

    class Meta:
        model = DoorstepService
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

    def get_vehicle_display_name(self, obj):
        """Get vehicle display name"""
        if obj.vehicle:
            return obj.vehicle.get_display_name()
        return None

    def validate_vehicle_id(self, value):
        """Validate that vehicle belongs to the user"""
        if value:
            user = self.context['request'].user
            if not Vehicle.objects.filter(id=value, user=user).exists():
                raise serializers.ValidationError("Vehicle not found or doesn't belong to you.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user if user.is_authenticated else None

        # Handle vehicle assignment
        vehicle_id = validated_data.pop('vehicle_id', None)
        if vehicle_id:
            try:
                vehicle = Vehicle.objects.get(id=vehicle_id, user=user)
                validated_data['vehicle'] = vehicle
            except Vehicle.DoesNotExist:
                pass

        return super().create(validated_data)


class ContactSerializer(serializers.ModelSerializer):
    """Serializer for contact form submissions"""
    class Meta:
        model = Contact
        fields = '__all__'
        read_only_fields = ('created_at', 'is_resolved')


class PriceEstimateSerializer(serializers.ModelSerializer):
    """Serializer for price estimation requests"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = PriceEstimate
        fields = '__all__'
        read_only_fields = ('user', 'estimated_price', 'created_at')


class PriceEstimateRequestSerializer(serializers.Serializer):
    """Serializer for price estimation request data"""
    bike_model = serializers.CharField(max_length=50)
    service_type = serializers.CharField(max_length=50)
    doorstep_service = serializers.BooleanField(default=False)
    urgent_service = serializers.BooleanField(default=False)


class ResellValueSerializer(serializers.ModelSerializer):
    """Serializer for resell value estimation requests"""
    user = UserSerializer(read_only=True)
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)
    
    class Meta:
        model = ResellValue
        fields = '__all__'
        read_only_fields = ('user', 'estimated_value', 'created_at')


class ResellValueRequestSerializer(serializers.Serializer):
    """Serializer for resell value estimation request data"""
    bike_model = serializers.CharField(max_length=50)
    year = serializers.IntegerField(min_value=2000, max_value=2024)
    km_run = serializers.IntegerField(min_value=0)
    condition = serializers.ChoiceField(choices=ResellValue.CONDITION_CHOICES)
    location = serializers.CharField(max_length=100)
    has_accidents = serializers.BooleanField(default=False)
    modifications = serializers.BooleanField(default=False)


class ServiceHistorySerializer(serializers.Serializer):
    """Serializer for combined service history"""
    id = serializers.IntegerField()
    service_type = serializers.CharField()
    service_type_display = serializers.CharField()
    bike_model = serializers.CharField(required=False)
    bike_model_display = serializers.CharField(required=False)
    vehicle_display_name = serializers.CharField(required=False)
    date = serializers.DateField()
    status = serializers.CharField()
    status_display = serializers.CharField()
    service_category = serializers.CharField()
    address = serializers.CharField(required=False)
    created_at = serializers.DateTimeField()
