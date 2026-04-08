from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('user', 'Regular User'),
        ('admin', 'Administrator'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

    @property
    def is_admin(self):
        return self.role == 'admin'


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()


class BikeService(models.Model):
    SERVICE_TYPE_CHOICES = [
        ('basic', 'Basic Service'),
        ('standard', 'Standard Service'),
        ('premium', 'Premium Service'),
        ('oil-change', 'Oil Change'),
        ('brake-service', 'Brake Service'),
        ('chain-cleaning', 'Chain Cleaning'),
        ('tire-replacement', 'Tire Replacement'),
        ('engine-tuning', 'Engine Tuning'),
        ('electrical-check', 'Electrical System Check'),
        ('carburetor-cleaning', 'Carburetor Cleaning'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    BIKE_MODEL_CHOICES = [
        ('honda-cb-shine', 'Honda CB Shine'),
        ('hero-splendor', 'Hero Splendor Plus'),
        ('bajaj-pulsar-150', 'Bajaj Pulsar 150'),
        ('tvs-apache', 'TVS Apache RTR 160'),
        ('yamaha-fz', 'Yamaha FZ-S'),
        ('re-classic', 'Royal Enfield Classic 350'),
        ('ktm-duke', 'KTM Duke 200'),
        ('suzuki-gixxer', 'Suzuki Gixxer'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bike_services', null=True, blank=True)
    vehicle = models.ForeignKey('Vehicle', on_delete=models.CASCADE, related_name='services', null=True, blank=True)
    bike_model = models.CharField(max_length=50, choices=BIKE_MODEL_CHOICES)  # Keep for backward compatibility
    service_type = models.CharField(max_length=50, choices=SERVICE_TYPE_CHOICES)
    preferred_date = models.DateField()
    preferred_time = models.CharField(max_length=50)
    doorstep_service = models.BooleanField(default=False)
    address = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        customer = self.user.username if self.user else 'Guest'
        return f"#{self.id} - {customer} - {self.get_service_type_display()}"


class DoorstepService(models.Model):
    SERVICE_TYPE_CHOICES = [
        ('breakdown', 'Breakdown Service'),
        ('maintenance', 'Regular Maintenance'),
        ('oil-change', 'Oil Change'),
        ('tire-repair', 'Tire Repair'),
        ('battery', 'Battery Service'),
        ('brake-adjustment', 'Brake Adjustment'),
        ('chain-service', 'Chain Service'),
        ('full-service', 'Complete Service'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('technician_assigned', 'Technician Assigned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    TIME_SLOT_CHOICES = [
        ('8:00 AM - 10:00 AM', '8:00 AM - 10:00 AM'),
        ('10:00 AM - 12:00 PM', '10:00 AM - 12:00 PM'),
        ('12:00 PM - 2:00 PM', '12:00 PM - 2:00 PM'),
        ('2:00 PM - 4:00 PM', '2:00 PM - 4:00 PM'),
        ('4:00 PM - 6:00 PM', '4:00 PM - 6:00 PM'),
        ('6:00 PM - 8:00 PM', '6:00 PM - 8:00 PM'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='doorstep_services', null=True, blank=True)
    vehicle = models.ForeignKey('Vehicle', on_delete=models.CASCADE, related_name='doorstep_services', null=True, blank=True)
    service_type = models.CharField(max_length=50, choices=SERVICE_TYPE_CHOICES)
    address = models.TextField()
    landmark = models.CharField(max_length=200, blank=True, null=True)
    time_slot = models.CharField(max_length=50, choices=TIME_SLOT_CHOICES)
    contact_number = models.CharField(max_length=15)
    emergency_service = models.BooleanField(default=False)
    special_instructions = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        customer = self.user.username if self.user else 'Guest'
        return f"#{self.id} - {customer} - {self.get_service_type_display()}"


class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.subject}"


class PriceEstimate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='price_estimates', null=True, blank=True)
    bike_model = models.CharField(max_length=50)
    service_type = models.CharField(max_length=50)
    doorstep_service = models.BooleanField(default=False)
    urgent_service = models.BooleanField(default=False)
    estimated_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.bike_model} - ₹{self.estimated_price}"


class Vehicle(models.Model):
    BIKE_MODEL_CHOICES = [
        ('honda-cb-shine', 'Honda CB Shine'),
        ('hero-splendor', 'Hero Splendor Plus'),
        ('bajaj-pulsar-150', 'Bajaj Pulsar 150'),
        ('tvs-apache', 'TVS Apache RTR 160'),
        ('yamaha-fz', 'Yamaha FZ-S'),
        ('re-classic', 'Royal Enfield Classic 350'),
        ('ktm-duke', 'KTM Duke 200'),
        ('suzuki-gixxer', 'Suzuki Gixxer'),
        ('honda-activa', 'Honda Activa'),
        ('tvs-jupiter', 'TVS Jupiter'),
        ('bajaj-avenger', 'Bajaj Avenger'),
        ('yamaha-r15', 'Yamaha R15'),
        ('other', 'Other'),
    ]

    FUEL_TYPE_CHOICES = [
        ('petrol', 'Petrol'),
        ('electric', 'Electric'),
        ('hybrid', 'Hybrid'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicles')
    bike_model = models.CharField(max_length=50, choices=BIKE_MODEL_CHOICES)
    custom_model_name = models.CharField(max_length=100, blank=True, null=True, help_text="Custom name if 'Other' is selected")
    registration_number = models.CharField(max_length=20, unique=True)
    year = models.IntegerField()
    fuel_type = models.CharField(max_length=20, choices=FUEL_TYPE_CHOICES, default='petrol')
    engine_capacity = models.IntegerField(help_text="Engine capacity in CC", null=True, blank=True)
    color = models.CharField(max_length=50, blank=True, null=True)
    purchase_date = models.DateField(null=True, blank=True)
    last_service_date = models.DateField(null=True, blank=True)
    next_service_due = models.DateField(null=True, blank=True)
    km_run = models.IntegerField(default=0, help_text="Total kilometers run")
    is_primary = models.BooleanField(default=False, help_text="Primary vehicle for the user")
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_primary', '-created_at']
        unique_together = ['user', 'registration_number']

    def save(self, *args, **kwargs):
        if self.is_primary:
            Vehicle.objects.filter(user=self.user, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)

    def get_display_name(self):
        """Get the display name for the vehicle"""
        if self.bike_model == 'other' and self.custom_model_name:
            return self.custom_model_name
        return self.get_bike_model_display()

    def __str__(self):
        return f"{self.user.username} - {self.get_display_name()} ({self.registration_number})"


class ResellValue(models.Model):
    CONDITION_CHOICES = [
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resell_values', null=True, blank=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='resell_estimates', null=True, blank=True)
    bike_model = models.CharField(max_length=50)
    year = models.IntegerField()
    km_run = models.IntegerField()
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    location = models.CharField(max_length=100)
    has_accidents = models.BooleanField(default=False)
    modifications = models.BooleanField(default=False)
    estimated_value = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.bike_model} ({self.year}) - ₹{self.estimated_value}"
