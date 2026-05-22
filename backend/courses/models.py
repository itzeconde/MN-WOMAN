from django.db import models
from users.models import User


class Course(models.Model):

    LEVELS = (
        ('basico', 'Básico'),
        ('intermedio', 'Intermedio'),
        ('avanzado', 'Avanzado'),
    )

    CATEGORIES = (
        ('sensibilizacion', 'Formación en Sensibilización'),
        ('academico', 'Programa Académico'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    instructor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='courses_teaching')
    category = models.CharField(max_length=20, choices=CATEGORIES)
    level = models.CharField(max_length=20, choices=LEVELS)
    duration_hours = models.PositiveIntegerField()
    thumbnail = models.ImageField(upload_to='courses/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Enrollment(models.Model):

    STATUS = (
        ('activa', 'Activa'),
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(max_length=20, choices=STATUS, default='activa')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user} - {self.course}"