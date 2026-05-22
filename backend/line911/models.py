from django.db import models
from users.models import User


class Institucion(models.Model):

    TIPOS = (
        ('gobierno', 'Gobierno'),
        ('refugio', 'Refugio'),
        ('fiscalia', 'Fiscalía'),
        ('dif', 'DIF'),
    )

    nombre = models.CharField(max_length=200)
    tipo = models.CharField(max_length=20, choices=TIPOS)
    telefono = models.CharField(max_length=20)
    horario = models.CharField(max_length=100)
    direccion = models.CharField(max_length=200)
    emergencias_24h = models.BooleanField(default=False)
    activa = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre


class SolicitudApoyo(models.Model):

    TIPOS = (
        ('violencia', 'Violencia Doméstica'),
        ('psicologico', 'Apoyo Psicológico'),
        ('legal', 'Asesoría Legal'),
        ('solidaridad', 'Solidaridad de Red'),
    )

    STATUS = (
        ('pendiente', 'Pendiente'),
        ('atendida', 'Atendida'),
        ('cerrada', 'Cerrada'),
    )

    usuaria = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='solicitudes_apoyo')
    tipo = models.CharField(max_length=20, choices=TIPOS)
    descripcion = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='pendiente')
    creada_el = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Solicitudes de Apoyo'

    def __str__(self):
        return f"{self.tipo} - {self.creada_el.date()}"