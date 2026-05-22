from rest_framework import serializers
from .models import Servicio


class ServicioSerializer(serializers.ModelSerializer):
    nombre_proveedora = serializers.SerializerMethodField()

    class Meta:
        model = Servicio
        fields = (
            'id', 'proveedora', 'nombre_proveedora', 'titulo',
            'descripcion', 'categoria', 'precio',
            'precio_personalizado', 'activo', 'creado_el'
        )
        read_only_fields = ('proveedora', 'creado_el')

    def get_nombre_proveedora(self, obj):
        return obj.proveedora.get_full_name()