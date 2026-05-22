from django.urls import path
from . import views

urlpatterns = [
    path('', views.ListaCursosView.as_view(), name='lista_cursos'),
    path('<int:pk>/', views.DetalleCursoView.as_view(), name='detalle_curso'),
    path('<int:pk>/inscribirse/', views.InscribirseView.as_view(), name='inscribirse'),
    path('mis-cursos/', views.MisCursosView.as_view(), name='mis_cursos'),
    path('public/', views.CursoPublicListView.as_view()),
]