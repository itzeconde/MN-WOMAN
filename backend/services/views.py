from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Servicio
from .serializers import ServicioSerializer


class ListaServiciosView(generics.ListAPIView):
    serializer_class = ServicioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Servicio.objects.filter(activo=True).order_by('-creado_el')
        categoria = self.request.query_params.get('categoria')
        if categoria:
            queryset = queryset.filter(categoria__icontains=categoria)
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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def categorias_servicios(request):
    cats = Servicio.objects.filter(activo=True)\
        .values_list('categoria', flat=True)\
        .distinct()
    return Response(sorted(set(c for c in cats if c)))