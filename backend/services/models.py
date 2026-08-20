from django.db import models
from users.models import User


class Servicio(models.Model):

    CATEGORIAS = (
        ('consultoria', 'Consultoría y Negocios'),
        ('marketing_branding', 'Marketing y Diseño'),
        ('tecnologia', 'Tecnología'),
        ('educacion', 'Educación y Formación'),
        ('salud_bienestar', 'Salud y Bienestar'),
        ('otro', 'Otro'),
    )

    proveedora = models.ForeignKey(User, on_delete=models.CASCADE, related_name='servicios')
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    categoria = models.CharField(max_length=20, choices=CATEGORIAS, default='consultoria')
    categoria_otro = models.CharField(max_length=80, blank=True, default='')
    precio = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    precio_personalizado = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)
    creado_el = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-creado_el']

    def __str__(self):
        return f"{self.titulo} - {self.proveedora}"

    def get_categoria_display_final(self):
        """Si la categoría es 'otro', muestra lo que escribió la proveedora; si no, el label fijo."""
        if self.categoria == 'otro' and self.categoria_otro:
            return self.categoria_otro
        return self.get_categoria_display()