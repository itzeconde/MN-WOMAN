from django.urls import path
from . import views

urlpatterns = [
    path('', views.ListaServiciosView.as_view()),
    path('publicar/', views.PublicarServicioView.as_view()),
    path('mis-servicios/', views.MisServiciosView.as_view()),
    path('categorias/', views.CategoriasServiciosView.as_view()),
    path('<int:pk>/editar/', views.ActualizarServicioView.as_view()),
    path('<int:pk>/toggle-activo/', views.ToggleActivoServicioView.as_view()),
    path('<int:pk>/', views.DetalleServicioView.as_view()),
]