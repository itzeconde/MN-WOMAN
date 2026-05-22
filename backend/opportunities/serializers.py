from rest_framework import serializers
from .models import Oportunidad, Postulacion


class OportunidadSerializer(serializers.ModelSerializer):
    publicada_por_nombre = serializers.SerializerMethodField()
    total_postulaciones = serializers.SerializerMethodField()

    class Meta:
        model = Oportunidad
        fields = (
            'id', 'publicada_por', 'publicada_por_nombre', 'titulo',
            'descripcion', 'categoria', 'urgencia', 'status',
            'presupuesto_min', 'presupuesto_max', 'etiquetas',
            'vence_el', 'total_postulaciones', 'creada_el'
        )
        read_only_fields = ('publicada_por', 'creada_el')

    def get_publicada_por_nombre(self, obj):
        return obj.publicada_por.get_full_name()

    def get_total_postulaciones(self, obj):
        return obj.postulaciones.count()


class PostulacionSerializer(serializers.ModelSerializer):
    oportunidad = OportunidadSerializer(read_only=True)

    class Meta:
        model = Postulacion
        fields = ('id', 'oportunidad', 'mensaje', 'status', 'postulada_el')
        read_only_fields = ('status', 'postulada_el')