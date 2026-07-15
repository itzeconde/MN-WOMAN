import { useState, useEffect, useRef } from "react";
import React from "react";

const API_BASE = "http://127.0.0.1:8000/api";

const CATEGORIES = [
  { value: "recetas", label: "Recetas" },
  { value: "bienestar", label: "Bienestar" },
  { value: "negocios", label: "Consejos de Negocios" },
  { value: "vida_familia", label: "Vida y Familia" },
  { value: "tendencias", label: "Tendencias" },
];

function getToken(): string | null {
  return localStorage.getItem("access_token");
}

interface Article {
  id: number;
  title: string;
  slug: string;
  cover_image_url: string | null;
  external_url: string;
  category: string;
  category_display: string;
  is_featured: boolean;
  is_active: boolean;
  order: number;
  created_at: string;
}

interface FormState {
  title: string;
  external_url: string;
  category: string;
  is_featured: boolean;
  is_active: boolean;
  order: number;
  cover_image: File | null;
}

const emptyForm: FormState = {
  title: "",
  external_url: "",
  category: "",
  is_featured: false,
  is_active: true,
  order: 0,
  cover_image: null,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  color: "#111827",
  background: "white",
  outline: "none",
  boxSizing: "border-box",
};

export default function AdminArticulos() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/articles/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data: Article[] = await res.json();
      setArticles(data);
    } catch {
      setError("No se pudieron cargar los artículos.");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(article: Article) {
    setEditingId(article.id);
    setForm({
      title: article.title,
      external_url: article.external_url,
      category: article.category,
      is_featured: article.is_featured,
      is_active: article.is_active,
      order: article.order,
      cover_image: null,
    });
    setPreviewUrl(article.cover_image_url ?? null);
    setShowForm(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleNew() {
    setEditingId(null);
    setForm(emptyForm);
    setPreviewUrl(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setPreviewUrl(null);
    setError("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, cover_image: file }));
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title || !form.external_url || !form.category) {
      setError("Título, URL y categoría son obligatorios.");
      return;
    }
    if (!editingId && !form.cover_image) {
      setError("La imagen de portada es obligatoria.");
      return;
    }

    setSaving(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("external_url", form.external_url);
    fd.append("category", form.category);
    fd.append("is_featured", String(form.is_featured));
    fd.append("is_active", String(form.is_active));
    fd.append("order", String(form.order));
    if (form.cover_image) fd.append("cover_image", form.cover_image);

    try {
      const url = editingId
        ? `${API_BASE}/admin/articles/${editingId}/`
        : `${API_BASE}/admin/articles/`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        setError(JSON.stringify(err));
        return;
      }

      setSuccess(editingId ? "Artículo actualizado." : "Artículo creado.");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setPreviewUrl(null);
      fetchArticles();
    } catch {
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("¿Eliminar este artículo? Esta acción no se puede deshacer.")) return;
    setDeleting(id);
    try {
      await fetch(`${API_BASE}/admin/articles/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setSuccess("Artículo eliminado.");
    } catch {
      setError("No se pudo eliminar.");
    } finally {
      setDeleting(null);
    }
  }

  async function toggleActive(article: Article) {
    try {
      const fd = new FormData();
      fd.append("is_active", String(!article.is_active));
      const res = await fetch(`${API_BASE}/admin/articles/${article.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (res.ok) {
        setArticles((prev) =>
          prev.map((a) => (a.id === article.id ? { ...a, is_active: !a.is_active } : a))
        );
      }
    } catch {
      setError("No se pudo actualizar.");
    }
  }

  const categoryLabel = (val: string): string =>
    CATEGORIES.find((c) => c.value === val)?.label ?? val;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #f3f4f6", padding: "24px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>
            📝 Gestión de Artículos
          </h1>
          <p style={{ color: "#6b7280", fontSize: "13px", margin: "4px 0 0" }}>
            {articles.length} artículos en total
          </p>
        </div>
        {!showForm && (
          <button
            onClick={handleNew}
            style={{
              background: "#B66878", color: "white", border: "none", borderRadius: "10px",
              padding: "10px 20px", fontWeight: "600", fontSize: "14px", cursor: "pointer",
            }}
          >
            + Nuevo Artículo
          </button>
        )}
      </div>

      <div style={{ padding: "32px 40px", maxWidth: "1100px", margin: "0 auto" }}>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "14px" }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "14px" }}>
            ✅ {success}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "32px", marginBottom: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#111827", marginBottom: "24px" }}>
              {editingId ? "Editar Artículo" : "Nuevo Artículo"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Título del artículo *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Ej. Tendencias de IA para Emprendedoras 2025"
                    style={inputStyle}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>URL del artículo en la revista *</label>
                  <input
                    value={form.external_url}
                    onChange={(e) => setForm((f) => ({ ...f, external_url: e.target.value }))}
                    placeholder="https://revista.com/articulo"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Categoría *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="">Selecciona una categoría</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Orden de aparición</label>
                  <input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                    style={inputStyle}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Imagen de portada {!editingId && "*"}</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: "2px dashed #d1d5db", borderRadius: "12px", padding: "20px",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: "16px",
                      background: "#fafafa",
                    }}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="preview" style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "8px" }} />
                    ) : (
                      <div style={{ width: "80px", height: "60px", background: "#f3f4f6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>🖼️</div>
                    )}
                    <div>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                        {previewUrl ? "Cambiar imagen" : "Seleccionar imagen"}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#9ca3af" }}>
                        JPG, PNG o WebP. Recomendado: 800×500px
                      </p>
                    </div>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", color: "#374151" }}>
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                      style={{ accentColor: "#B66878", width: "16px", height: "16px" }}
                    />
                    Artículo destacado
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", color: "#374151" }}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                      style={{ accentColor: "#B66878", width: "16px", height: "16px" }}
                    />
                    Activo (visible para usuarias)
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "28px", borderTop: "1px solid #f3f4f6", paddingTop: "20px" }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{ background: "white", color: "#374151", border: "1px solid #d1d5db", borderRadius: "10px", padding: "10px 20px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ background: saving ? "#D49BA7" : "#B66878", color: "white", border: "none", borderRadius: "10px", padding: "10px 24px", fontWeight: "600", fontSize: "14px", cursor: saving ? "not-allowed" : "pointer" }}
                >
                  {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Publicar artículo"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla */}
        {!showForm && (
          loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>Cargando artículos...</div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "16px", border: "1px solid #e5e7eb" }}>
              <p style={{ fontSize: "40px", margin: "0 0 12px" }}>📝</p>
              <p style={{ color: "#6b7280", fontSize: "15px" }}>Aún no hay artículos. ¡Crea el primero!</p>
            </div>
          ) : (
            <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                    {["Artículo", "Categoría", "Orden", "Estado", "Acciones"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article, i) => (
                    <tr
                      key={article.id}
                      style={{ borderBottom: i < articles.length - 1 ? "1px solid #f3f4f6" : "none" }}
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {article.cover_image_url ? (
                            <img src={article.cover_image_url} alt={article.title} style={{ width: "52px", height: "38px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: "52px", height: "38px", background: "#f3f4f6", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>🖼️</div>
                          )}
                          <div>
                            <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#111827" }}>{article.title}</p>
                            {article.is_featured && (
                              <span style={{ fontSize: "11px", background: "#fef3c7", color: "#d97706", padding: "1px 6px", borderRadius: "4px", fontWeight: "600" }}>⭐ Destacado</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "12px", background: "#FDF0F2", color: "#B66878", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>
                          {categoryLabel(article.category)}
                        </span>
                      </td>

                      <td style={{ padding: "14px 16px", fontSize: "14px", color: "#6b7280", textAlign: "center" }}>
                        {article.order}
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <button
                          onClick={() => toggleActive(article)}
                          style={{
                            background: article.is_active ? "#f0fdf4" : "#fef2f2",
                            color: article.is_active ? "#16a34a" : "#dc2626",
                            border: `1px solid ${article.is_active ? "#bbf7d0" : "#fecaca"}`,
                            borderRadius: "20px", padding: "3px 12px", fontSize: "12px",
                            fontWeight: "600", cursor: "pointer",
                          }}
                        >
                          {article.is_active ? "● Activo" : "● Inactivo"}
                        </button>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <a
                            href={article.external_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: "13px", color: "#B66878", fontWeight: "600", textDecoration: "none", padding: "5px 10px", borderRadius: "6px", border: "1px solid #FDF0F2" }}
                          >
                            Ver →
                          </a>
                          <button
                            onClick={() => handleEdit(article)}
                            style={{ fontSize: "13px", color: "#374151", fontWeight: "600", background: "white", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "5px 10px", cursor: "pointer" }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            disabled={deleting === article.id}
                            style={{ fontSize: "13px", color: "#dc2626", fontWeight: "600", background: "white", border: "1px solid #fecaca", borderRadius: "6px", padding: "5px 10px", cursor: "pointer" }}
                          >
                            {deleting === article.id ? "..." : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}