from django.db import models
from users.models import User


class Oportunidad(models.Model):

    CATEGORIAS = (
        ('consultoria', 'Consultoría y Negocios'),
        ('marketing_branding', 'Marketing y Diseño'),
        ('tecnologia', 'Tecnología'),
        ('educacion', 'Educación y Formación'),
        ('salud_bienestar', 'Salud y Bienestar'),
        ('otro', 'Otro'),
    )

    URGENCIA = (
        ('alta', 'Alta'),
        ('media', 'Media'),
        ('baja', 'Baja'),
    )

    STATUS = (
        ('activa', 'Activa'),
        ('cerrada', 'Cerrada'),
        ('vencida', 'Vencida'),
    )

    publicada_por = models.ForeignKey(User, on_delete=models.CASCADE, related_name='oportunidades')
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    categoria = models.CharField(max_length=20, choices=CATEGORIAS)
    categoria_otro = models.CharField(max_length=80, blank=True, default='')
    urgencia = models.CharField(max_length=10, choices=URGENCIA, default='media')
    status = models.CharField(max_length=10, choices=STATUS, default='activa')
    presupuesto_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    presupuesto_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    etiquetas = models.CharField(max_length=200, blank=True)
    vence_el = models.DateField()
    creada_el = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} - {self.publicada_por}"

    def get_categoria_display_final(self):
        """Si la categoría es 'otro', muestra lo que escribió quien publicó; si no, el label fijo."""
        if self.categoria == 'otro' and self.categoria_otro:
            return self.categoria_otro
        return self.get_categoria_display()


class Postulacion(models.Model):

    STATUS = (
        ('pendiente', 'Pendiente'),
        ('aceptada', 'Aceptada'),
        ('rechazada', 'Rechazada'),
    )

    oportunidad = models.ForeignKey(Oportunidad, on_delete=models.CASCADE, related_name='postulaciones')
    postulante = models.ForeignKey(User, on_delete=models.CASCADE, related_name='postulaciones')
    mensaje = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='pendiente')
    postulada_el = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('oportunidad', 'postulante')

    def __str__(self):
        return f"{self.postulante} -> {self.oportunidad}"