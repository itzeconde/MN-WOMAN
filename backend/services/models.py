from django.db import models
from users.models import User


class Servicio(models.Model):

    CATEGORIAS = (
        ('consultoria', 'Consultoría'),
        ('workshop', 'Workshop'),
        ('estrategia', 'Estrategia'),
        ('branding', 'Branding'),
        ('tecnologia', 'Tecnología'),
        ('marketing', 'Marketing'),
        ('educacion', 'Educación'),
    )

    proveedora = models.ForeignKey(User, on_delete=models.CASCADE, related_name='servicios')
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    categoria = models.CharField(max_length=80)
    precio = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    precio_personalizado = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)
    creado_el = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} - {self.proveedora}"