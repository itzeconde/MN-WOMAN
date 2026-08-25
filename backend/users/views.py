from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import generics, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import (
    UserSerializer, RegisterSerializer, DirectorioSerializer,
    PerfilSerializer, SolicitudSerializer,
)
from .utils_email import enviar_correo_recuperacion


class EsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'administrador'


# ── Throttles dedicados para endpoints públicos sensibles ──────────────────
# Requiere agregar en settings.py:
#
# REST_FRAMEWORK = {
#     ...
#     'DEFAULT_THROTTLE_RATES': {
#         'register': '5/hour',
#         'login_status': '10/min',
#     }
# }

class RegisterThrottle(AnonRateThrottle):
    scope = 'register'


class LoginStatusThrottle(AnonRateThrottle):
    scope = 'login_status'


class PasswordResetThrottle(AnonRateThrottle):
    scope = 'password_reset'


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [RegisterThrottle]


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [LoginStatusThrottle]


class PerfilView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return PerfilSerializer

    def get_object(self):
        return self.request.user


class DirectorioView(generics.ListAPIView):
    serializer_class = DirectorioSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'company']

    def get_queryset(self):
        queryset = User.objects.filter(
            is_active=True,
            status='aprobada'
        ).exclude(role='administrador').order_by('-member_since')

        sector = self.request.query_params.get('sector')
        location = self.request.query_params.get('location')
        es_fundadora = self.request.query_params.get('fundadora')

        if sector:
            queryset = queryset.filter(business_sector__icontains=sector)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if es_fundadora:
            queryset = queryset.filter(is_founder=True)

        return queryset


class PerfilPublicoView(generics.RetrieveAPIView):
    serializer_class = DirectorioSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.filter(is_active=True, status='aprobada').exclude(role='administrador')


# ── VISTAS ADMIN ───────────────────────────────────────────────────────────────

class AdminSolicitudesView(generics.ListAPIView):
    serializer_class = SolicitudSerializer
    permission_classes = [EsAdmin]

    def get_queryset(self):
        status = self.request.query_params.get('status', 'pendiente')
        return User.objects.filter(
            status=status,
            role='empresaria'
        ).order_by('-member_since')


class AdminAccionSolicitudView(APIView):
    permission_classes = [EsAdmin]

    def post(self, request, pk):
        accion = request.data.get('accion')
        motivo = request.data.get('motivo', '')
        try:
            user = User.objects.get(pk=pk, role='empresaria')
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)

        if accion == 'aprobar':
            user.status = 'aprobada'
            user.is_active = True
            user.rechazo_motivo = ''
            user.save()
            return Response({'mensaje': 'Solicitud aprobada'})
        elif accion == 'rechazar':
            user.status = 'rechazada'
            user.is_active = False
            user.rechazo_motivo = motivo
            user.save()
            return Response({'mensaje': 'Solicitud rechazada'})

        return Response({'error': 'Acción inválida'}, status=400)


class AdminUsuariosView(generics.ListAPIView):
    serializer_class = SolicitudSerializer
    permission_classes = [EsAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'company', 'email']

    def get_queryset(self):
        return User.objects.filter(
            status='aprobada',
            role='empresaria'
        ).order_by('-member_since')


class AdminToggleUsuarioView(APIView):
    permission_classes = [EsAdmin]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk, role='empresaria')
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)

        user.is_active = not user.is_active
        user.save()
        return Response({'activo': user.is_active})


class ConsultarStatusView(APIView):
    """
    Verifica el status de una solicitud SIN depender de authenticate(),
    porque authenticate() de Django siempre regresa None para usuarios
    con is_active=False (pendientes, rechazadas y desactivadas) sin
    importar si la contraseña es correcta. Aquí se valida la contraseña
    directamente con check_password(), que sí funciona independientemente
    de is_active.

    Caso especial: una cuenta con status='aprobada' pero is_active=False
    es una cuenta que el admin desactivó manualmente (no una solicitud
    pendiente ni rechazada). Se distingue con un status virtual
    'desactivada' para que el frontend le muestre a la usuaria un mensaje
    correcto en vez de decirle "aprobada" cuando en realidad no puede
    iniciar sesión.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [LoginStatusThrottle]

    def post(self, request):
        username = request.data.get('username', '')
        password = request.data.get('password', '')

        if not username or not password:
            return Response({'error': 'Credenciales incorrectas'}, status=401)

        try:
            user = User.objects.get(username__iexact=username)
        except User.DoesNotExist:
            return Response({'error': 'Credenciales incorrectas'}, status=401)

        if not user.check_password(password):
            return Response({'error': 'Credenciales incorrectas'}, status=401)

        if user.status == 'aprobada' and not user.is_active:
            return Response({
                'status': 'desactivada',
                'rechazo_motivo': 'Tu cuenta ha sido desactivada. Contacta al equipo de MN WOMAN si crees que es un error.',
            })

        return Response({
            'status': user.status,
            'rechazo_motivo': user.rechazo_motivo,
        })


# ── RECUPERACIÓN DE CONTRASEÑA ──────────────────────────────────────────────

password_reset_token = PasswordResetTokenGenerator()


class PasswordResetRequestView(APIView):
    """
    Recibe un email y, si existe una cuenta con ese correo, dispara el
    correo de recuperación vía Brevo. Responde igual exista o no la cuenta,
    para no filtrar qué correos están registrados en la plataforma.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        email = (request.data.get('email') or '').strip()

        if not email:
            return Response({'error': 'El correo es requerido'}, status=400)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Misma respuesta que si sí existiera, a propósito.
            return Response({'mensaje': 'Si el correo existe, se envió un link de recuperación'})

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = password_reset_token.make_token(user)
        link_reset = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

        nombre = user.first_name or user.username
        enviar_correo_recuperacion(user.email, nombre, link_reset)

        return Response({'mensaje': 'Si el correo existe, se envió un link de recuperación'})


class PasswordResetConfirmView(APIView):
    """
    Valida uid + token y, si son correctos, actualiza la contraseña.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        uid = request.data.get('uid', '')
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')

        if not uid or not token or not new_password:
            return Response({'error': 'Faltan datos'}, status=400)

        if len(new_password) < 8:
            return Response({'error': 'La contraseña debe tener al menos 8 caracteres'}, status=400)

        try:
            user_pk = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_pk)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({'error': 'El link no es válido o ya expiró'}, status=400)

        if not password_reset_token.check_token(user, token):
            return Response({'error': 'El link no es válido o ya expiró'}, status=400)

        user.set_password(new_password)
        user.save()

        return Response({'mensaje': 'Contraseña actualizada correctamente'})