from decimal import Decimal

from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Product


class ProductApiTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Bebidas")
        self.other_category = Category.objects.create(name="Snacks")

    def product_payload(self, **overrides):
        payload = {
            "name": "Café molido",
            "description": "Bolsa de 250 gramos",
            "price": "4990.00",
            "stock": 12,
            "category": self.category.id,
        }
        payload.update(overrides)
        return payload

    def test_creates_a_valid_product(self):
        response = self.client.post("/api/products/", self.product_payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Café molido")
        self.assertEqual(response.data["category"], self.category.id)
        self.assertTrue(Product.objects.filter(name="Café molido").exists())

    def test_rejects_invalid_product_data(self):
        response = self.client.post(
            "/api/products/",
            self.product_payload(name="", price="-1.00", stock=-1, category=99999),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)
        self.assertIn("price", response.data)
        self.assertIn("stock", response.data)
        self.assertIn("category", response.data)

    def test_lists_retrieves_updates_and_deletes_products(self):
        product = Product.objects.create(
            name="Té verde",
            description="Caja de 20 bolsitas",
            price=Decimal("2990.00"),
            stock=8,
            category=self.category,
        )

        list_response = self.client.get("/api/products/")
        detail_response = self.client.get(f"/api/products/{product.id}/")
        update_response = self.client.patch(
            f"/api/products/{product.id}/", {"stock": 3}, format="json"
        )
        delete_response = self.client.delete(f"/api/products/{product.id}/")

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["id"], product.id)
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["stock"], 3)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(id=product.id).exists())

    def test_filters_by_category_and_searches_by_name(self):
        Product.objects.create(
            name="Cafe instantaneo",
            description="Frasco",
            price=Decimal("3990.00"),
            stock=4,
            category=self.category,
        )
        Product.objects.create(
            name="Galletas",
            description="Avena",
            price=Decimal("1990.00"),
            stock=10,
            category=self.other_category,
        )

        category_response = self.client.get(f"/api/products/?category={self.category.id}")
        search_response = self.client.get("/api/products/?search=CAFE")

        self.assertEqual(category_response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["name"] for item in category_response.data], ["Cafe instantaneo"])
        self.assertEqual(search_response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["name"] for item in search_response.data], ["Cafe instantaneo"])

    def test_lists_categories_and_rejects_a_non_numeric_category_filter(self):
        categories_response = self.client.get("/api/categories/")
        invalid_filter_response = self.client.get("/api/products/?category=not-a-number")

        self.assertEqual(categories_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [item["name"] for item in categories_response.data], ["Bebidas", "Snacks"]
        )
        self.assertEqual(invalid_filter_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            invalid_filter_response.data["category"], "Debe ser un identificador numérico."
        )

    def test_category_name_is_unique(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Category.objects.create(name="Bebidas")
