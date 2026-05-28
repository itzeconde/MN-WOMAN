from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'company', 'role', 'is_verified', 'member_since')
    list_filter = ('role', 'is_verified', 'status')
    search_fields = ('username', 'email', 'company', 'location')

    fieldsets = UserAdmin.fieldsets + (
        ('Información MN WOMAN', {
            'fields': ('role', 'status', 'phone', 'company', 'business_sector',
                      'location', 'years_leading', 'bio',
                      'profile_picture', 'website',
                      'is_verified', 'is_founder')
        }),
    )