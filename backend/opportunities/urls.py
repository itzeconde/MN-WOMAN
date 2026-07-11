from django.urls import path
from . import views

urlpatterns = [
    path('', views.ListaOportunidadesView.as_view(), name='lista_oportunidades'),
    path('publicar/', views.PublicarOportunidadView.as_view(), name='publicar_oportunidad'),
    path('mis-oportunidades/', views.MisOportunidadesView.as_view(), name='mis_oportunidades'),
    path('mis-postulaciones/', views.MisPostulacionesView.as_view(), name='mis_postulaciones'),
    path('<int:pk>/', views.DetalleOportunidadView.as_view(), name='detalle_oportunidad'),
    path('<int:pk>/cerrar/', views.CerrarOportunidadView.as_view(), name='cerrar_oportunidad'),
    path('<int:pk>/postularse/', views.PostularseView.as_view(), name='postularse'),
    path('<int:pk>/postulaciones/', views.PostulacionesRecibidasView.as_view(), name='postulaciones_recibidas'),
]