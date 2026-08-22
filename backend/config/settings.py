import os
import dj_database_url
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError(
        'SECRET_KEY no está definido en el entorno. '
        'No arranques la aplicación sin una SECRET_KEY real.'
    )

# Default seguro: False. En tu .env de producción define DEBUG=False explícitamente.
DEBUG = os.getenv('DEBUG', 'False') == 'True'

# En producción: tu(s) dominio(s) real(es), separados por coma en la env var.
# Ej: ALLOWED_HOSTS=tuapp.up.railway.app,api.mnwoman.com
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",

    # Cloudinary — debe ir ANTES de staticfiles para que intercepte
    # correctamente el manejo de archivos de media.
    'cloudinary_storage',
    "django.contrib.staticfiles",
    'cloudinary',

    # Terceros
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',

    # Apps del proyecto
    'users',
    'articles',
    'events',
    'services',
    'deals',
    'courses',
    'opportunities',
    'line911',
    'banners',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # sirve estáticos en producción (admin, DRF browsable API)
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# --- BASE DE DATOS ---
# Si existe DATABASE_URL (Supabase te la da como "connection string" en
# Project Settings > Database > Connection string > URI), se usa esa.
# Si no, cae de vuelta a las variables sueltas (útil para desarrollo local).
DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600, ssl_require=True)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'mnwoman_db'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "es-mx"
TIME_ZONE = "America/Mexico_City"
USE_I18N = True
USE_TZ = True

# --- ARCHIVOS ESTÁTICOS ---
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / 'staticfiles'  # a donde collectstatic copia todo
# Se mantiene junto con STORAGES (más abajo) porque el comando collectstatic
# de django-cloudinary-storage revisa este atributo directamente y truena
# con AttributeError si no existe, aunque Django ya no lo use para resolver
# el storage real.
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
# Evita que collectstatic truene si algún CSS (ej. del admin de Django)
# referencia un archivo estático que no se encontró — lo deja pasar en vez
# de detener el build completo por un ícono/asset menor.
WHITENOISE_MANIFEST_STRICT = False

# --- ARCHIVOS DE MEDIA (imágenes subidas por usuarios) ---
# Antes se guardaban en disco local (BASE_DIR / 'media'), pero el disco de
# Render es efímero: cada deploy o reinicio del servicio borra lo subido
# después del último deploy. Por eso el media ahora vive en Cloudinary,
# que persiste sin importar cuántas veces se reinicie el backend.
MEDIA_URL = '/media/'

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.getenv('CLOUDINARY_API_KEY'),
    'API_SECRET': os.getenv('CLOUDINARY_API_SECRET'),
}

if not all(CLOUDINARY_STORAGE.values()):
    raise ValueError(
        'Faltan variables de entorno de Cloudinary '
        '(CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). '
        'Sin ellas, las imágenes subidas (eventos, cursos, artículos) no '
        'se van a guardar correctamente.'
    )

# Forma moderna de configurar storages (reemplaza a DEFAULT_FILE_STORAGE y
# STATICFILES_STORAGE, que quedaron obsoletos desde Django 4.2 y ya no
# surten efecto en Django 6 — por eso las imágenes se seguían guardando
# en disco local aunque DEFAULT_FILE_STORAGE apuntara a Cloudinary).
STORAGES = {
    'default': {
        'BACKEND': 'cloudinary_storage.storage.MediaCloudinaryStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# DRF
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'register': '5/hour',
        'login_status': '10/min',
    },
}

# JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
}

# CORS
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://localhost:5174'
).split(',')

# CSRF — necesario para que el admin de Django (/admin) funcione sobre HTTPS
# en dominios distintos a localhost. Usa los mismos dominios que ALLOWED_HOSTS
# pero con el esquema https:// al frente.
CSRF_TRUSTED_ORIGINS = os.getenv(
    'CSRF_TRUSTED_ORIGINS',
    ''
).split(',') if os.getenv('CSRF_TRUSTED_ORIGINS') else [
    f'https://{host}' for host in ALLOWED_HOSTS if host not in ('localhost', '127.0.0.1')
]

# Seguridad para producción — se activan solo cuando DEBUG=False
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True

# Modelo de usuario personalizado
AUTH_USER_MODEL = 'users.User'