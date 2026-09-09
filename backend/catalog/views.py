from rest_framework import viewsets
from rest_framework.exceptions import ValidationError

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.select_related("category").all()
        category = self.request.query_params.get("category")
        search = self.request.query_params.get("search")

        if category:
            try:
                category_id = int(category)
            except ValueError as exc:
                raise ValidationError({"category": "Debe ser un identificador numérico."}) from exc
            queryset = queryset.filter(category_id=category_id)

        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset
