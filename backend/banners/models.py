from django.db import models
from django.utils import timezone


class Banner(models.Model):
    POSICION_CHOICES = [
        ('landing_pre_footer', 'Landing — Antes del Footer'),
        ('landing_entre_secciones', 'Landing — Entre Secciones'),
        ('directorio', 'Directorio de Miembros'),
        ('dashboard', 'Dashboard / Home del Usuario'),
        ('global', 'Todas las Páginas (Banner Global)'),
    ]

    titulo = models.CharField(max_length=100)
    imagen = models.ImageField(upload_to='banners/')
    url_destino = models.URLField()
    activo = models.BooleanField(default=True)
    fecha_inicio = models.DateField(default=timezone.now)
    fecha_fin = models.DateField()
    posicion = models.CharField(max_length=50, choices=POSICION_CHOICES, default='landing_pre_footer')
    creado_en = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        verbose_name = 'Banner'
        verbose_name_plural = 'Banners'
        ordering = ['-creado_en']

    def __str__(self):
        return f"{self.titulo} ({self.get_posicion_display()})"

    @property
    def esta_vigente(self):
        hoy = timezone.now().date()
        return self.activo and self.fecha_inicio <= hoy <= self.fecha_fin