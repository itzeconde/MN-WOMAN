import re
import unicodedata
from rest_framework import serializers
from .models import User


def _limpiar_texto(texto: str) -> str:
    """Quita tildes/espacios y deja solo [a-zA-Z0-9_], igual que la lógica del frontend."""
    texto = texto.strip().replace(' ', '')
    texto = unicodedata.normalize('NFD', texto)
    texto = ''.join(c for c in texto if unicodedata.category(c) != 'Mn')  # quita tildes
    texto = re.sub(r'[^a-zA-Z0-9_]', '', texto)
    return texto


def generar_username(first_name: str, last_name: str) -> str:
    """Genera MNW_<nombre><apellido>, resolviendo colisiones con sufijo numérico."""
    base = f"MNW_{_limpiar_texto(first_name)}{_limpiar_texto(last_name)}"[:30]
    if not base or base == 'MNW_':
        base = 'MNW_usuaria'

    candidato = base
    sufijo = 1
    while User.objects.filter(username__iexact=candidato).exists():
        sufijo += 1
        recorte = base[:30 - len(str(sufijo))]
        candidato = f"{recorte}{sufijo}"
    return candidato


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'company', 'business_sector',
            'location', 'years_leading', 'bio',
            'profile_picture', 'linkedin', 'instagram', 'twitter',
            'website', 'is_verified', 'is_founder', 'member_since', 'status'
        )
        read_only_fields = ('is_verified', 'member_since', 'role')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    # El username lo genera el backend en create(). Aunque el cliente mande
    # algo en este campo, al ser read_only DRF lo ignora por completo.
    username = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'first_name', 'last_name',
            'phone', 'company', 'business_sector', 'location', 'years_leading'
        )

    def validate_first_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('El nombre es obligatorio.')
        return value

    def validate_last_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('El apellido es obligatorio.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Este correo ya está registrado.')
        return value.lower()

    def validate_phone(self, value):
        if value and User.objects.filter(phone=value).exists():
            raise serializers.ValidationError('Este teléfono ya está registrado.')
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError('La contraseña debe tener mínimo 8 caracteres.')
        if not any(c.isupper() for c in value):
            raise serializers.ValidationError('La contraseña debe contener al menos una mayúscula.')
        if not any(c.isdigit() for c in value):
            raise serializers.ValidationError('La contraseña debe contener al menos un número.')
        return value

    def create(self, validated_data):
        validated_data.pop('username', None)  # por si llega algo, se descarta
        username = generar_username(validated_data['first_name'], validated_data['last_name'])

        # Nace inactiva y pendiente: no puede hacer login hasta ser aprobada.
        user = User.objects.create_user(
            username=username,
            is_active=False,
            **validated_data,
        )
        try:
            from .whatsapp import notificar_nueva_solicitud
            notificar_nueva_solicitud(user)
        except Exception:
            pass
        return user


class DirectorioSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'nombre_completo', 'company', 'role',
            'business_sector', 'location', 'years_leading',
            'bio', 'profile_picture', 'linkedin', 'instagram',
            'twitter', 'website', 'is_verified', 'is_founder', 'member_since'
        )

    def get_nombre_completo(self, obj):
        return obj.get_full_name()


class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'first_name', 'last_name', 'phone', 'company',
            'business_sector', 'location', 'years_leading',
            'bio', 'profile_picture', 'linkedin', 'instagram',
            'twitter', 'website',
        )


class SolicitudSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'nombre_completo', 'email', 'phone', 'company',
            'business_sector', 'location', 'years_leading',
            'profile_picture', 'member_since', 'status', 'is_active'
        )

    def get_nombre_completo(self, obj):
        return obj.get_full_name()