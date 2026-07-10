import os
from django.db import models
from django.core.exceptions import ValidationError


def validar_imagen(imagen):
    """Limita tamaño a 3MB y solo acepta jpg/jpeg/png/webp."""
    limite_mb = 3
    if imagen.size > limite_mb * 1024 * 1024:
        raise ValidationError(f'La imagen no puede superar {limite_mb}MB.')
    ext = os.path.splitext(imagen.name)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
        raise ValidationError('Solo se permiten imágenes JPG, PNG o WEBP.')


class Curso(models.Model):
    CATEGORIA_CHOICES = [
        ('sensibilizacion', 'Formación en Sensibilización'),
        ('academico', 'Programa Académico'),
        ('liderazgo', 'Liderazgo y Negocios'),
        ('tecnologia', 'Tecnología'),
        ('finanzas', 'Finanzas'),
        ('marketing', 'Marketing Digital'),
        ('otro', 'Otro'),
    ]

    NIVEL_CHOICES = [
        ('basico', 'Básico'),
        ('intermedio', 'Intermedio'),
        ('avanzado', 'Avanzado'),
    ]

    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    imagen = models.ImageField(
        upload_to='cursos/',
        blank=True,
        null=True,
        validators=[validar_imagen]
    )
    categoria = models.CharField(max_length=50, choices=CATEGORIA_CHOICES, default='otro')
    nivel = models.CharField(max_length=20, choices=NIVEL_CHOICES, default='basico')
    duracion_horas = models.PositiveIntegerField(help_text='Duración en horas')
    link_externo = models.URLField(blank=True, null=True)
    instructor = models.CharField(max_length=150, blank=True, null=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name = 'Curso'
        verbose_name_plural = 'Cursos'

    def __str__(self):
        return self.titulo