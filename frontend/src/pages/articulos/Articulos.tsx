import { useState, useEffect } from "react";


const API_BASE = "http://127.0.0.1:8000/api";

// Paleta MN WOMAN - Pink Rose
const COLORS = {
  primary: "#B66878",
  primaryDark: "#9a5566",
  secondary: "#D49BA7",
  light: "#EFC3CA",
  ultralight: "#FDF0F2",
  lightBg: "#DAABB5",
};

const CATEGORIES = [
  { value: "todos", label: "Todos" },
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

  useEffect(() => {
    fetchArticles();
  }, [activeCategory]);

  async function fetchArticles() {
    setLoading(true);
    try {
      const token = getToken();
      const params = activeCategory !== "todos" ? `?category=${activeCategory}` : "";

      // FIX 1: usar endpoint público cuando no hay token
      const url = token
        ? `${API_BASE}/articles/${params}`
        : `${API_BASE}/articles/public/${params}`;

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      const data = await res.json();

      // FIX 2: manejar respuesta paginada {count, results:[]} o array directo
      const lista: Article[] = Array.isArray(data) ? data : (data.results ?? []);
      setArticles(lista);
    } catch {
      console.error("Error al cargar artículos");
    } finally {
      setLoading(false);
    }
  }

  const featured = articles.find((a) => a.is_featured);
  const rest = articles.filter((a) => !a.is_featured);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #f3e8ea", padding: "40px 40px 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p style={{ fontSize: "12px", fontWeight: "700", color: COLORS.primary, textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 8px" }}>
            Temas de Interés
          </p>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1f2937", margin: "0 0 8px" }}>
            Explora Temas de <span style={{ color: COLORS.primary }}>Interés</span>
          </h1>
          <p style={{ color: "#6b7280", fontSize: "15px", margin: "0 0 28px" }}>
            Artículos seleccionados para nutrir tu crecimiento profesional y bienestar personal.
          </p>

          {/* Tabs de categoría */}
          <div style={{ display: "flex", gap: "4px", overflowX: "auto" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "20px 20px 0 0",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                  background: activeCategory === cat.value ? COLORS.primary : "transparent",
                  color: activeCategory === cat.value ? "white" : "#9ca3af",
                  borderBottom: `2px solid ${activeCategory === cat.value ? COLORS.primary : "transparent"}`,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 40px" }}>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px", color: COLORS.secondary }}>
            <p style={{ fontSize: "32px", margin: "0 0 12px" }}>🌸</p>
            Cargando artículos...
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", background: "white", borderRadius: "16px", border: `1px solid ${COLORS.light}` }}>
            <p style={{ color: "#6b7280", fontSize: "15px" }}>No hay artículos en esta categoría aún.</p>
          </div>
        ) : (
          <>
            {/* Artículo Destacado */}
            {featured && (
              <a href={featured.external_url} target="_blank" rel="noreferrer"
                style={{ textDecoration: "none", display: "block", marginBottom: "32px" }}>
                <div style={{
                  borderRadius: "20px", overflow: "hidden", position: "relative",
                  height: "360px", background: COLORS.primary, cursor: "pointer",
                  boxShadow: "0 8px 32px rgba(182,104,120,0.25)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px rgba(182,104,120,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(182,104,120,0.25)";
                  }}
                >
                  {featured.cover_image_url && (
                    <img src={featured.cover_image_url} alt={featured.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }} />
                  )}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(182,104,120,0.95) 0%, rgba(182,104,120,0.3) 60%, transparent 100%)",
                    display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "36px",
                  }}>
                    <span style={{
                      display: "inline-block", background: "white", color: COLORS.primary,
                      fontSize: "11px", fontWeight: "700", padding: "4px 14px",
                      borderRadius: "20px", marginBottom: "14px", width: "fit-content",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>
                      ✦ Destacado
                    </span>
                    <h2 style={{ fontSize: "26px", fontWeight: "800", color: "white", margin: "0 0 12px", lineHeight: 1.3 }}>
                      {featured.title}
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span style={{
                        fontSize: "12px", color: "white", background: "rgba(255,255,255,0.2)",
                        padding: "4px 12px", borderRadius: "20px", fontWeight: "500",
                      }}>
                        {featured.category_display}
                      </span>
                      <span style={{ fontSize: "13px", color: COLORS.light, fontWeight: "700" }}>
                        Leer artículo completo →
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                {rest.map((article) => (
                  <a key={article.id} href={article.external_url} target="_blank" rel="noreferrer"
                    style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        background: "white", borderRadius: "16px", overflow: "hidden",
                        border: `1px solid #f3e8ea`, cursor: "pointer",
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px rgba(182,104,120,0.15)`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                      }}
                    >
                      {/* Imagen */}
                      <div style={{ height: "180px", background: COLORS.ultralight, overflow: "hidden" }}>
                        {article.cover_image_url ? (
                          <img src={article.cover_image_url} alt={article.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>
                            🌸
                          </div>
                        )}
                      </div>

                      {/* Contenido */}
                      <div style={{ padding: "16px 18px 20px" }}>
                        <span style={{
                          fontSize: "11px", background: COLORS.ultralight, color: COLORS.primary,
                          padding: "3px 10px", borderRadius: "20px", fontWeight: "700",
                          display: "inline-block", marginBottom: "10px",
                        }}>
                          {article.category_display}
                        </span>
                        <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1f2937", margin: "0 0 14px", lineHeight: 1.4 }}>
                          {article.title}
                        </h3>
                        <span style={{ fontSize: "13px", color: COLORS.primary, fontWeight: "700" }}>
                          Leer más →
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}