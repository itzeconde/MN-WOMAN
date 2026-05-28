from rest_framework import serializers
from .models import Banner


class BannerPublicSerializer(serializers.ModelSerializer):
    """Solo los campos necesarios para mostrar en frontend público."""
    imagen_url = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = ['id', 'titulo', 'imagen_url', 'url_destino', 'posicion']

    def get_imagen_url(self, obj):
        request = self.context.get('request')
        if obj.imagen and request:
            return request.build_absolute_uri(obj.imagen.url)
        return None


class BannerAdminSerializer(serializers.ModelSerializer):
    """Todos los campos para el panel de administración."""
    imagen_url = serializers.SerializerMethodField()
    esta_vigente = serializers.BooleanField(read_only=True)
    posicion_display = serializers.CharField(source='get_posicion_display', read_only=True)

    class Meta:
        model = Banner
        fields = [
            'id', 'titulo', 'imagen', 'imagen_url', 'url_destino',
            'activo', 'fecha_inicio', 'fecha_fin',
            'posicion', 'posicion_display',
            'esta_vigente', 'creado_en',
        ]
        read_only_fields = ['creado_en']

    def get_imagen_url(self, obj):
        request = self.context.get('request')
        if obj.imagen and request:
            return request.build_absolute_uri(obj.imagen.url)
        return None