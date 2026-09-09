from django.urls import include, path
from rest_framework.routers import DefaultRouter

from catalog.views import CategoryListView, ProductViewSet


router = DefaultRouter()
router.register("products", ProductViewSet, basename="product")

urlpatterns = [
    path("api/categories/", CategoryListView.as_view(), name="category-list"),
    path("api/", include(router.urls)),
]
