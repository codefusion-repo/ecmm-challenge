"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
};

function formatApiError(data) {
  if (!data || typeof data !== "object") {
    return "No fue posible crear el producto. Intenta nuevamente.";
  }

  return Object.entries(data)
    .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(" ") : messages}`)
    .join(" ");
}

export default function CatalogPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "" });
  const [productForm, setProductForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = useCallback(async (currentFilters) => {
    setLoading(true);
    setListError("");

    const query = new URLSearchParams();
    if (currentFilters.search.trim()) query.set("search", currentFilters.search.trim());
    if (currentFilters.category) query.set("category", currentFilters.category);

    try {
      const response = await fetch(`${API_URL}/products/${query.size ? `?${query}` : ""}`);
      if (!response.ok) throw new Error("No se pudo obtener el catálogo.");
      setProducts(await response.json());
    } catch (error) {
      setListError(error.message || "No se pudo obtener el catálogo.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadCategories() {
      setCategoriesLoading(true);
      try {
        const response = await fetch(`${API_URL}/categories/`);
        if (!response.ok) throw new Error("No se pudieron obtener las categorías.");
        setCategories(await response.json());
      } catch (error) {
        setListError(error.message || "No se pudieron obtener las categorías.");
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    const debounceId = setTimeout(() => {
      loadProducts(filters);
    }, 250);

    return () => clearTimeout(debounceId);
  }, [filters, loadProducts]);

  function categoryName(categoryId) {
    return categories.find((category) => category.id === categoryId)?.name || `Categoría #${categoryId}`;
  }

  async function createProduct(event) {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const response = await fetch(`${API_URL}/products/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productForm,
          price: Number(productForm.price),
          stock: Number(productForm.stock),
          category: Number(productForm.category),
        }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(formatApiError(data));

      setProductForm(emptyProduct);
      setFormSuccess(`“${data.name}” fue agregado al catálogo.`);
      await loadProducts(filters);
    } catch (error) {
      setFormError(error.message || "No fue posible crear el producto.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <header className="hero">
        <p className="eyebrow">Catálogo</p>
        <h1>Productos disponibles</h1>
        <p>Consulta el inventario y agrega nuevos productos desde una sola vista.</p>
      </header>

      <section className="panel" aria-labelledby="filters-title">
        <h2 id="filters-title">Buscar y filtrar</h2>
        <div className="filters">
          <label>
            Buscar por nombre
            <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Ej. cafetera" />
          </label>
          <label>
            Categoría
            <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} disabled={categoriesLoading}>
              <option value="">Todas las categorías</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section aria-labelledby="products-title">
        <div className="section-heading">
          <h2 id="products-title">Listado de productos</h2>
          {!loading && !listError && <span>{products.length} resultado{products.length === 1 ? "" : "s"}</span>}
        </div>
        {loading && <p className="status" role="status">Cargando productos…</p>}
        {listError && <p className="status error" role="alert">{listError}</p>}
        {!loading && !listError && products.length === 0 && <p className="status">No hay productos que coincidan con la búsqueda.</p>}
        {!loading && !listError && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <span className="tag">{categoryName(product.category)}</span>
                <h3>{product.name}</h3>
                <p>{product.description || "Sin descripción."}</p>
                <dl>
                  <div><dt>Precio</dt><dd>${Number(product.price).toLocaleString("es-CL", { minimumFractionDigits: 2 })}</dd></div>
                  <div><dt>Stock</dt><dd>{product.stock} unidades</dd></div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel form-panel" aria-labelledby="form-title">
        <h2 id="form-title">Agregar producto</h2>
        <form className="product-form" onSubmit={createProduct}>
          <label>
            Nombre
            <input required value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} />
          </label>
          <label>
            Descripción
            <textarea value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} rows="3" />
          </label>
          <div className="form-row">
            <label>
              Precio
              <input required min="0" step="0.01" type="number" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} />
            </label>
            <label>
              Stock
              <input required min="0" step="1" type="number" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} />
            </label>
          </div>
          <label>
            Categoría
            <select required value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} disabled={categoriesLoading}>
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          {formError && <p className="form-message error" role="alert">{formError}</p>}
          {formSuccess && <p className="form-message success" role="status">{formSuccess}</p>}
          <button type="submit" disabled={submitting || categoriesLoading}>{submitting ? "Guardando…" : "Crear producto"}</button>
        </form>
      </section>
    </main>
  );
}
