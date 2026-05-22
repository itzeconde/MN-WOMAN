from django.urls import path
from . import views

urlpatterns = [
    path('', views.ListaServiciosView.as_view(), name='lista_servicios'),
    path('publicar/', views.PublicarServicioView.as_view(), name='publicar_servicio'),
    path('mis-servicios/', views.MisServiciosView.as_view(), name='mis_servicios'),
    path('<int:pk>/', views.DetalleServicioView.as_view(), name='detalle_servicio'),
]