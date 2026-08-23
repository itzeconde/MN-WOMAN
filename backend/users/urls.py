from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from .views import (
    RegisterView, LoginView, PerfilView,
    DirectorioView, PerfilPublicoView,
    AdminSolicitudesView, AdminAccionSolicitudView,
    AdminUsuariosView, AdminToggleUsuarioView,
    ConsultarStatusView,
    PasswordResetRequestView, PasswordResetConfirmView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='logout'),
    path('profile/', PerfilView.as_view(), name='perfil'),
    path('directorio/', DirectorioView.as_view(), name='directorio'),
    path('directorio/<int:pk>/', PerfilPublicoView.as_view(), name='perfil_publico'),
    path('consultar-status/', ConsultarStatusView.as_view(), name='consultar_status'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),

    # Admin
    path('admin/solicitudes/', AdminSolicitudesView.as_view(), name='admin_solicitudes'),
    path('admin/solicitudes/<int:pk>/accion/', AdminAccionSolicitudView.as_view(), name='admin_accion_solicitud'),
    path('admin/usuarios/', AdminUsuariosView.as_view(), name='admin_usuarios'),
    path('admin/usuarios/<int:pk>/toggle/', AdminToggleUsuarioView.as_view(), name='admin_toggle_usuario'),
]