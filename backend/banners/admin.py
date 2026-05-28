from django.contrib import admin
from .models import Banner


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'posicion', 'activo', 'fecha_inicio', 'fecha_fin', 'esta_vigente']
    list_filter = ['activo', 'posicion']
    list_editable = ['activo']
    readonly_fields = ['creado_en']

    def esta_vigente(self, obj):
        return obj.esta_vigente
    esta_vigente.boolean = True
    esta_vigente.short_description = '¿Vigente?'