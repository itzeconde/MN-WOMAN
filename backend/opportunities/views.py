from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError, PermissionDenied
from .models import Oportunidad, Postulacion
from .serializers import (
    OportunidadSerializer,
    PostulacionSerializer,
    PostulacionRecibidaSerializer,
)


class ListaOportunidadesView(generics.ListAPIView):
    serializer_class = OportunidadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Oportunidad.objects.filter(
            status='activa',
            vence_el__gte=timezone.now().date(),
        ).order_by('-creada_el')

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


class CerrarOportunidadView(generics.UpdateAPIView):
    serializer_class = OportunidadSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Oportunidad.objects.all()

    def patch(self, request, *args, **kwargs):
        oportunidad = self.get_object()

        if oportunidad.publicada_por_id != request.user.id:
            raise PermissionDenied('No puedes cerrar una oportunidad que no publicaste.')

        oportunidad.status = 'cerrada'
        oportunidad.save(update_fields=['status'])

        serializer = self.get_serializer(oportunidad)
        return Response(serializer.data)


class PostularseView(generics.CreateAPIView):
    serializer_class = PostulacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        oportunidad = Oportunidad.objects.get(pk=self.kwargs['pk'])
        usuario = self.request.user

        if oportunidad.vence_el < timezone.now().date():
            raise ValidationError('Esta oportunidad ya venció.')

        if oportunidad.status == 'cerrada':
            raise ValidationError('Esta oportunidad ya fue cerrada por quien la publicó.')

        if oportunidad.publicada_por_id == usuario.id:
            raise ValidationError('No puedes postularte a tu propia oportunidad.')

        if Postulacion.objects.filter(oportunidad=oportunidad, postulante=usuario).exists():
            raise ValidationError('Ya te postulaste a esta oportunidad.')

        serializer.save(postulante=usuario, oportunidad=oportunidad)


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


class PostulacionesRecibidasView(generics.ListAPIView):
    serializer_class = PostulacionRecibidaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        oportunidad = Oportunidad.objects.get(pk=self.kwargs['pk'])

        if oportunidad.publicada_por_id != self.request.user.id:
            raise PermissionDenied('No tienes permiso para ver estas postulaciones.')

        return Postulacion.objects.filter(oportunidad=oportunidad).order_by('-postulada_el')