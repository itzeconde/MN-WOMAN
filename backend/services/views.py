from rest_framework import generics, permissions
from .models import Servicio
from .serializers import ServicioSerializer


class ListaServiciosView(generics.ListAPIView):
    serializer_class = ServicioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Servicio.objects.filter(activo=True).order_by('-creado_el')

        categoria = self.request.query_params.get('categoria')
        if categoria:
            queryset = queryset.filter(categoria=categoria)

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