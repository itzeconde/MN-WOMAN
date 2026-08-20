from datetime import datetime

from django.utils import timezone
from rest_framework import serializers

from .models import Event, Attendance, AgendaItem


class AgendaItemSerializer(serializers.ModelSerializer):
    nombre_ponente = serializers.SerializerMethodField()

    class Meta:
        model = AgendaItem
        fields = (
            'id', 'title', 'nombre_ponente', 'room',
            'start_time', 'is_current'
        )

    def get_nombre_ponente(self, obj):
        return obj.speaker.get_full_name() if obj.speaker else None


class EventoSerializer(serializers.ModelSerializer):
    agenda = AgendaItemSerializer(many=True, read_only=True)
    total_asistentes = serializers.SerializerMethodField()
    meta_referidos = serializers.SerializerMethodField()
    cupo_lleno = serializers.SerializerMethodField()
    esta_vencido = serializers.SerializerMethodField()

    # Se redeclara "status" (aunque ya existe como campo del modelo) para que
    # el serializer lo calcule dinámicamente en vez de devolver el valor fijo
    # guardado en BD. Así el estado siempre refleja la fecha/hora real del
    # evento, sin depender de un cron job ni de que alguien lo actualice a mano.
    status = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = (
            'id', 'title', 'description', 'date', 'start_time',
            'end_time', 'location', 'hotel', 'status', 'cover_image',
            'referral_goal', 'total_asistentes', 'meta_referidos',
            'cupo_lleno', 'esta_vencido', 'agenda', 'created_at'
        )

    def get_total_asistentes(self, obj):
        return obj.attendances.filter(status='confirmada').count()

    def get_meta_referidos(self, obj):
        return obj.referral_goal

    def get_cupo_lleno(self, obj):
        if obj.limite_asistentes is None:
            return False
        confirmadas = obj.attendances.filter(status='confirmada').count()
        return confirmadas >= obj.limite_asistentes

    def get_esta_vencido(self, obj):
        return obj.date < timezone.now().date()

    def get_status(self, obj):
        # Si alguien ya lo cerró manualmente desde el admin (ej. se canceló
        # antes de tiempo), respetamos esa decisión y no la recalculamos.
        if obj.status == 'finalizado':
            return 'finalizado'

        inicio_naive = datetime.combine(obj.date, obj.start_time)
        fin_naive = datetime.combine(obj.date, obj.end_time)

        if timezone.is_aware(timezone.now()):
            tz = timezone.get_current_timezone()
            inicio = timezone.make_aware(inicio_naive, tz)
            fin = timezone.make_aware(fin_naive, tz)
            ahora = timezone.now()
        else:
            inicio, fin, ahora = inicio_naive, fin_naive, datetime.now()

        if ahora < inicio:
            return 'proximo'
        if inicio <= ahora <= fin:
            return 'en_curso'
        return 'finalizado'


class AsistenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ('id', 'event', 'user', 'status', 'registered_at')
        read_only_fields = ('registered_at',)


class AsistenteSerializer(serializers.ModelSerializer):
    nombre = serializers.SerializerMethodField()
    empresa = serializers.SerializerMethodField()
    foto = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = ('id', 'nombre', 'empresa', 'foto', 'status', 'registered_at')

    def get_nombre(self, obj):
        return obj.user.get_full_name()

    def get_empresa(self, obj):
        return obj.user.company if hasattr(obj.user, 'company') else ''

    def get_foto(self, obj):
        request = self.context.get('request')
        if obj.user.profile_picture and request:
            return request.build_absolute_uri(obj.user.profile_picture.url)
        return None