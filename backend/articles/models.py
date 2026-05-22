from django.db import models
from django.utils.text import slugify


class Article(models.Model):

    CATEGORIES = (
        ('recetas', 'Recetas'),
        ('bienestar', 'Bienestar'),
        ('negocios', 'Consejos de Negocios'),
        ('vida_familia', 'Vida y Familia'),
        ('tendencias', 'Tendencias'),
    )

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    cover_image = models.ImageField(upload_to='articles/covers/')
    external_url = models.URLField(help_text='Link directo al artículo en la revista')
    category = models.CharField(max_length=50, choices=CATEGORIES)
    is_featured = models.BooleanField(default=False, help_text='Aparece como artículo destacado grande')
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0, help_text='Orden de aparición, menor = primero')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = 'Artículo'
        verbose_name_plural = 'Artículos'

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Article.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        # Solo puede haber un artículo destacado a la vez
        if self.is_featured:
            Article.objects.filter(is_featured=True).exclude(pk=self.pk).update(is_featured=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title