import { useState, useEffect, useRef, useMemo } from "react";
import api from "../../api/axios";
import { paginacionBotonStyle, COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE } from "../../styles/tokens";
import {
  Search, Plus, Newspaper, Pencil, Trash2, X, Check,
  ExternalLink, Star, ChevronLeft, ChevronRight, ImagePlus, AlertCircle,
} from "lucide-react";

const CATEGORIES = [
  { value: "recetas", label: "Recetas" },
  { value: "bienestar", label: "Bienestar" },
  { value: "negocios", label: "Consejos de Negocios" },
  { value: "vida_familia", label: "Vida y Familia" },
  { value: "tendencias", label: "Tendencias" },
];

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

const COLOR_TEXTO_SUAVE = "#9ca3af";

const ARTICULOS_POR_PAGINA = 6;

export default function AdminArticulos() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const [saving, setSaving] = useState<boolean>(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchArticles();
  }, []);
  useEffect(() => { setPagina(1); }, [busqueda]);

  async function fetchArticles() {
    setLoading(true);
    setErrorCarga(false);
    try {
      const { data } = await api.get("/admin/articles/");
      setArticles(data);
    } catch {
      setErrorCarga(true);
    } finally {
      setLoading(false);
    }
  }

  // ── Búsqueda y paginación ──
  const articulosFiltrados = articles.filter((a) =>
    busqueda === "" ||
    a.title.toLowerCase().includes(busqueda.toLowerCase()) ||
    categoryLabel(a.category).toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.max(1, Math.ceil(articulosFiltrados.length / ARTICULOS_POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const articulosPagina = articulosFiltrados.slice(
    (paginaSegura - 1) * ARTICULOS_POR_PAGINA,
    paginaSegura * ARTICULOS_POR_PAGINA
  );

  const numerosPagina = useMemo(() => {
    if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    const nums = new Set([1, 2, totalPaginas - 1, totalPaginas, paginaSegura - 1, paginaSegura, paginaSegura + 1]);
    return Array.from(nums).filter((n) => n >= 1 && n <= totalPaginas).sort((a, b) => a - b);
  }, [totalPaginas, paginaSegura]);

  function categoryLabel(val: string): string {
    return CATEGORIES.find((c) => c.value === val)?.label ?? val;
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
    setErroresForm({});
    setModalAbierto(true);
  }

  function handleNew() {
    setEditingId(null);
    setForm(emptyForm);
    setPreviewUrl(null);
    setErroresForm({});
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (saving) return;
    setModalAbierto(false);
    setEditingId(null);
    setForm(emptyForm);
    setPreviewUrl(null);
    setErroresForm({});
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setErroresForm((prev) => ({ ...prev, cover_image: "La imagen no puede superar 3MB." }));
      return;
    }
    setErroresForm((prev) => { const s = { ...prev }; delete s.cover_image; return s; });
    setForm((f) => ({ ...f, cover_image: file }));
    setPreviewUrl(URL.createObjectURL(file));
  }

  function validar(): boolean {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "El título es obligatorio.";
    if (!form.external_url.trim()) errs.external_url = "La URL es obligatoria.";
    else if (!/^https?:\/\/.+/.test(form.external_url.trim())) errs.external_url = "El link debe empezar con http:// o https://";
    if (!form.category) errs.category = "Selecciona una categoría.";
    if (!editingId && !form.cover_image) errs.cover_image = "La imagen de portada es obligatoria.";
    setErroresForm(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validar()) return;

    setSaving(true);
    const fd = new FormData();
    fd.append("title", form.title.trim());
    fd.append("external_url", form.external_url.trim());
    fd.append("category", form.category);
    fd.append("is_featured", String(form.is_featured));
    fd.append("is_active", String(form.is_active));
    fd.append("order", String(form.order));
    if (form.cover_image) fd.append("cover_image", form.cover_image);

    try {
      if (editingId) {
        await api.patch(`/admin/articles/${editingId}/`, fd);
      } else {
        await api.post("/admin/articles/", fd);
      }
      cerrarModal();
      fetchArticles();
    } catch (err: any) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const errs: Record<string, string> = {};
        for (const [campo, msgs] of Object.entries(data)) {
          errs[campo] = Array.isArray(msgs) ? String(msgs[0]) : String(msgs);
        }
        setErroresForm(Object.keys(errs).length ? errs : { general: "Error al guardar. Intenta de nuevo." });
      } else {
        setErroresForm({ general: "Error de conexión con el servidor." });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, title: string) {
    if (!window.confirm(`¿Eliminar el artículo "${title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/admin/articles/${id}/`);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("No se pudo eliminar el artículo. Intenta de nuevo.");
    }
  }

  async function toggleActive(article: Article) {
    try {
      const fd = new FormData();
      fd.append("is_active", String(!article.is_active));
      await api.patch(`/admin/articles/${article.id}/`, fd);
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, is_active: !a.is_active } : a))
      );
    } catch {
      alert("No se pudo actualizar el estado.");
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #e5e7eb', fontSize: '14px',
    boxSizing: 'border-box' as const, outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle = {
    fontSize: '13px', fontWeight: '600' as const, color: '#374151',
    marginBottom: '4px', display: 'block' as const,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>

      {/* ENCABEZADO */}
      <div style={{ background: "linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)", borderBottom: `1px solid ${COLOR_BORDE}` }}>
        <div style={{
          maxWidth: "1000px", margin: "0 auto", padding: "40px 20px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap",
        }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1.25 }}>
              Gestión de <span style={{ color: COLOR_MARCA }}>Artículos</span>
            </h1>
            <p style={{ fontSize: "15px", color: "#6b7280", margin: "8px 0 0" }}>
              Publica y administra los artículos de la revista.
            </p>
          </div>
          <button onClick={handleNew} style={{
            background: COLOR_MARCA, color: 'white', padding: '12px 22px',
            borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px',
            display: 'inline-flex', alignItems: 'center', gap: '8px', flexShrink: 0,
          }}>
            <Plus size={16} /> Nuevo artículo
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 20px 40px" }}>

        {errorCarga && (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px", fontSize: "13px",
            color: "#dc2626", background: "#fef2f2", border: "1px solid #fee2e2",
            borderRadius: "10px", padding: "12px 16px", marginBottom: "16px",
          }}>
            <AlertCircle size={16} />
            No se pudieron cargar los artículos.
            <button onClick={fetchArticles} style={{ textDecoration: "underline", background: "none", border: "none", color: "#dc2626", cursor: "pointer", marginLeft: "4px" }}>
              Reintentar
            </button>
          </div>
        )}

        {/* BUSCADOR */}
        {!loading && !errorCarga && articles.length > 0 && (
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              aria-label="Buscar artículos"
              placeholder="Buscar por título o categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%', padding: '13px 14px 13px 40px', borderRadius: '12px',
                border: `1px solid ${COLOR_BORDE}`, fontSize: '14px',
                boxSizing: 'border-box' as const, outline: 'none', background: 'white',
              }}
            />
          </div>
        )}

        {loading ? (
          <p style={{ color: '#6b7280' }}>Cargando...</p>
        ) : articles.length === 0 && !errorCarga ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            textAlign: 'center', padding: '80px 24px', background: 'white',
            borderRadius: '16px', border: `1px solid ${COLOR_BORDE}`,
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: '#fdf2f4', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Newspaper size={22} color={COLOR_MARCA} />
            </div>
            <p style={{ color: '#6b7280', margin: 0 }}>Aún no hay artículos. ¡Crea el primero!</p>
          </div>
        ) : articulosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>No hay artículos que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {articulosPagina.map((article) => (
                <div key={article.id} style={{
                  background: 'white', borderRadius: '14px', padding: '20px 24px',
                  border: `1px solid ${COLOR_BORDE}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                }}>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '10px', flexShrink: 0,
                    background: article.cover_image_url ? 'none' : `linear-gradient(135deg, ${COLOR_MARCA_CLARO}, ${COLOR_MARCA})`,
                    overflow: 'hidden'
                  }}>
                    {article.cover_image_url
                      ? <img src={article.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Newspaper size={22} color="white" />
                        </div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{
                        background: '#FDF0F2', color: COLOR_MARCA,
                        fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px',
                      }}>
                        {categoryLabel(article.category)}
                      </span>
                      {article.is_featured && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: '#fef3c7', color: '#d97706',
                          fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px',
                        }}>
                          <Star size={11} /> Destacado
                        </span>
                      )}
                    </div>
                    <p style={{ fontWeight: '700', color: '#111827', fontSize: '15px', margin: '0 0 4px 0' }}>{article.title}</p>
                    <p style={{
                      display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                      fontSize: '13px', color: '#6b7280', margin: 0,
                    }}>
                      <span>Orden: {article.order}</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' as const, justifyContent: 'flex-end' }}>
                    <button onClick={() => toggleActive(article)} style={{
                      background: article.is_active ? '#f0fdf4' : '#f3f4f6',
                      color: article.is_active ? '#16a34a' : '#6b7280',
                      border: 'none', borderRadius: '20px', padding: '6px 12px',
                      fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                    }}>
                      {article.is_active ? '● Activo' : '● Inactivo'}
                    </button>
                    <a href={article.external_url} target="_blank" rel="noopener noreferrer" style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '8px', border: '1px solid #e0e7ff',
                      background: '#eef2ff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#6366f1',
                      textDecoration: 'none',
                    }}><ExternalLink size={13} /> Ver</a>
                    <button onClick={() => handleEdit(article)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb',
                      background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#374151'
                    }}><Pencil size={13} /> Editar</button>
                    <button onClick={() => handleDelete(article.id, article.title)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '8px', border: '1px solid #fee2e2',
                      background: '#fff5f5', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#ef4444'
                    }}><Trash2 size={13} /> Eliminar</button>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINACION */}
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '28px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={paginaSegura === 1}
                  style={paginacionBotonStyle(false, paginaSegura === 1)}
                >
                  <ChevronLeft size={14} />
                </button>

                {numerosPagina.map((n, i) => {
                  const anterior = numerosPagina[i - 1];
                  const hayHueco = anterior !== undefined && n - anterior > 1;
                  return (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {hayHueco && <span style={{ color: '#9ca3af', fontSize: '13px' }}>...</span>}
                      <button onClick={() => setPagina(n)} style={paginacionBotonStyle(n === paginaSegura, false)}>
                        {n}
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaSegura === totalPaginas}
                  style={paginacionBotonStyle(false, paginaSegura === totalPaginas)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {modalAbierto && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '32px',
            width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: 0 }}>
                {editingId ? 'Editar artículo' : 'Nuevo artículo'}
              </h2>
              <button onClick={cerrarModal} disabled={saving}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', opacity: saving ? 0.4 : 1 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {erroresForm.general && (
                <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>{erroresForm.general}</p>
              )}

              <div>
                <label style={labelStyle}>Imagen de portada {!editingId && '*'}</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: '2px dashed #e5e7eb', borderRadius: '12px', padding: '16px',
                    textAlign: 'center', cursor: 'pointer', background: '#f9fafb',
                    position: 'relative', overflow: 'hidden',
                    height: previewUrl ? 'auto' : '100px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {previewUrl
                    ? <img src={previewUrl} alt="preview" style={{ maxHeight: '160px', borderRadius: '8px', objectFit: 'cover', width: '100%' }} />
                    : <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '14px', margin: 0 }}>
                        <ImagePlus size={16} /> Haz clic para subir imagen
                      </p>
                  }
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
                {erroresForm.cover_image
                  ? <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>{erroresForm.cover_image}</p>
                  : <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>JPG, PNG o WebP. Recomendado: 800×500px.</p>}
              </div>

              <div>
                <label style={labelStyle}>Título del artículo</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ej. Tendencias de IA para Emprendedoras 2025"
                  style={inputStyle}
                />
                {erroresForm.title && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{erroresForm.title}</p>}
              </div>

              <div>
                <label style={labelStyle}>URL del artículo en la revista</label>
                <input
                  value={form.external_url}
                  onChange={(e) => setForm((f) => ({ ...f, external_url: e.target.value }))}
                  placeholder="https://revista.com/articulo"
                  style={inputStyle}
                />
                {erroresForm.external_url && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{erroresForm.external_url}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Categoría</label>
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
                  {erroresForm.category && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{erroresForm.category}</p>}
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
              </div>

              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                    style={{ accentColor: COLOR_MARCA, width: '16px', height: '16px' }}
                  />
                  Artículo destacado
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    style={{ accentColor: COLOR_MARCA, width: '16px', height: '16px' }}
                  />
                  Activo (visible para usuarias)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button onClick={cerrarModal} disabled={saving} style={{
                  padding: '10px 24px', borderRadius: '10px', border: '1px solid #e5e7eb',
                  background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#374151',
                  opacity: saving ? 0.6 : 1,
                }}>Cancelar</button>
                <button onClick={handleSubmit} disabled={saving} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '10px 24px', borderRadius: '10px', border: 'none',
                  background: COLOR_MARCA, color: 'white', cursor: 'pointer',
                  fontWeight: '700', fontSize: '14px', opacity: saving ? 0.7 : 1,
                }}>
                  {!saving && <Check size={14} />}
                  {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Publicar artículo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}