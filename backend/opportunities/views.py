from rest_framework import generics, permissions
from .models import Oportunidad, Postulacion
from .serializers import OportunidadSerializer, PostulacionSerializer


class ListaOportunidadesView(generics.ListAPIView):
    serializer_class = OportunidadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Oportunidad.objects.filter(status='activa').order_by('-creada_el')

        categoria = self.request.query_params.get('categoria')
        urgencia = self.request.query_params.get('urgencia')

        if categoria:
            queryset = queryset.filter(categoria=categoria)
        if urgencia:
            queryset = queryset.filter(urgencia=urgencia)

        return queryset


class DetalleOportunidadView(generics.RetrieveAPIView):
    serializer_class = OportunidadSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Oportunidad.objects.all()


class PublicarOportunidadView(generics.CreateAPIView):
    serializer_class = OportunidadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(publicada_por=self.request.user)


class PostularseView(generics.CreateAPIView):
    serializer_class = PostulacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        oportunidad = Oportunidad.objects.get(pk=self.kwargs['pk'])
        serializer.save(postulante=self.request.user, oportunidad=oportunidad)


class MisOportunidadesView(generics.ListAPIView):
    serializer_class = OportunidadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Oportunidad.objects.filter(publicada_por=self.request.user)


class MisPostulacionesView(generics.ListAPIView):
    serializer_class = PostulacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Postulacion.objects.filter(postulante=self.request.user)