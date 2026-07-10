from django.contrib import admin
from .models import Curso

@admin.register(Curso)
class CursoAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'categoria', 'nivel', 'duracion_horas', 'activo', 'fecha_creacion']
    list_filter = ['categoria', 'nivel', 'activo']
    search_fields = ['titulo', 'instructor']
    list_editable = ['activo']