from django.db import models
from users.models import User


class Event(models.Model):

    STATUS = (
        ('proximo', 'Próximo'),
        ('en_curso', 'En Curso'),
        ('finalizado', 'Finalizado'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=200)
    hotel = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='proximo')
    cover_image = models.ImageField(upload_to='events/', blank=True, null=True)
    referral_goal = models.PositiveIntegerField(default=100)
    limite_asistentes = models.PositiveIntegerField(null=True, blank=True)
    costo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.date}"


class Attendance(models.Model):

    STATUS = (
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
        ('pendiente', 'Pendiente'),
        ('ausente', 'Ausente'),
    )

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendances')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendances')
    status = models.CharField(max_length=20, choices=STATUS, default='pendiente')
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('event', 'user')

    def __str__(self):
        return f"{self.user} - {self.event}"


class AgendaItem(models.Model):

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='agenda')
    title = models.CharField(max_length=200)
    speaker = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='agenda_items')
    room = models.CharField(max_length=100, blank=True)
    start_time = models.TimeField()
    is_current = models.BooleanField(default=False)

    class Meta:
        ordering = ['start_time']

    def __str__(self):
        return f"{self.title} - {self.start_time}"