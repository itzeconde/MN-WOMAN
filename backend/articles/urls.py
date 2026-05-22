from django.urls import path
from . import views

urlpatterns = [
    # Usuarias — solo lectura con filtro por categoría
    path('articles/', views.ArticleListView.as_view(), name='article-list'),

    # Admin — CRUD
    path('admin/articles/', views.ArticleAdminListCreateView.as_view(), name='admin-article-list'),
    path('admin/articles/<int:pk>/', views.ArticleAdminDetailView.as_view(), name='admin-article-detail'),
    path('articles/public/', views.ArticlePublicListView.as_view()),
]