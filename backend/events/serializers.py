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

    class Meta:
        model = Event
        fields = (
            'id', 'title', 'description', 'date', 'start_time',
            'end_time', 'location', 'hotel', 'status', 'cover_image',
            'referral_goal', 'total_asistentes', 'meta_referidos',
            'cupo_lleno', 'agenda', 'created_at'
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