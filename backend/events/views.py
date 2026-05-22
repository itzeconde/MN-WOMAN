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
        try:
            event = Event.objects.get(pk=evento_id)
        except Event.DoesNotExist:
            return Response({'error': 'Evento no encontrado'}, status=404)

        asistencia, creada = Attendance.objects.get_or_create(
            event=event,
            user=request.user,
            defaults={'status': 'confirmada'}
        )
        if not creada:
            asistencia.status = 'confirmada'
            asistencia.save()
        return Response({'status': asistencia.status})


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
    
        
    