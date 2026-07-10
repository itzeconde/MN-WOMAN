from rest_framework import viewsets, permissions, filters
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.core.exceptions import ValidationError
from .models import Curso
from .serializers import CursoPublicSerializer, CursoAdminSerializer


class EsAdmin(permissions.BasePermission):
    """Permiso que solo permite acceso a usuarios con role='administrador'."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, 'role', None) == 'administrador'


class CursoPublicViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/cursos/       → lista paginada de cursos activos
    GET /api/cursos/<id>/  → detalle de un curso
    """
    serializer_class = CursoPublicSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titulo', 'descripcion', 'instructor']
    ordering_fields = ['fecha_creacion', 'duracion_horas']

    def get_queryset(self):
        qs = Curso.objects.filter(activo=True)
        categoria = self.request.query_params.get('categoria')
        nivel = self.request.query_params.get('nivel')
        if categoria:
            qs = qs.filter(categoria=categoria)
        if nivel:
            qs = qs.filter(nivel=nivel)
        return qs


class CursoAdminViewSet(viewsets.ModelViewSet):
    """CRUD completo solo para administradores."""
    queryset = Curso.objects.all().order_by('-fecha_creacion')
    serializer_class = CursoAdminSerializer
    permission_classes = [EsAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]