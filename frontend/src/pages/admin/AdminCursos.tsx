import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus, Pencil, Trash2, X, BookOpen, Clock, ExternalLink, AlertCircle,
  Search, ChevronLeft, ChevronRight, GraduationCap, ImagePlus, Check,
} from "lucide-react";
import api from "../../api/axios";
import { paginacionBotonStyle, COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE } from "../../styles/tokens";

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

const NIVEL_LABEL: Record<string, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

const CURSOS_POR_PAGINA = 6;

export default function AdminCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(FORM_INICIAL);
  const [previsualizacion, setPrevisualizacion] = useState<string>("");
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});

  const fetchCursos = useCallback(async () => {
    setLoading(true);
    setErrorCarga(false);
    try {
      const { data } = await api.get("/admin/cursos/");
      setCursos(data.results ?? data);
    } catch {
      setErrorCarga(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCursos(); }, [fetchCursos]);
  useEffect(() => { setPagina(1); }, [busqueda]);

  // ── Búsqueda y paginación ──
  const cursosFiltrados = cursos.filter((c) =>
    busqueda === "" ||
    c.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.instructor.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.max(1, Math.ceil(cursosFiltrados.length / CURSOS_POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const cursosPagina = cursosFiltrados.slice(
    (paginaSegura - 1) * CURSOS_POR_PAGINA,
    paginaSegura * CURSOS_POR_PAGINA
  );

  const numerosPagina = useMemo(() => {
    if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    const nums = new Set([1, 2, totalPaginas - 1, totalPaginas, paginaSegura - 1, paginaSegura, paginaSegura + 1]);
    return Array.from(nums).filter((n) => n >= 1 && n <= totalPaginas).sort((a, b) => a - b);
  }, [totalPaginas, paginaSegura]);

  const categoriaLabel = (value: string) =>
    CATEGORIAS.find((c) => c.value === value)?.label ?? value;

  const abrirCrear = () => {
    setForm(FORM_INICIAL);
    setEditandoId(null);
    setPrevisualizacion("");
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
    setPrevisualizacion(curso.imagen || "");
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
      if (file) setPrevisualizacion(URL.createObjectURL(file));
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

      if (editandoId) {
        await api.patch(`/admin/cursos/${editandoId}/`, formData);
      } else {
        await api.post("/admin/cursos/", formData);
      }

      cerrarModal();
      fetchCursos();
    } catch (err: any) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const errs: Record<string, string> = {};
        for (const [campo, msgs] of Object.entries(data)) {
          errs[campo] = Array.isArray(msgs) ? msgs[0] : String(msgs);
        }
        setErroresForm(Object.keys(errs).length ? errs : { general: "Error al guardar. Intenta de nuevo." });
      } else {
        setErroresForm({ general: "Error de conexión con el servidor." });
      }
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: number, titulo: string) => {
    if (!confirm(`¿Eliminar el curso "${titulo}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/admin/cursos/${id}/`);
      fetchCursos();
    } catch {
      alert("No se pudo eliminar el curso. Intenta de nuevo.");
    }
  };

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
              Gestión de <span style={{ color: COLOR_MARCA }}>Cursos</span>
            </h1>
            <p style={{ fontSize: "15px", color: "#6b7280", margin: "8px 0 0" }}>
              Publica y administra los cursos informativos de MN WOMAN.
            </p>
          </div>
          <button onClick={abrirCrear} style={{
            background: COLOR_MARCA, color: 'white', padding: '12px 22px',
            borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px',
            display: 'inline-flex', alignItems: 'center', gap: '8px', flexShrink: 0,
          }}>
            <Plus size={16} /> Nuevo curso
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
            No se pudieron cargar los cursos.
            <button onClick={fetchCursos} style={{ textDecoration: "underline", background: "none", border: "none", color: "#dc2626", cursor: "pointer", marginLeft: "4px" }}>
              Reintentar
            </button>
          </div>
        )}

        {/* BUSCADOR */}
        {!loading && !errorCarga && cursos.length > 0 && (
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              aria-label="Buscar cursos"
              placeholder="Buscar por título, instructor o categoría..."
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
        ) : cursos.length === 0 && !errorCarga ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            textAlign: 'center', padding: '80px 24px', background: 'white',
            borderRadius: '16px', border: `1px solid ${COLOR_BORDE}`,
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: '#fdf2f4', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen size={22} color={COLOR_MARCA} />
            </div>
            <p style={{ color: '#6b7280', margin: 0 }}>No hay cursos publicados aún. ¡Crea el primero!</p>
          </div>
        ) : cursosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>No hay cursos que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cursosPagina.map((curso) => (
                <div key={curso.id} style={{
                  background: 'white', borderRadius: '14px', padding: '20px 24px',
                  border: `1px solid ${COLOR_BORDE}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                }}>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '10px', flexShrink: 0,
                    background: curso.imagen ? 'none' : `linear-gradient(135deg, ${COLOR_MARCA_CLARO}, ${COLOR_MARCA})`,
                    overflow: 'hidden'
                  }}>
                    {curso.imagen
                      ? <img src={curso.imagen} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <GraduationCap size={22} color="white" />
                        </div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{
                        background: curso.activo ? '#dcfce7' : '#f3f4f6',
                        color: curso.activo ? '#16a34a' : '#6b7280',
                        fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px'
                      }}>
                        {curso.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <span style={{
                        background: '#eef2ff', color: '#6366f1',
                        fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px',
                      }}>
                        {NIVEL_LABEL[curso.nivel] ?? curso.nivel}
                      </span>
                    </div>
                    <p style={{ fontWeight: '700', color: '#111827', fontSize: '15px', margin: '0 0 4px 0' }}>{curso.titulo}</p>
                    <p style={{
                      display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                      fontSize: '13px', color: '#6b7280', margin: 0,
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <BookOpen size={12} /> {categoriaLabel(curso.categoria)}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {curso.duracion_horas}h
                      </span>
                      {curso.instructor && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {curso.instructor}
                        </span>
                      )}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, justifyContent: 'flex-end' }}>
                    {curso.link_externo && (
                      <a href={curso.link_externo} target="_blank" rel="noopener noreferrer" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '8px', border: '1px solid #e0e7ff',
                        background: '#eef2ff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#6366f1',
                        textDecoration: 'none',
                      }}><ExternalLink size={13} /> Ver curso</a>
                    )}
                    <button onClick={() => abrirEditar(curso)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb',
                      background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#374151'
                    }}><Pencil size={13} /> Editar</button>
                    <button onClick={() => eliminar(curso.id, curso.titulo)} style={{
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

      {/* Modal */}
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
                {editandoId ? 'Editar curso' : 'Publicar nuevo curso'}
              </h2>
              <button onClick={cerrarModal} disabled={guardando}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', opacity: guardando ? 0.4 : 1 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {erroresForm.general && (
                <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>{erroresForm.general}</p>
              )}

              <div>
                <label style={labelStyle}>Imagen de portada</label>
                <div style={{
                  border: '2px dashed #e5e7eb', borderRadius: '12px', padding: '16px',
                  textAlign: 'center', cursor: 'pointer', background: '#f9fafb',
                  position: 'relative', overflow: 'hidden',
                  height: previsualizacion ? 'auto' : '100px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {previsualizacion
                    ? <img src={previsualizacion} alt="preview" style={{ maxHeight: '160px', borderRadius: '8px', objectFit: 'cover', width: '100%' }} />
                    : <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '14px', margin: 0 }}>
                        <ImagePlus size={16} /> Haz clic para subir imagen
                      </p>
                  }
                  <input type="file" name="imagen" accept=".jpg,.jpeg,.png,.webp" onChange={handleChange}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                </div>
                {erroresForm.imagen
                  ? <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>{erroresForm.imagen}</p>
                  : <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>Máximo 3MB · JPG, PNG o WEBP.</p>}
              </div>

              <div>
                <label style={labelStyle}>Título del curso</label>
                <input name="titulo" value={form.titulo} onChange={handleChange}
                  placeholder="Ej. Finanzas Estratégicas para MiPyMEs" style={inputStyle} />
                {erroresForm.titulo && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{erroresForm.titulo}</p>}
              </div>

              <div>
                <label style={labelStyle}>Descripción</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
                  placeholder="Describe de qué trata el curso..." rows={3}
                  style={{ ...inputStyle, resize: 'vertical' as const }} />
                {erroresForm.descripcion && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{erroresForm.descripcion}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Categoría</label>
                  <select name="categoria" value={form.categoria} onChange={handleChange} style={inputStyle}>
                    {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Nivel</label>
                  <select name="nivel" value={form.nivel} onChange={handleChange} style={inputStyle}>
                    <option value="basico">Básico</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Duración (horas)</label>
                  <input type="number" name="duracion_horas" min="1" value={form.duracion_horas} onChange={handleChange}
                    style={inputStyle} />
                  {erroresForm.duracion_horas && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{erroresForm.duracion_horas}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Instructor / Ponente</label>
                  <input name="instructor" value={form.instructor} onChange={handleChange}
                    placeholder="Ej. Valentina Sánchez" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Link externo (plataforma del curso)</label>
                <input name="link_externo" value={form.link_externo} onChange={handleChange}
                  placeholder="https://..." style={inputStyle} />
                {erroresForm.link_externo
                  ? <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{erroresForm.link_externo}</p>
                  : <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Deja vacío si aún no está disponible.</p>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="activo" name="activo" checked={form.activo} onChange={handleChange} />
                <label htmlFor="activo" style={{ fontSize: '13px', color: '#374151' }}>
                  Publicar curso (visible para las usuarias)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button onClick={cerrarModal} disabled={guardando} style={{
                  padding: '10px 24px', borderRadius: '10px', border: '1px solid #e5e7eb',
                  background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#374151',
                  opacity: guardando ? 0.6 : 1,
                }}>Cancelar</button>
                <button onClick={guardar} disabled={guardando} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '10px 24px', borderRadius: '10px', border: 'none',
                  background: COLOR_MARCA, color: 'white', cursor: 'pointer',
                  fontWeight: '700', fontSize: '14px', opacity: guardando ? 0.7 : 1,
                }}>
                  {!guardando && <Check size={14} />}
                  {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Publicar curso'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}