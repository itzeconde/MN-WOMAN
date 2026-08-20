from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Servicio
from .serializers import ServicioSerializer, ServicioEditSerializer


class ListaServiciosView(generics.ListAPIView):
    serializer_class = ServicioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Servicio.objects.filter(activo=True).order_by('-creado_el')

        categoria = self.request.query_params.get('categoria')
        if categoria:
            queryset = queryset.filter(categoria=categoria)

        # Filtro usado por PerfilPublico.tsx (/servicios?proveedora=<id>)
        # para mostrar solo los servicios de una proveedora específica.
        proveedora = self.request.query_params.get('proveedora')
        if proveedora:
            queryset = queryset.filter(proveedora_id=proveedora)

        return queryset


class DetalleServicioView(generics.RetrieveAPIView):
    serializer_class = ServicioSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Servicio.objects.filter(activo=True)


class PublicarServicioView(generics.CreateAPIView):
    serializer_class = ServicioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(proveedora=self.request.user)


class MisServiciosView(generics.ListAPIView):
    serializer_class = ServicioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Servicio.objects.filter(proveedora=self.request.user)


class ActualizarServicioView(generics.UpdateAPIView):
    """
    Edita título, descripción, categoría y precio de un servicio propio.
    No permite cambiar 'activo' aquí — para eso está ToggleActivoServicioView.
    """
    serializer_class = ServicioEditSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtrar por dueño en el queryset (no solo validar después) evita
        # que una usuaria pueda siquiera detectar que existe un servicio ajeno.
        return Servicio.objects.filter(proveedora=self.request.user)


class ToggleActivoServicioView(APIView):
    """
    Activa o desactiva un servicio propio. No requiere body: invierte
    el estado actual.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        servicio = Servicio.objects.filter(proveedora=request.user, pk=pk).first()
        if servicio is None:
            return Response({'detail': 'No encontrado.'}, status=404)

        servicio.activo = not servicio.activo
        servicio.save(update_fields=['activo'])

        serializer = ServicioSerializer(servicio)
        return Response(serializer.data)


class CategoriasServiciosView(APIView):
    """
    Devuelve las categorías fijas del modelo (para poblar el <select>)
    más las variantes de texto libre que las usuarias han escrito en
    'Otro' (para autocompletar y detectar categorías nuevas a promover).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        categorias = [{'value': v, 'label': l} for v, l in Servicio.CATEGORIAS]
        sugerencias_otro = list(
            Servicio.objects
            .filter(activo=True, categoria='otro')
            .exclude(categoria_otro='')
            .values_list('categoria_otro', flat=True)
            .distinct()
            .order_by('categoria_otro')
        )
        return Response({'categorias': categorias, 'sugerencias_otro': sugerencias_otro})