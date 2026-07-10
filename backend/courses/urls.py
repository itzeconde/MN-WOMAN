from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CursoPublicViewSet, CursoAdminViewSet

router_public = DefaultRouter()
router_public.register(r'cursos', CursoPublicViewSet, basename='cursos-public')

router_admin = DefaultRouter()
router_admin.register(r'cursos', CursoAdminViewSet, basename='cursos-admin')

urlpatterns = [
    # Público: GET /api/cursos/
    path('api/', include(router_public.urls)),
    # Admin:   CRUD /api/admin/cursos/
    path('api/admin/', include(router_admin.urls)),
]