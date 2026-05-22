from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/cursos/', include('courses.urls')),
    path('api/eventos/', include('events.urls')),
    path('api/oportunidades/', include('opportunities.urls')),
    path('api/servicios/', include('services.urls')),
    path('api/linea911/', include('line911.urls')),
    path('api/', include('articles.urls')),  # ← esta línea
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)