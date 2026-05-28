from django.urls import path
from .views import BannerPublicView, BannerAdminListCreateView, BannerAdminDetailView

urlpatterns = [
    # Público
    path('banners/public/', BannerPublicView.as_view()),

    # Admin CRUD
    path('banners/admin/', BannerAdminListCreateView.as_view()),
    path('banners/admin/<int:pk>/', BannerAdminDetailView.as_view()),
]