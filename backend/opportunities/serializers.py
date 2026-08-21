from django.utils import timezone
from rest_framework import serializers
from .models import Oportunidad, Postulacion


class OportunidadSerializer(serializers.ModelSerializer):
    publicada_por_nombre = serializers.SerializerMethodField()
    categoria_display = serializers.SerializerMethodField()
    total_postulaciones = serializers.SerializerMethodField()
    postulaciones_pendientes = serializers.SerializerMethodField()
    es_propia = serializers.SerializerMethodField()
    ya_postulada = serializers.SerializerMethodField()
    esta_vencida = serializers.SerializerMethodField()

    class Meta:
        model = Oportunidad
        fields = (
            'id', 'publicada_por', 'publicada_por_nombre', 'titulo',
            'descripcion', 'categoria', 'categoria_otro', 'categoria_display',
            'urgencia', 'status', 'presupuesto_min', 'presupuesto_max',
            'etiquetas', 'vence_el', 'total_postulaciones',
            'postulaciones_pendientes', 'creada_el', 'es_propia',
            'ya_postulada', 'esta_vencida',
        )
        read_only_fields = ('publicada_por', 'creada_el', 'status')

    def get_publicada_por_nombre(self, obj):
        return obj.publicada_por.get_full_name()

    def get_categoria_display(self, obj):
        return obj.get_categoria_display_final()

    def get_total_postulaciones(self, obj):
        return obj.postulaciones.count()

    def get_postulaciones_pendientes(self, obj):
        return obj.postulaciones.filter(status='pendiente').count()

    def get_es_propia(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.publicada_por_id == request.user.id

    def get_ya_postulada(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.postulaciones.filter(postulante=request.user).exists()

    def get_esta_vencida(self, obj):
        return obj.vence_el < timezone.now().date()

    def validate(self, data):
        categoria = data.get('categoria', getattr(self.instance, 'categoria', None))
        categoria_otro = (data.get('categoria_otro') or '').strip()

        if categoria == 'otro' and not categoria_otro:
            raise serializers.ValidationError({
                'categoria_otro': 'Cuéntanos de qué trata tu oportunidad.'
            })

        # Si no es "otro", nunca dejamos basura residual en categoria_otro
        data['categoria_otro'] = categoria_otro if categoria == 'otro' else ''
        return data


class PostulacionSerializer(serializers.ModelSerializer):
    oportunidad = OportunidadSerializer(read_only=True)

    class Meta:
        model = Postulacion
        fields = ('id', 'oportunidad', 'mensaje', 'status', 'postulada_el')
        read_only_fields = ('status', 'postulada_el')


class PostulacionRecibidaSerializer(serializers.ModelSerializer):
    postulante_nombre = serializers.SerializerMethodField()
    postulante_correo = serializers.SerializerMethodField()

    class Meta:
        model = Postulacion
        fields = (
            'id', 'postulante_nombre', 'postulante_correo',
            'mensaje', 'status', 'postulada_el',
        )

    def get_postulante_nombre(self, obj):
        return obj.postulante.get_full_name()

    def get_postulante_correo(self, obj):
        return obj.postulante.email