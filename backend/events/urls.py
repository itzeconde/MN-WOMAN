from django.urls import path
from . import views

urlpatterns = [
    path('', views.ListaEventosView.as_view(), name='lista_eventos'),
    path('<int:pk>/', views.DetalleEventoView.as_view(), name='detalle_evento'),
    path('<int:evento_id>/asistencia/', views.ConfirmarAsistenciaView.as_view(), name='confirmar_asistencia'),
    path('<int:evento_id>/mi-asistencia/', views.MiAsistenciaView.as_view(), name='mi_asistencia'),
    path('mis-eventos/', views.MisEventosView.as_view(), name='mis_eventos'),
    path('public/', views.EventoPublicListView.as_view()),

    # Admin
    path('admin/crear/', views.AdminEventoCreateView.as_view(), name='admin_crear_evento'),
    path('admin/<int:pk>/editar/', views.AdminEventoUpdateView.as_view(), name='admin_editar_evento'),
    path('admin/<int:evento_id>/asistentes/', views.AdminAsistentesView.as_view(), name='admin_asistentes'),
]