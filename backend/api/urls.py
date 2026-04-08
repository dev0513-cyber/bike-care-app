from django.urls import path
from .views import (
    UserRegistrationView, UserLoginView, UserLogoutView, UserProfileView,
    AdminLoginView, check_auth_status, check_admin_status,
    BikeServiceView, DoorstepServiceView, ServiceHistoryView,
    ContactView, PriceEstimateView, ResellValueView,
    VehicleListCreateView, VehicleDetailView, set_primary_vehicle,
    # Admin views
    AdminUserListView, AdminUserDetailView, AdminServiceListView,
    AdminBikeServiceDetailView, AdminDoorstepServiceDetailView,
    AdminContactListView, AdminContactDetailView, AdminDashboardView
)

urlpatterns = [
    # Authentication endpoints
    path('auth/signup/', UserRegistrationView.as_view(), name='user_signup'),
    path('auth/login/', UserLoginView.as_view(), name='user_login'),
    path('auth/logout/', UserLogoutView.as_view(), name='user_logout'),
    path('auth/profile/', UserProfileView.as_view(), name='user_profile'),
    path('auth/status/', check_auth_status, name='auth_status'),

    # Admin authentication endpoints
    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),
    path('admin/status/', check_admin_status, name='admin_status'),
    
    # Service endpoints
    path('service/book/', BikeServiceView.as_view(), name='book_service'),
    path('service/doorstep/', DoorstepServiceView.as_view(), name='doorstep_service'),
    path('service/history/', ServiceHistoryView.as_view(), name='service_history'),
    
    # Estimation endpoints
    path('service/estimate/', PriceEstimateView.as_view(), name='price_estimate'),
    path('service/resell/', ResellValueView.as_view(), name='resell_value'),
    
    # Contact endpoint
    path('contact/', ContactView.as_view(), name='contact'),

    # Vehicle endpoints
    path('vehicles/', VehicleListCreateView.as_view(), name='vehicle_list_create'),
    path('vehicles/<int:pk>/', VehicleDetailView.as_view(), name='vehicle_detail'),
    path('vehicles/<int:vehicle_id>/set-primary/', set_primary_vehicle, name='set_primary_vehicle'),

    # Admin CRUD endpoints
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('admin/users/', AdminUserListView.as_view(), name='admin_users'),
    path('admin/users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('admin/services/', AdminServiceListView.as_view(), name='admin_services'),
    path('admin/services/bike/<int:service_id>/', AdminBikeServiceDetailView.as_view(), name='admin_bike_service_detail'),
    path('admin/services/doorstep/<int:service_id>/', AdminDoorstepServiceDetailView.as_view(), name='admin_doorstep_service_detail'),
    path('admin/contacts/', AdminContactListView.as_view(), name='admin_contacts'),
    path('admin/contacts/<int:contact_id>/', AdminContactDetailView.as_view(), name='admin_contact_detail'),
]
