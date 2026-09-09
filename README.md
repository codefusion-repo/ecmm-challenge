# Prueba técnica Junior Fullstack

Construye una aplicación sencilla para administrar un catálogo de productos. La
solución debe incluir una API REST en Django y una interfaz web que la consuma.

**Tiempo estimado de desarrollo:** 90 minutos.

Este tiempo es una referencia para dimensionar el alcance y no un límite de
ejecución. Se recomienda priorizar una solución simple, funcional y clara.

## Alcance

### API

La API debe permitir:

- Listar productos y consultar uno por su ID.
- Crear, editar y eliminar productos.
- Filtrar productos por categoría.
- Buscar productos por nombre.

Una **categoría** debe contener:
- nombre


Un **producto** debe contener:
- nombre
- descripción
- precio
- stock
- categoría
- fecha de creación

### Interfaz web

La interfaz debe permitir, como mínimo:

- Visualizar el listado de productos.
- Crear un producto mediante un formulario.
- Filtrar o buscar productos.

Puedes utilizar Next.js u otro framework basado en React. La elección queda a tu
criterio y debe ser adecuada al alcance de la solución.

## Reglas

- El backend debe utilizar Django y Django REST Framework.
- La base de datos debe ser SQLite.
- El nombre de cada categoría debe ser único.
- Nombre, precio, stock y categoría son obligatorios.
- El precio debe ser mayor o igual a cero.
- El stock debe ser un entero mayor o igual a cero.
- La categoría asociada debe existir.
- Los errores de validación deben devolver una respuesta HTTP apropiada y comprensible.

No se requiere autenticación, carrito de compras, órdenes, pagos ni despliegue.

## Entregables

- API e interfaz web funcionales.
- Migraciones de base de datos.
- Al menos dos pruebas automatizadas: creación correcta de un producto y rechazo
  de datos inválidos.
- Instrucciones completas para ejecutar el proyecto.

La organización de endpoints y la elección de herramientas adicionales quedan a
criterio del postulante.

## Uso de herramientas de IA

Puedes utilizar herramientas de IA como apoyo. Si lo haces, indícalo brevemente
en tus anotaciones junto con el propósito para el que las utilizaste. Debes
comprender todo el código presentado; estas herramientas no reemplazan el dominio
de la solución.

## Proceso de entrega

Realiza un fork de este repositorio y desarrolla allí tu solución. Al finalizar,
comparte el enlace público al fork según las instrucciones recibidas.

El plazo para enviar la solución es de **cinco días corridos** desde la recepción
de la prueba. Una vez vencido ese plazo, no se recibirán nuevas entregas.

## Criterios de evaluación

- Cumplimiento de los requisitos y funcionamiento de los endpoints.
- Uso adecuado de modelos, serializers y vistas.
- Integración entre la interfaz y la API.
- Elección de herramientas acorde con el alcance solicitado.
- Claridad, organización y comprensión del código.
- Calidad de las validaciones, pruebas y documentación.

---

## Anotaciones del postulante

### Instrucciones de ejecución

Requisitos: Python 3.10+ y Node.js 20+.

#### Configuración local del backend

La configuración de Django se toma de variables de entorno. Desde un checkout
limpio, crea tu archivo local no versionado y genera una clave aleatoria:

```bash
cd backend
cp .env.example .env
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Reemplaza el valor de `DJANGO_SECRET_KEY` en `backend/.env` por el valor generado
y carga las variables en la terminal antes de ejecutar Django:

```bash
set -a
. ./.env
set +a
```

`backend/.env.example` documenta todas las variables disponibles:

- `DJANGO_SECRET_KEY`: obligatoria; genera un valor aleatorio local y no lo
  compartas ni lo versiones.
- `DJANGO_DEBUG`: acepta `true`/`false` (también `1`/`0`); el valor local
  documentado es `True`.
- `DJANGO_ALLOWED_HOSTS`: lista separada por comas para Django.
- `DJANGO_CORS_ALLOWED_ORIGINS`: orígenes separados por comas permitidos para
  el frontend.

El proyecto no carga archivos `.env` automáticamente: se usa la shell para
mantener la configuración simple y evitar una dependencia adicional. Si no se
proporciona `DJANGO_SECRET_KEY`, Django se detiene con un error explícito. Hosts
y CORS tienen defaults restringidos a los puertos locales documentados y pueden
sobrescribirse mediante las variables anteriores.

En una terminal, inicia la API desde `backend/` una vez cargado el entorno:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata sample_data  # opcional: carga categorías y productos de ejemplo
python manage.py runserver
```

La API queda disponible en `http://127.0.0.1:8000/api/`. Para comprobarla o
correr su suite de pruebas, mantén las variables cargadas y desde `backend/`
ejecuta:

```bash
python manage.py check
python manage.py test
```

En una segunda terminal, inicia el frontend:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

El catálogo estará disponible en `http://localhost:3000`. `NEXT_PUBLIC_API_URL`
en `frontend/.env.local` permite apuntar el frontend a otra instancia de la API;
debe incluir el prefijo `/api` y no una barra final. Para verificar el build de
producción del frontend, ejecuta `npm run build` desde `frontend/`.

Para la configuración local por defecto, `NEXT_PUBLIC_API_URL` apunta a
`http://127.0.0.1:8000/api`, que está incluido explícitamente en los orígenes
CORS permitidos del backend. Si cambias esa URL, ajusta
`DJANGO_CORS_ALLOWED_ORIGINS` cuando corresponda.

### Decisiones y observaciones

- Se usó Next.js con componentes y estado local de React: el alcance no requiere
  una librería de componentes ni estado global.
- El frontend consulta los endpoints reales de productos y categorías. La
  búsqueda y el filtro se envían como query parameters a la API para conservar
  la lógica de negocio en Django/DRF.
- Tras crear un producto se vuelve a consultar el listado con los filtros activos,
  por lo que el resultado aparece sin recargar la página manualmente.
- Django exige que `DJANGO_SECRET_KEY` llegue desde el entorno; no hay una clave
  real versionada. `DEBUG`, hosts y CORS se pueden ajustar por variables, con
  defaults limitados a la ejecución local documentada.
- Esta configuración es deliberadamente local: no incorpora deployment,
  HTTPS/TLS gestionado, autenticación, secret manager ni hardening de producción.

### Herramientas de IA utilizadas

Se utilizaron ChatGPT y Codex como apoyo acotado. ChatGPT se empleó para
análisis, planificación y revisión; Codex, para implementación y validación.
La organización y trazabilidad del trabajo se apoyaron además en Project-os v2.
El código y las decisiones finales fueron revisados y comprendidos antes de
incorporarlos a la solución.
