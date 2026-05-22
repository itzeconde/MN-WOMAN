from rest_framework import serializers
from .models import Institucion, SolicitudApoyo


class InstitucionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institucion
        fields = (
            'id', 'nombre', 'tipo', 'telefono',
            'horario', 'direccion', 'emergencias_24h'
        )


class SolicitudApoyoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitudApoyo
        fields = ('id', 'tipo', 'descripcion', 'status', 'creada_el')
        read_only_fields = ('status', 'creada_el')