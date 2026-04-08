from django.contrib import admin
from .models import BikeService, DoorstepService, Contact, PriceEstimate, ResellValue


@admin.register(BikeService)
class BikeServiceAdmin(admin.ModelAdmin):
    """Admin configuration for BikeService model"""
    list_display = ('user', 'bike_model', 'service_type', 'preferred_date', 'status', 'doorstep_service', 'created_at')
    list_filter = ('service_type', 'status', 'doorstep_service', 'bike_model', 'created_at')
    search_fields = ('user__username', 'user__email', 'bike_model', 'service_type')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'preferred_date'
    ordering = ('-created_at',)

    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Service Details', {
            'fields': ('bike_model', 'service_type', 'preferred_date', 'preferred_time', 'status')
        }),
        ('Doorstep Service', {
            'fields': ('doorstep_service', 'address')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(DoorstepService)
class DoorstepServiceAdmin(admin.ModelAdmin):
    """Admin configuration for DoorstepService model"""
    list_display = ('user', 'service_type', 'time_slot', 'status', 'emergency_service', 'created_at')
    list_filter = ('service_type', 'status', 'emergency_service', 'created_at')
    search_fields = ('user__username', 'user__email', 'service_type', 'address')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    fieldsets = (
        ('User Information', {
            'fields': ('user', 'contact_number')
        }),
        ('Service Details', {
            'fields': ('service_type', 'time_slot', 'status', 'emergency_service')
        }),
        ('Location Information', {
            'fields': ('address', 'landmark')
        }),
        ('Additional Information', {
            'fields': ('special_instructions',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    """Admin configuration for Contact model"""
    list_display = ('name', 'email', 'subject', 'created_at', 'is_resolved')
    list_filter = ('is_resolved', 'created_at')
    search_fields = ('name', 'email', 'subject')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'subject')
        }),
        ('Message', {
            'fields': ('message',)
        }),
        ('Status', {
            'fields': ('is_resolved',)
        }),
        ('Timestamp', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )

    actions = ['mark_as_resolved', 'mark_as_unresolved']

    def mark_as_resolved(self, request, queryset):
        queryset.update(is_resolved=True)
        self.message_user(request, f"{queryset.count()} contacts marked as resolved.")
    mark_as_resolved.short_description = "Mark selected contacts as resolved"

    def mark_as_unresolved(self, request, queryset):
        queryset.update(is_resolved=False)
        self.message_user(request, f"{queryset.count()} contacts marked as unresolved.")
    mark_as_unresolved.short_description = "Mark selected contacts as unresolved"


@admin.register(PriceEstimate)
class PriceEstimateAdmin(admin.ModelAdmin):
    """Admin configuration for PriceEstimate model"""
    list_display = ('user', 'bike_model', 'service_type', 'estimated_price', 'doorstep_service', 'urgent_service', 'created_at')
    list_filter = ('service_type', 'doorstep_service', 'urgent_service', 'created_at')
    search_fields = ('user__username', 'user__email', 'bike_model', 'service_type')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Estimate Details', {
            'fields': ('bike_model', 'service_type', 'estimated_price')
        }),
        ('Additional Services', {
            'fields': ('doorstep_service', 'urgent_service')
        }),
        ('Timestamp', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )


@admin.register(ResellValue)
class ResellValueAdmin(admin.ModelAdmin):
    """Admin configuration for ResellValue model"""
    list_display = ('user', 'bike_model', 'year', 'km_run', 'condition', 'estimated_value', 'created_at')
    list_filter = ('condition', 'has_accidents', 'modifications', 'location', 'created_at')
    search_fields = ('user__username', 'user__email', 'bike_model', 'location')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Bike Details', {
            'fields': ('bike_model', 'year', 'km_run', 'condition')
        }),
        ('Additional Factors', {
            'fields': ('location', 'has_accidents', 'modifications')
        }),
        ('Valuation', {
            'fields': ('estimated_value',)
        }),
        ('Timestamp', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )
