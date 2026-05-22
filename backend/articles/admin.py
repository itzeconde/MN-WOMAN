from django.contrib import admin
from .models import Article


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_featured', 'is_active', 'order', 'created_at']
    list_filter = ['category', 'is_featured', 'is_active']
    list_editable = ['is_active', 'order', 'is_featured']
    search_fields = ['title']
    readonly_fields = ['slug', 'created_at', 'updated_at']