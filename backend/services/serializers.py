from rest_framework import serializers
from .models import Servicio


class ServicioSerializer(serializers.ModelSerializer):
    nombre_proveedora = serializers.SerializerMethodField()
    categoria_display = serializers.SerializerMethodField()

    class Meta:
        model = Servicio
        fields = (
            'id', 'proveedora', 'nombre_proveedora', 'titulo',
            'descripcion', 'categoria', 'categoria_otro', 'categoria_display',
            'precio', 'precio_personalizado', 'activo', 'creado_el'
        )
        read_only_fields = ('proveedora', 'creado_el')

    def get_nombre_proveedora(self, obj):
        return obj.proveedora.get_full_name()

    def get_categoria_display(self, obj):
        return obj.get_categoria_display_final()

    def validate(self, data):
        categoria = data.get('categoria', getattr(self.instance, 'categoria', None))
        categoria_otro = (data.get('categoria_otro') or '').strip()

        if categoria == 'otro' and not categoria_otro:
            raise serializers.ValidationError({
                'categoria_otro': 'Cuéntanos de qué trata tu servicio.'
            })

        # Si no es "otro", nunca dejamos basura residual en categoria_otro
        data['categoria_otro'] = categoria_otro if categoria == 'otro' else ''
        return data


class ServicioEditSerializer(ServicioSerializer):
    """
    Igual que ServicioSerializer, pero bloquea 'activo' — eso se cambia
    solo desde ToggleActivoServicioView.
    """
    class Meta(ServicioSerializer.Meta):
        read_only_fields = ServicioSerializer.Meta.read_only_fields + ('activo',)