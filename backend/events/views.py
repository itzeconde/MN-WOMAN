from datetime import datetime

from django.db import transaction
from django.utils import timezone
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
    permission_classes = [permissions.AllowAny]  # ← era IsAuthenticated
    queryset = Event.objects.all()


def _evento_ya_paso(event: Event) -> bool:
    """
    Un evento ya no acepta confirmaciones si su hora de fin ya quedó atrás,
    o si alguien lo marcó 'finalizado' manualmente desde el admin. No
    reutilizamos EventoSerializer.get_status aquí para no acoplar la vista
    al serializer; la regla es simple y vive junto a donde se aplica.
    """
    if event.status == 'finalizado':
        return True

    fin_naive = datetime.combine(event.date, event.end_time)
    if timezone.is_aware(timezone.now()):
        fin = timezone.make_aware(fin_naive, timezone.get_current_timezone())
    else:
        fin = fin_naive

    return timezone.now() > fin


class ConfirmarAsistenciaView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, evento_id):
        valor = request.data.get('asistencia')
        if valor not in ('si', 'no'):
            return Response(
                {'error': 'El campo asistencia debe ser "si" o "no"'},
                status=400
            )

        status_valor = 'confirmada' if valor == 'si' else 'cancelada'

        with transaction.atomic():
            # Bloqueamos la fila del propio Event (que siempre existe) en vez
            # de las filas de Attendance (que pueden no existir todavía).
            # Así, si dos requests llegan casi al mismo tiempo para el mismo
            # evento, el segundo espera a que el primero termine su
            # transacción antes de contar el cupo — eliminando la ventana de
            # carrera donde ambos ven el mismo conteo y ambos pasan la
            # validación, dejando pasar más asistentes de los permitidos.
            try:
                event = Event.objects.select_for_update().get(pk=evento_id)
            except Event.DoesNotExist:
                return Response({'error': 'Evento no encontrado'}, status=404)

            # ✅ Un evento que ya pasó no acepta nuevas confirmaciones. Esto
            # antes solo se ocultaba en el frontend (el botón desaparecía),
            # pero cualquiera podía seguir pegándole directo al endpoint.
            # Sí dejamos cancelar ('no') incluso si el evento ya pasó, por si
            # alguien quiere corregir un registro viejo.
            if status_valor == 'confirmada' and _evento_ya_paso(event):
                return Response(
                    {'error': 'Este evento ya finalizó y no acepta nuevas confirmaciones'},
                    status=400
                )

            # ✅ Verificar cupo ANTES de crear/actualizar el registro
            if status_valor == 'confirmada' and event.limite_asistentes is not None:
                ya_confirmada = Attendance.objects.filter(
                    event=event,
                    user=request.user,
                    status='confirmada'
                ).exists()

                if not ya_confirmada:
                    confirmadas = Attendance.objects.filter(
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
        asistencia_id = request.data.get('asistencia_id')
        status_nuevo = request.data.get('status')

        if not asistencia_id or not status_nuevo:
            return Response(
                {'error': 'Se requieren "asistencia_id" y "status"'},
                status=400
            )

        valores_validos = dict(Attendance.STATUS)
        if status_nuevo not in valores_validos:
            return Response(
                {'error': f'"status" debe ser uno de: {", ".join(valores_validos)}'},
                status=400
            )

        try:
            asistencia = Attendance.objects.get(
                pk=asistencia_id,
                event_id=evento_id
            )
        except Attendance.DoesNotExist:
            return Response({'error': 'Asistencia no encontrada'}, status=404)

        asistencia.status = status_nuevo
        asistencia.save()
        return Response({'status': asistencia.status})