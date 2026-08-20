from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models
 
# Acepta 10 dígitos (celular MX sin lada) o 12 dígitos si ya trae la lada
# de país (52 + 10 dígitos). El dato debe llegar aquí ya limpio de espacios,
# guiones o paréntesis — esa limpieza vive en el serializer (validate_phone),
# así este validador siempre revisa contra el valor normalizado, no el que
# tecleó la usuaria tal cual.
telefono_validator = RegexValidator(
    regex=r'^\d{10}$|^52\d{10}$',
    message='El teléfono debe tener 10 dígitos (o incluir la lada 52 de México).',
)
 
 
class User(AbstractUser):
 
    ROLES = (
        ('empresaria', 'Empresaria'),
        ('administrador', 'Administrador'),
    )
 
    STATUS = (
        ('pendiente', 'Pendiente'),
        ('aprobada', 'Aprobada'),
        ('rechazada', 'Rechazada'),
    )
 
    YEARS_LEADING = (
        ('menos_1', 'Menos de 1'),
        ('1_3', '1 a 3'),
        ('3_5', '3 a 5'),
        ('mas_5', 'Más de 5'),
    )
 
    role = models.CharField(max_length=20, choices=ROLES, default='empresaria')
    status = models.CharField(max_length=20, choices=STATUS, default='pendiente')
    rechazo_motivo = models.TextField(blank=True)
    phone = models.CharField(
        max_length=20,
        blank=True,
        validators=[telefono_validator],
        help_text='Solo dígitos, con o sin lada 52. Este dato es visible en el perfil público.',
    )
    company = models.CharField(max_length=100, blank=True)
 
    # ── Texto libre — ya no choices fijos ─────────────────────────────────────
    business_sector = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=120, blank=True)
 
    years_leading = models.CharField(max_length=10, choices=YEARS_LEADING, blank=True)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    linkedin = models.URLField(blank=True)
    instagram = models.CharField(max_length=100, blank=True)
    twitter = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    is_founder = models.BooleanField(default=False)
    member_since = models.DateTimeField(auto_now_add=True)
 
    # banner_imagen y en_rotacion eliminados — los banners ahora los gestiona el admin
 
    def __str__(self):
        return f"{self.get_full_name()} - {self.company}"
 
    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.status = 'aprobada'
            self.role = 'administrador'
        super().save(*args, **kwargs)
 