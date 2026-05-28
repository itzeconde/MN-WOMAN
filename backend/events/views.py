from django.db import transaction
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import BasePermission
from .models import Event, Attendance
from .serializers import EventoSerializer, AsistenciaSerializer, AsistenteSerializer


class EsAdministradora(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'administrador'


class ListaEventosView(generics.ListAPIView):
    serializer_class = EventoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Event.objects.all().order_by('-date')


class DetalleEventoView(generics.RetrieveAPIView):
    serializer_class = EventoSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Event.objects.all()


class ConfirmarAsistenciaView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, evento_id):
        valor = request.data.get('asistencia')
        if valor not in ('si', 'no'):
            return Response(
                {'error': 'El campo asistencia debe ser "si" o "no"'},
                status=400
            )

        try:
            event = Event.objects.get(pk=evento_id)
        except Event.DoesNotExist:
            return Response({'error': 'Evento no encontrado'}, status=404)

        status_valor = 'confirmada' if valor == 'si' else 'cancelada'

        with transaction.atomic():
            # ✅ Verificar cupo ANTES de crear/actualizar el registro
            if status_valor == 'confirmada' and event.limite_asistentes is not None:
                ya_confirmada = Attendance.objects.filter(
                    event=event,
                    user=request.user,
                    status='confirmada'
                ).exists()

                if not ya_confirmada:
                    confirmadas = Attendance.objects.select_for_update().filter(
                        event=event,
                        status='confirmada'
                    ).count()

                    if confirmadas >= event.limite_asistentes:
                        return Response(
                            {
                                'error': 'Este evento ya alcanzó su límite de asistentes',
                                'cupo_agotado': True,
                            },
                            status=409
                        )

            # Ahora sí crear o actualizar
            asistencia, creada = Attendance.objects.get_or_create(
                event=event,
                user=request.user,
                defaults={'status': status_valor}
            )

            if not creada and asistencia.status != status_valor:
                asistencia.status = status_valor
                asistencia.save()

        return Response({
            'status': asistencia.status,
            'cupo_agotado': False,
        })


class MiAsistenciaView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, evento_id):
        try:
            asistencia = Attendance.objects.get(event_id=evento_id, user=request.user)
            return Response({'status': asistencia.status})
        except Attendance.DoesNotExist:
            return Response({'status': None})


class MisEventosView(generics.ListAPIView):
    serializer_class = AsistenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Attendance.objects.filter(user=self.request.user)


class EventoPublicListView(generics.ListAPIView):
    serializer_class = EventoSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Event.objects.all().order_by('-date')[:6]


# ── ADMIN ──────────────────────────────────────────────────────────────────────

class AdminEventoCreateView(generics.CreateAPIView):
    serializer_class = EventoSerializer
    permission_classes = [EsAdministradora]


class AdminEventoUpdateView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EventoSerializer
    permission_classes = [EsAdministradora]
    queryset = Event.objects.all()


class AdminAsistentesView(generics.ListAPIView):
    serializer_class = AsistenteSerializer
    permission_classes = [EsAdministradora]

    def get_queryset(self):
        return Attendance.objects.filter(
            event_id=self.kwargs['evento_id']
        ).select_related('user')

    def patch(self, request, evento_id):
        try:
            asistencia = Attendance.objects.get(
                pk=request.data['asistencia_id'],
                event_id=evento_id
            )
        except Attendance.DoesNotExist:
            return Response({'error': 'Asistencia no encontrada'}, status=404)
        asistencia.status = request.data['status']
        asistencia.save()
        return Response({'status': asistencia.status})