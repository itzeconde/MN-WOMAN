from rest_framework import serializers
from .models import Course, Enrollment


class CursoSerializer(serializers.ModelSerializer):
    nombre_instructora = serializers.SerializerMethodField()
    total_inscritas = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            'id', 'title', 'description', 'instructor', 'nombre_instructora',
            'category', 'level', 'duration_hours', 'thumbnail',
            'is_active', 'total_inscritas', 'created_at'
        )

    def get_nombre_instructora(self, obj):
        return obj.instructor.get_full_name() if obj.instructor else None

    def get_total_inscritas(self, obj):
        return obj.enrollments.count()


class InscripcionSerializer(serializers.ModelSerializer):
    curso = CursoSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ('id', 'curso', 'status', 'enrolled_at', 'completed_at')
        read_only_fields = ('enrolled_at',)