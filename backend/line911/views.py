from rest_framework import generics, permissions
from .models import Institucion, SolicitudApoyo
from .serializers import InstitucionSerializer, SolicitudApoyoSerializer


class ListaInstitucionesView(generics.ListAPIView):
    serializer_class = InstitucionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Institucion.objects.filter(activa=True)


class SolicitarApoyoView(generics.CreateAPIView):
    serializer_class = SolicitudApoyoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(usuaria=self.request.user)
class InstitucionPublicListView(generics.ListAPIView):
    serializer_class = InstitucionSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Institucion.objects.filter(activa=True)