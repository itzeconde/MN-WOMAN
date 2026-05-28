from rest_framework import generics, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import (
    UserSerializer, RegisterSerializer, DirectorioSerializer,
    PerfilSerializer, SolicitudSerializer,
)


class EsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'administrador'


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]


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
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        try:
            user = User.objects.get(username=username)
            from django.contrib.auth import authenticate
            auth = authenticate(username=username, password=password)
            if auth is None and user.status != 'rechazada':
                return Response({'error': 'Credenciales incorrectas'}, status=401)
            return Response({
                'status': user.status,
                'rechazo_motivo': user.rechazo_motivo,
            })
        except User.DoesNotExist:
            return Response({'error': 'Credenciales incorrectas'}, status=401)