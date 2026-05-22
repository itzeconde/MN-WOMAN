from rest_framework import serializers
from .models import User


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

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'first_name', 'last_name',
            'phone', 'company', 'business_sector', 'location', 'years_leading'
        )

    # ── Validaciones de unicidad con mensajes en español ──────────────────────

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Este correo ya está registrado.')
        return value.lower()

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Este usuario ya está en uso.')
        return value

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
        user = User.objects.create_user(**validated_data)
        # Notificar al admin por WhatsApp
        try:
            from .whatsapp import notificar_nueva_solicitud
            notificar_nueva_solicitud(user)
        except Exception:
            pass  # No romper el registro si falla WhatsApp
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
            'twitter', 'website'
        )


class SolicitudSerializer(serializers.ModelSerializer):
    """Para que el admin vea y gestione solicitudes"""
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