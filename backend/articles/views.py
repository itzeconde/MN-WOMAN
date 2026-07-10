from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Article
from .serializers import ArticleSerializer


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or request.user.role == 'administrador'
        )


class ArticleListView(generics.ListAPIView):
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Article.objects.filter(is_active=True)
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs


class ArticleAdminListCreateView(generics.ListCreateAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]


class ArticleAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]


# Sin login — para la landing page
class ArticlePublicListView(generics.ListAPIView):
    serializer_class = ArticleSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):                              # ← cambio aquí
        qs = Article.objects.filter(is_active=True)
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs