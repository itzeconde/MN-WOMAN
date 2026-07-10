from rest_framework import serializers
from .models import Curso


class CursoPublicSerializer(serializers.ModelSerializer):
    """Serializer de solo lectura para usuarios normales."""
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    nivel_display = serializers.CharField(source='get_nivel_display', read_only=True)

    class Meta:
        model = Curso
        fields = [
            'id', 'titulo', 'descripcion', 'imagen',
            'categoria', 'categoria_display',
            'nivel', 'nivel_display',
            'duracion_horas', 'link_externo', 'instructor',
            'fecha_creacion',
        ]


class CursoAdminSerializer(serializers.ModelSerializer):
    """Serializer completo para administradores (CRUD)."""
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    nivel_display = serializers.CharField(source='get_nivel_display', read_only=True)

    class Meta:
        model = Curso
        fields = '__all__'