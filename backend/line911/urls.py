from django.urls import path
from . import views

urlpatterns = [
    path('instituciones/', views.ListaInstitucionesView.as_view(), name='lista_instituciones'),
    path('solicitar/', views.SolicitarApoyoView.as_view(), name='solicitar_apoyo'),
    path('public/', views.InstitucionPublicListView.as_view()),
]