from rest_framework import generics, permissions
from .models import Course, Enrollment
from .serializers import CursoSerializer, InscripcionSerializer


class ListaCursosView(generics.ListAPIView):
    serializer_class = CursoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Course.objects.filter(is_active=True)

        categoria = self.request.query_params.get('categoria')
        nivel = self.request.query_params.get('nivel')

        if categoria:
            queryset = queryset.filter(category=categoria)
        if nivel:
            queryset = queryset.filter(level=nivel)

        return queryset


class DetalleCursoView(generics.RetrieveAPIView):
    serializer_class = CursoSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Course.objects.filter(is_active=True)


class InscribirseView(generics.CreateAPIView):
    serializer_class = InscripcionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MisCursosView(generics.ListAPIView):
    serializer_class = InscripcionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user)
class CursoPublicListView(generics.ListAPIView):
    serializer_class = CursoSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Course.objects.filter(is_active=True)