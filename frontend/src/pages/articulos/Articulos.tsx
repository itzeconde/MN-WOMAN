import { useState, useEffect, useMemo } from "react";
import { Search, Sparkles, Newspaper, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../api/axios";
import {
  paginacionBotonStyle, badgePillStyle,
  COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE,
  CARD_SHADOW_REST, CARD_SHADOW_HOVER,
} from "../../styles/tokens";

const CATEGORIES = [
  { value: "todos", label: "Todos" },
  { value: "recetas", label: "Recetas" },
  { value: "bienestar", label: "Bienestar" },
  { value: "negocios", label: "Consejos de Negocios" },
  { value: "vida_familia", label: "Vida y Familia" },
  { value: "tendencias", label: "Tendencias" },
];

const ARTICULOS_POR_PAGINA = 9;

function getToken(): string | null {
  return localStorage.getItem("access_token");
}

interface Article {
  id: number;
  title: string;
  cover_image_url: string | null;
  external_url: string;
  category: string;
  category_display: string;
  is_featured: boolean;
}

export default function Articulos() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [buscadorEnfocado, setBuscadorEnfocado] = useState(false);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    fetchArticles();
  }, [activeCategory]);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, activeCategory]);

  async function fetchArticles() {
    setLoading(true);
    try {
      const token = getToken();
      const params = activeCategory !== "todos" ? { category: activeCategory } : {};

      // FIX 1: usar endpoint público cuando no hay token
      const url = token ? "/articles/" : "/articles/public/";

      const { data } = await api.get(url, { params });

      // FIX 2: manejar respuesta paginada {count, results:[]} o array directo
      const lista: Article[] = Array.isArray(data) ? data : (data.results ?? []);
      setArticles(lista);
    } catch {
      console.error("Error al cargar artículos");
    } finally {
      setLoading(false);
    }
  }

  // Normaliza mayúsculas/minúsculas Y acentos, así "tecnicas", "Técnicas" y
  // "TÉCNICAS" se consideran equivalentes al buscar.
  function normalizar(texto: string): string {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  const articulosFiltrados = articles.filter(
    (a) => busqueda === "" || normalizar(a.title).includes(normalizar(busqueda))
  );

  // Destacados primero, el resto conserva su orden original
  const articulosOrdenados = useMemo(() => {
    const destacados = articulosFiltrados.filter((a) => a.is_featured);
    const normales = articulosFiltrados.filter((a) => !a.is_featured);
    return [...destacados, ...normales];
  }, [articulosFiltrados]);

  const totalPaginas = Math.max(1, Math.ceil(articulosOrdenados.length / ARTICULOS_POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const articulosPagina = articulosOrdenados.slice(
    (paginaSegura - 1) * ARTICULOS_POR_PAGINA,
    paginaSegura * ARTICULOS_POR_PAGINA
  );

  // Números de página con "..." cuando hay muchas páginas (mismo patrón que Oportunidades/Cursos)
  const numerosPagina = useMemo(() => {
    if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    const nums = new Set([1, 2, totalPaginas - 1, totalPaginas, paginaSegura - 1, paginaSegura, paginaSegura + 1]);
    return Array.from(nums).filter((n) => n >= 1 && n <= totalPaginas).sort((a, b) => a - b);
  }, [totalPaginas, paginaSegura]);

  const irAPagina = (p: number) => {
    setPagina(Math.min(Math.max(p, 1), totalPaginas));
    document.getElementById("articulos-grid-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        .articulo-card:hover .articulo-img {
          transform: scale(1.05);
        }
        .articulo-card:hover .articulo-cta {
          gap: 8px;
        }
        .articulo-img {
          transition: transform 0.4s ease;
        }
        .articulo-chip {
          transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }
        .articulo-chip:hover {
          transform: translateY(-1px);
        }
        .articulo-cta {
          transition: gap 0.2s ease;
        }
      `}</style>

      {/* HERO — con formas decorativas, mismo patrón que Cursos y Oportunidades */}
      <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)", borderBottom: `1px solid ${COLOR_BORDE}` }}>
        <div style={{
          position: "absolute", top: "-90px", right: "-40px", width: "300px", height: "300px",
          borderRadius: "50%", background: `radial-gradient(circle, ${COLOR_MARCA_CLARO}66, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-110px", left: "15%", width: "220px", height: "220px",
          borderRadius: "50%", background: `radial-gradient(circle, ${COLOR_MARCA_CLARO}40, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto", padding: "48px 20px 36px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: COLOR_MARCA }}>
            <Sparkles size={12} /> Temas de Interés
          </span>
          <h1 style={{ fontSize: "34px", fontWeight: "800", color: "#111827", margin: "12px 0 12px", lineHeight: "1.22", letterSpacing: "-0.01em" }}>
            Explora Temas de <span style={{ color: COLOR_MARCA }}>Interés</span>
          </h1>
          <p style={{ color: "#6b7280", fontSize: "15px", margin: 0, maxWidth: "520px" }}>
            Artículos seleccionados para nutrir tu crecimiento profesional y bienestar personal.
          </p>
          {!loading && (
            <p style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              fontSize: "13px", color: COLOR_MARCA, fontWeight: "700",
              background: "#fff", boxShadow: `inset 0 0 0 1px ${COLOR_BORDE}`,
              padding: "6px 14px", borderRadius: "100px", margin: "18px 0 0",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: COLOR_MARCA, display: "inline-block" }} />
              {articulosFiltrados.length} {articulosFiltrados.length === 1 ? "artículo disponible" : "artículos disponibles"}
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 20px 40px" }}>

        {/* PANEL DE FILTROS — buscador + categorías agrupados en una sola tarjeta */}
        <div style={{
          background: "#fff", border: `1px solid ${COLOR_BORDE}`, borderRadius: "16px",
          padding: "20px", marginBottom: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          {/* BUSCADOR */}
          <div style={{ position: "relative", marginBottom: "20px" }}>
            <Search size={16} color={buscadorEnfocado ? COLOR_MARCA : "#9ca3af"} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", transition: "color 0.15s ease" }} />
            <input
              type="text"
              aria-label="Buscar artículos"
              placeholder="Buscar por título..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onFocus={() => setBuscadorEnfocado(true)}
              onBlur={() => setBuscadorEnfocado(false)}
              style={{
                width: "100%", padding: "13px 14px 13px 40px", borderRadius: "12px",
                border: `1px solid ${buscadorEnfocado ? COLOR_MARCA : COLOR_BORDE}`, fontSize: "14px",
                boxSizing: "border-box" as const, outline: "none", background: "#f9fafb",
                boxShadow: buscadorEnfocado ? `0 0 0 3px ${COLOR_MARCA_CLARO}66` : "none",
                transition: "border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease",
              }}
            />
          </div>

          {/* CHIPS DE CATEGORÍA */}
          <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 10px" }}>
            Categoría
          </p>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                className="articulo-chip"
                onClick={() => setActiveCategory(cat.value)}
                aria-pressed={activeCategory === cat.value}
                style={{
                  padding: "9px 18px", borderRadius: "20px", border: "none", whiteSpace: "nowrap",
                  background: activeCategory === cat.value ? COLOR_MARCA : "#f9fafb",
                  color: activeCategory === cat.value ? "white" : "#374151",
                  fontWeight: "700", fontSize: "13px", cursor: "pointer",
                  boxShadow: activeCategory === cat.value ? `0 3px 8px -2px ${COLOR_MARCA}80` : `inset 0 0 0 1px ${COLOR_BORDE}`,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div id="articulos-grid-top" />

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ borderRadius: "16px", border: `1px solid ${COLOR_BORDE}`, overflow: "hidden" }}>
                <div style={{ height: "170px", background: "#FDF0F2" }} />
                <div style={{ padding: "20px" }}>
                  <div style={{ width: "60%", height: "10px", background: "#FDF0F2", borderRadius: "4px", marginBottom: "12px" }} />
                  <div style={{ width: "85%", height: "14px", background: "#faf0f2", borderRadius: "4px" }} />
                </div>
              </div>
            ))}
          </div>
        ) : articulosFiltrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 16px",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `radial-gradient(circle, ${COLOR_MARCA_CLARO}66, transparent 70%)`,
            }}>
              <Newspaper size={28} color={COLOR_MARCA} />
            </div>
            <p style={{ color: "#111827", fontWeight: "700", margin: "0 0 4px" }}>Sin resultados</p>
            <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
              No hay artículos que coincidan con esta categoría o búsqueda.
            </p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
              {articulosPagina.map((article) => (
                <a key={article.id} href={article.external_url} target="_blank" rel="noreferrer"
                  style={{ textDecoration: "none" }}>
                  <div
                    className="articulo-card"
                    style={{
                      background: "white", borderRadius: "16px", overflow: "hidden",
                      border: `1px solid ${COLOR_BORDE}`, boxShadow: CARD_SHADOW_REST, cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = CARD_SHADOW_HOVER;
                      e.currentTarget.style.borderColor = COLOR_MARCA_CLARO;
                      e.currentTarget.style.transform = "translateY(-4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = CARD_SHADOW_REST;
                      e.currentTarget.style.borderColor = COLOR_BORDE;
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Imagen */}
                    <div style={{ height: "170px", background: "#FDF0F2", overflow: "hidden", position: "relative" }}>
                      {article.is_featured && (
                        <span style={{
                          position: "absolute", top: "10px", left: "10px", zIndex: 1,
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          background: "white", color: COLOR_MARCA,
                          fontSize: "11px", fontWeight: "700", padding: "4px 10px",
                          borderRadius: "20px", boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        }}>
                          <Sparkles size={11} /> Destacado
                        </span>
                      )}
                      {article.cover_image_url ? (
                        <img src={article.cover_image_url} alt={article.title}
                          className="articulo-img"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>
                          🌸
                        </div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div style={{ padding: "20px" }}>
                      <span style={badgePillStyle("#FDF0F2", COLOR_MARCA)}>
                        {article.category_display}
                      </span>
                      <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "14px 0 4px", lineHeight: "1.4" }}>
                        {article.title}
                      </p>
                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", paddingTop: "12px", borderTop: `1px solid ${COLOR_BORDE}`, marginTop: "8px" }}>
                        <span className="articulo-cta" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: COLOR_MARCA, fontWeight: "700" }}>
                          Leer más →
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* PAGINACIÓN — mismo componente/estilo que Oportunidades y Cursos */}
            {totalPaginas > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "32px", flexWrap: "wrap" }}>
                <button
                  onClick={() => irAPagina(paginaSegura - 1)}
                  disabled={paginaSegura === 1}
                  style={paginacionBotonStyle(false, paginaSegura === 1)}
                >
                  <ChevronLeft size={14} />
                </button>

                {numerosPagina.map((n, i) => {
                  const anterior = numerosPagina[i - 1];
                  const hayHueco = anterior !== undefined && n - anterior > 1;
                  return (
                    <div key={n} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {hayHueco && <span style={{ color: "#9ca3af", fontSize: "13px" }}>...</span>}
                      <button onClick={() => irAPagina(n)} style={paginacionBotonStyle(n === paginaSegura, false)}>
                        {n}
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={() => irAPagina(paginaSegura + 1)}
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
    </div>
  );
}