# Backend del catálogo

API REST para el catálogo de productos, implementada con Django, Django REST
Framework y SQLite.

## Ejecución local

Desde esta carpeta:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

La API queda disponible en `http://127.0.0.1:8000/`. Se permiten solicitudes
desde un frontend local en `http://localhost:3000` y `http://127.0.0.1:3000`.

## Endpoints

- `GET /api/categories/`: lista las categorías disponibles.
- `GET /api/products/`: lista productos.
- `POST /api/products/`: crea un producto.
- `GET /api/products/{id}/`: consulta un producto.
- `PUT` o `PATCH /api/products/{id}/`: edita un producto.
- `DELETE /api/products/{id}/`: elimina un producto.
- `GET /api/products/?category={id}`: filtra por categoría.
- `GET /api/products/?search={texto}`: busca por nombre, sin distinguir mayúsculas.

Un producto recibe `name`, `description` (opcional), `price`, `stock` y
`category` (ID existente). `price` y `stock` deben ser valores no negativos.

## Validación

```bash
python manage.py check
python manage.py migrate
python manage.py test
```
