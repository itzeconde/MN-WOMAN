from rest_framework import serializers
from .models import Article


class ArticleSerializer(serializers.ModelSerializer):
    cover_image_url = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'cover_image', 'cover_image_url',
            'external_url', 'category', 'category_display',
            'is_featured', 'is_active', 'order', 'created_at',
        ]
        read_only_fields = ['slug', 'created_at']

    def get_cover_image_url(self, obj):
        request = self.context.get('request')
        if obj.cover_image and request:
            return request.build_absolute_uri(obj.cover_image.url)
        return None