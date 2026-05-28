from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from .models import Banner
from .serializers import BannerPublicSerializer, BannerAdminSerializer


class EsAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'administrador'


class BannerPublicView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        posicion = request.query_params.get('posicion', 'landing_pre_footer')
        hoy = timezone.now().date()
        banners = Banner.objects.filter(
            activo=True,
            fecha_inicio__lte=hoy,
            fecha_fin__gte=hoy,
            posicion__in=[posicion, 'global'],
        )
        serializer = BannerPublicSerializer(banners, many=True, context={'request': request})
        return Response(serializer.data)


class BannerAdminListCreateView(generics.ListCreateAPIView):
    queryset = Banner.objects.all()
    serializer_class = BannerAdminSerializer
    permission_classes = [EsAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_context(self):
        return {'request': self.request}


class BannerAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Banner.objects.all()
    serializer_class = BannerAdminSerializer
    permission_classes = [EsAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_context(self):
        return {'request': self.request}