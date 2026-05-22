from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, PerfilView,
    DirectorioView, PerfilPublicoView,
    AdminSolicitudesView, AdminAccionSolicitudView,
    AdminUsuariosView, AdminToggleUsuarioView,
    ConsultarStatusView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', PerfilView.as_view(), name='perfil'),
    path('directorio/', DirectorioView.as_view(), name='directorio'),
    path('directorio/<int:pk>/', PerfilPublicoView.as_view(), name='perfil_publico'),
    path('consultar-status/', ConsultarStatusView.as_view(), name='consultar_status'),

    # Admin
    path('admin/solicitudes/', AdminSolicitudesView.as_view(), name='admin_solicitudes'),
    path('admin/solicitudes/<int:pk>/accion/', AdminAccionSolicitudView.as_view(), name='admin_accion_solicitud'),
    path('admin/usuarios/', AdminUsuariosView.as_view(), name='admin_usuarios'),
    path('admin/usuarios/<int:pk>/toggle/', AdminToggleUsuarioView.as_view(), name='admin_toggle_usuario'),
]