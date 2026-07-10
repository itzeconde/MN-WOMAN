import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, BookOpen, Clock, ExternalLink, AlertCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string | null;
  categoria: string;
  nivel: string;
  duracion_horas: number;
  link_externo: string;
  instructor: string;
  activo: boolean;
}

type FormData = Omit<Curso, "id" | "imagen"> & { imagen_file: File | null };

const FORM_INICIAL: FormData = {
  titulo: "",
  descripcion: "",
  imagen_file: null,
  categoria: "otro",
  nivel: "basico",
  duracion_horas: 1,
  link_externo: "",
  instructor: "",
  activo: true,
};

const CATEGORIAS = [
  { value: "sensibilizacion", label: "Formación en Sensibilización" },
  { value: "academico", label: "Programa Académico" },
  { value: "liderazgo", label: "Liderazgo y Negocios" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "finanzas", label: "Finanzas" },
  { value: "marketing", label: "Marketing Digital" },
  { value: "otro", label: "Otro" },
];

const COLOR_PRIMARIO = "#B66878";
const COLOR_PRIMARIO_CLARO = "#fdf2f4";
const COLOR_BORDE = "#f3f4f6";
const COLOR_TEXTO = "#374151";
const COLOR_TEXTO_SUAVE = "#9ca3af";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});

  const fetchCursos = useCallback(async () => {
    setLoading(true);
    setErrorCarga(false);
    try {
      const res = await fetch(`${API_BASE}/admin/cursos/`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCursos(data.results ?? data);
    } catch {
      setErrorCarga(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCursos(); }, [fetchCursos]);

  const abrirCrear = () => {
    setForm(FORM_INICIAL);
    setEditandoId(null);
    setErroresForm({});
    setModalAbierto(true);
  };

  const abrirEditar = (curso: Curso) => {
    setForm({
      titulo: curso.titulo,
      descripcion: curso.descripcion,
      imagen_file: null,
      categoria: curso.categoria,
      nivel: curso.nivel,
      duracion_horas: curso.duracion_horas,
      link_externo: curso.link_externo ?? "",
      instructor: curso.instructor ?? "",
      activo: curso.activo,
    });
    setEditandoId(curso.id);
    setErroresForm({});
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (guardando) return;
    setModalAbierto(false);
    setEditandoId(null);
    setErroresForm({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    if (target.type === "checkbox") {
      setForm((prev) => ({ ...prev, [target.name]: target.checked }));
    } else if (target.type === "file") {
      const file = target.files?.[0] ?? null;
      if (file && file.size > 3 * 1024 * 1024) {
        setErroresForm((prev) => ({ ...prev, imagen: "La imagen no puede superar 3MB." }));
        return;
      }
      setErroresForm((prev) => { const s = { ...prev }; delete s.imagen; return s; });
      setForm((prev) => ({ ...prev, imagen_file: file }));
    } else {
      setForm((prev) => ({ ...prev, [target.name]: target.value }));
    }
  };

  const validar = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.titulo.trim()) errs.titulo = "El título es obligatorio.";
    if (!form.descripcion.trim()) errs.descripcion = "La descripción es obligatoria.";
    if (!form.duracion_horas || form.duracion_horas < 1) errs.duracion_horas = "Mínimo 1 hora.";
    if (form.link_externo && !/^https?:\/\/.+/.test(form.link_externo)) {
      errs.link_externo = "El link debe empezar con http:// o https://";
    }
    setErroresForm(errs);
    return Object.keys(errs).length === 0;
  };

  const guardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      const formData = new FormData();
      formData.append("titulo", form.titulo.trim());
      formData.append("descripcion", form.descripcion.trim());
      formData.append("categoria", form.categoria);
      formData.append("nivel", form.nivel);
      formData.append("duracion_horas", String(form.duracion_horas));
      formData.append("link_externo", form.link_externo.trim());
      formData.append("instructor", form.instructor.trim());
      formData.append("activo", String(form.activo));
      if (form.imagen_file) formData.append("imagen", form.imagen_file);

      const url = editandoId
        ? `${API_BASE}/admin/cursos/${editandoId}/`
        : `${API_BASE}/admin/cursos/`;
      const method = editandoId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errs: Record<string, string> = {};
        for (const [campo, msgs] of Object.entries(data)) {
          errs[campo] = Array.isArray(msgs) ? msgs[0] : String(msgs);
        }
        setErroresForm(Object.keys(errs).length ? errs : { general: "Error al guardar. Intenta de nuevo." });
        return;
      }

      cerrarModal();
      fetchCursos();
    } catch {
      setErroresForm({ general: "Error de conexión con el servidor." });
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: number, titulo: string) => {
    if (!confirm(`¿Eliminar el curso "${titulo}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/cursos/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      fetchCursos();
    } catch {
      alert("No se pudo eliminar el curso. Intenta de nuevo.");
    }
  };

  const inputStyle = (error?: string): React.CSSProperties => ({
    width: "100%",
    border: `1px solid ${error ? "#fca5a5" : "#e5e7eb"}`,
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: COLOR_TEXTO,
    marginBottom: "4px",
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 }}>Gestión de Cursos</h1>
          <p style={{ fontSize: "13px", color: COLOR_TEXTO_SUAVE, margin: "4px 0 0" }}>
            Publica y administra los cursos informativos de MN WOMAN.
          </p>
        </div>
        <button
          onClick={abrirCrear}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 16px", background: COLOR_PRIMARIO, color: "#fff",
            fontSize: "13px", fontWeight: 600, border: "none", borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          <Plus size={16} /> Nuevo Curso
        </button>
      </div>

      {errorCarga && (
        <div style={{
          display: "flex", alignItems: "center", gap: "8px", fontSize: "13px",
          color: "#dc2626", background: "#fef2f2", border: "1px solid #fee2e2",
          borderRadius: "10px", padding: "12px 16px", marginBottom: "16px",
        }}>
          <AlertCircle size={16} />
          No se pudieron cargar los cursos.
          <button onClick={fetchCursos} style={{ textDecoration: "underline", background: "none", border: "none", color: "#dc2626", cursor: "pointer", marginLeft: "4px" }}>
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: "13px", color: COLOR_TEXTO_SUAVE, padding: "40px 0", textAlign: "center" }}>Cargando cursos...</p>
      ) : cursos.length === 0 && !errorCarga ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <BookOpen size={40} style={{ color: "#d1d5db", marginBottom: "12px" }} />
          <p style={{ color: COLOR_TEXTO_SUAVE, fontSize: "13px" }}>No hay cursos publicados aún.</p>
          <button onClick={abrirCrear} style={{ marginTop: "12px", color: COLOR_PRIMARIO, fontSize: "13px", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>
            Publicar el primer curso
          </button>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${COLOR_BORDE}`, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
          <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
            <thead style={{ background: "#fafafa", color: COLOR_TEXTO_SUAVE, fontSize: "11px", textTransform: "uppercase" }}>
              <tr>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>Curso</th>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>Categoría</th>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>Nivel</th>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>Horas</th>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>Estado</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map((curso) => (
                <tr key={curso.id} style={{ borderTop: `1px solid ${COLOR_BORDE}` }}>
                  <td style={{ padding: "12px 16px" }}>
                    <p style={{ fontWeight: 600, color: "#1f2937", margin: 0 }}>{curso.titulo}</p>
                    {curso.instructor && <p style={{ fontSize: "11px", color: COLOR_TEXTO_SUAVE, margin: "2px 0 0" }}>{curso.instructor}</p>}
                  </td>
                  <td style={{ padding: "12px 16px", color: COLOR_TEXTO_SUAVE, textTransform: "capitalize" }}>{curso.categoria}</td>
                  <td style={{ padding: "12px 16px", color: COLOR_TEXTO_SUAVE, textTransform: "capitalize" }}>{curso.nivel}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", color: COLOR_TEXTO_SUAVE }}>
                      <Clock size={12} /> {curso.duracion_horas}h
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      display: "inline-block", padding: "2px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 600,
                      background: curso.activo ? "#dcfce7" : "#f3f4f6",
                      color: curso.activo ? "#15803d" : COLOR_TEXTO_SUAVE,
                    }}>
                      {curso.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      {curso.link_externo && (
                        <a href={curso.link_externo} target="_blank" rel="noopener noreferrer"
                          style={{ padding: "4px", color: COLOR_TEXTO_SUAVE }} title="Ver curso">
                          <ExternalLink size={15} />
                        </a>
                      )}
                      <button onClick={() => abrirEditar(curso)}
                        style={{ padding: "4px", color: COLOR_TEXTO_SUAVE, background: "none", border: "none", cursor: "pointer" }} title="Editar">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => eliminar(curso.id, curso.titulo)}
                        style={{ padding: "4px", color: COLOR_TEXTO_SUAVE, background: "none", border: "none", cursor: "pointer" }} title="Eliminar">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalAbierto && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}
          onClick={(e) => { if (e.target === e.currentTarget) cerrarModal(); }}
        >
          <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: `1px solid ${COLOR_BORDE}` }}>
              <h2 style={{ fontWeight: 700, color: "#111827", fontSize: "15px", margin: 0 }}>
                {editandoId ? "Editar Curso" : "Publicar Nuevo Curso"}
              </h2>
              <button onClick={cerrarModal} disabled={guardando}
                style={{ background: "none", border: "none", color: COLOR_TEXTO_SUAVE, cursor: "pointer", opacity: guardando ? 0.4 : 1 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {erroresForm.general && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#dc2626", background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "8px", padding: "8px 12px" }}>
                  <AlertCircle size={14} /> {erroresForm.general}
                </div>
              )}

              {/* Título */}
              <div>
                <label style={labelStyle}>Título *</label>
                <input name="titulo" value={form.titulo} onChange={handleChange}
                  style={inputStyle(erroresForm.titulo)}
                  placeholder="Ej. Finanzas Estratégicas para MiPyMEs" />
                {erroresForm.titulo && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0" }}>{erroresForm.titulo}</p>}
              </div>

              {/* Descripción */}
              <div>
                <label style={labelStyle}>Descripción *</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3}
                  style={{ ...inputStyle(erroresForm.descripcion), resize: "none" }}
                  placeholder="Describe de qué trata el curso..." />
                {erroresForm.descripcion && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0" }}>{erroresForm.descripcion}</p>}
              </div>

              {/* Categoría y Nivel */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Categoría</label>
                  <select name="categoria" value={form.categoria} onChange={handleChange} style={inputStyle()}>
                    {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Nivel</label>
                  <select name="nivel" value={form.nivel} onChange={handleChange} style={inputStyle()}>
                    <option value="basico">Básico</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              {/* Duración e Instructor */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Duración (horas) *</label>
                  <input name="duracion_horas" type="number" min={1} value={form.duracion_horas} onChange={handleChange}
                    style={inputStyle(erroresForm.duracion_horas)} />
                  {erroresForm.duracion_horas && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0" }}>{erroresForm.duracion_horas}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Instructor / Ponente</label>
                  <input name="instructor" value={form.instructor} onChange={handleChange}
                    style={inputStyle()}
                    placeholder="Ej. Valentina Sánchez" />
                </div>
              </div>

              {/* Link externo */}
              <div>
                <label style={labelStyle}>Link externo (plataforma del curso)</label>
                <input name="link_externo" value={form.link_externo} onChange={handleChange}
                  style={inputStyle(erroresForm.link_externo)}
                  placeholder="https://..." />
                {erroresForm.link_externo
                  ? <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0" }}>{erroresForm.link_externo}</p>
                  : <p style={{ fontSize: "11px", color: COLOR_TEXTO_SUAVE, margin: "4px 0 0" }}>Deja vacío si aún no está disponible.</p>}
              </div>

              {/* Imagen */}
              <div>
                <label style={labelStyle}>Imagen de portada (máx. 3MB · JPG, PNG, WEBP)</label>
                <input type="file" name="imagen" accept=".jpg,.jpeg,.png,.webp" onChange={handleChange}
                  style={{ fontSize: "13px", color: COLOR_TEXTO_SUAVE }} />
                {erroresForm.imagen && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0" }}>{erroresForm.imagen}</p>}
              </div>

              {/* Activo */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="checkbox" id="activo" name="activo" checked={form.activo} onChange={handleChange} />
                <label htmlFor="activo" style={{ fontSize: "13px", color: COLOR_TEXTO }}>
                  Publicar curso (visible para las usuarias)
                </label>
              </div>
            </div>

            <div style={{ padding: "16px 24px", borderTop: `1px solid ${COLOR_BORDE}`, display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button onClick={cerrarModal} disabled={guardando}
                style={{ padding: "8px 16px", fontSize: "13px", color: COLOR_TEXTO_SUAVE, border: `1px solid ${COLOR_BORDE}`, borderRadius: "8px", background: "#fff", cursor: "pointer", opacity: guardando ? 0.4 : 1 }}>
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando}
                style={{ padding: "8px 20px", fontSize: "13px", fontWeight: 600, background: COLOR_PRIMARIO, color: "#fff", borderRadius: "8px", border: "none", cursor: "pointer", opacity: guardando ? 0.6 : 1 }}>
                {guardando ? "Guardando..." : editandoId ? "Guardar cambios" : "Publicar curso"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}