import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, BarChart3, Cpu, ChevronDown, Sparkles, TrendingUp } from "lucide-react";

// Componente helper para el efecto "Reveal" al hacer scroll
interface RevealProps {
  children: React.ReactNode;
  className?: string;
}

function Reveal({ children, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -60px 0px", // Margen inferior para retrasar un poco la aparición
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const [isScrolledPastVideo, setIsScrolledPastVideo] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const videoSection = videoSectionRef.current;
          const video = videoRef.current;

          if (!videoSection || !video) {
            ticking = false;
            return;
          }

          const rect = videoSection.getBoundingClientRect();
          const viewHeight = window.innerHeight;
          const sectionHeight = rect.height;

          // Calcular la cantidad de scroll transcurrido dentro de este bloque de 200vh
          // -rect.top representa el scroll dentro de la sección
          // El scroll máximo disponible en este bloque es sectionHeight - viewHeight
          const maxScrollInBlock = sectionHeight - viewHeight;
          const currentScrollInBlock = -rect.top;
          
          const progress = Math.max(0, Math.min(1, currentScrollInBlock / maxScrollInBlock));

          // Actualizar el currentTime del video de 0 a 10s (o duración real)
          const duration = video.duration && isFinite(video.duration) ? video.duration : 10;
          
          // Mapeamos el progreso de scroll al rango de tiempo del video
          // Dejamos un margen pequeño al final para evitar parpadeos
          video.currentTime = Math.max(0, Math.min(duration - 0.05, progress * duration));

          // Controlar si ya pasamos la sección del video para efectos decorativos
          setIsScrolledPastVideo(progress >= 1);

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Ejecutar inicialmente

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative bg-slate-950 text-white select-none">
      
      {/* 1. SECCIÓN DEL VIDEO (Scrubbing) */}
      <div
        ref={videoSectionRef}
        className="relative h-[200vh] bg-slate-950 w-full"
      >
        {/* El video es pegajoso hasta llegar al final del contenedor de 200vh */}
        <div className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none z-0">
          <video
            ref={videoRef}
            src="/hero-scroll.mp4"
            muted
            playsInline
            className="w-full h-full object-cover filter brightness-[0.35] contrast-[1.05]"
          />
          {/* Capa de gradiente inferior para fundir con la sección de contenido */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950 z-1" />
          
          {/* Overlay decorativo de cuadrícula deportiva */}
          <div 
            className="absolute inset-0 opacity-[0.03] z-2" 
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }}
          />

          {/* Textos o guías flotantes del video en sí */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4">
            <Trophy className="h-12 w-12 text-yellow-500 mb-6 animate-pulse" />
            <h1 className="text-4xl sm:text-7xl font-black tracking-tighter mb-4 uppercase leading-none">
              MUNDIAL <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">Interactive</span>
            </h1>
            <p className="text-sm sm:text-lg text-gray-400 max-w-md tracking-wider uppercase font-semibold">
              Desliza hacia abajo para recorrer la historia
            </p>
          </div>

          {/* Indicador de Scroll */}
          <div
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 transition-opacity duration-300 ${
              isScrolledPastVideo ? "opacity-0" : "opacity-100"
            }`}
          >
            <span className="text-[10px] font-bold tracking-widest text-yellow-500/80 uppercase">Scroll para avanzar</span>
            <ChevronDown className="h-4 w-4 text-yellow-500 animate-bounce" />
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN DE CONTENIDO */}
      <div className="relative bg-[#0b0f19] z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-32">
          
          {/* BLOQUE 1: Título principal y KPIs */}
          <Reveal className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 text-yellow-500 text-xs font-semibold uppercase tracking-wider mb-6 border border-yellow-500/10">
              <Trophy className="h-4 w-4" />
              La Gloria del Fútbol Mundial
            </div>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-none">
              LA HISTORIA SE ESCRIBE EN <br />
              <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                CADA SEGUNDO DE JUEGO
              </span>
            </h2>
            <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              Explora las estadísticas de todas las ediciones de la Copa del Mundo. El legado de los campeones mundiales, revivido a través de un análisis de datos moderno.
            </p>
            
            {/* Tarjetas de KPIs */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
              <div className="glassmorphism p-5 rounded-xl text-center border border-white/5">
                <span className="block text-2xl sm:text-4xl font-extrabold text-yellow-500 mb-1">22</span>
                <span className="text-xs sm:text-sm text-gray-400 uppercase font-medium tracking-wide">Ediciones</span>
              </div>
              <div className="glassmorphism p-5 rounded-xl text-center border border-white/5">
                <span className="block text-2xl sm:text-4xl font-extrabold text-yellow-500 mb-1">80+</span>
                <span className="text-xs sm:text-sm text-gray-400 uppercase font-medium tracking-wide">Selecciones</span>
              </div>
              <div className="glassmorphism p-5 rounded-xl text-center border border-white/5">
                <span className="block text-2xl sm:text-4xl font-extrabold text-yellow-500 mb-1">2.5k+</span>
                <span className="text-xs sm:text-sm text-gray-400 uppercase font-medium tracking-wide">Goles</span>
              </div>
            </div>
          </Reveal>

          {/* BLOQUE 2: Comparativa Head-to-Head */}
          <Reveal className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6 border border-cyan-500/10">
                <BarChart3 className="h-4 w-4" />
                Análisis Estadístico
              </div>
              <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
                COMPARATIVAS <span className="text-cyan-400 font-black">HEAD-TO-HEAD</span>
              </h3>
              <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
                Enfréntate a la historia. Compara el rendimiento histórico de las mejores selecciones cara a cara, analizando la posesión, goles y efectividad.
              </p>
            </div>

            {/* Tarjeta de Comparación Deportiva Premium */}
            <div className="glassmorphism max-w-2xl mx-auto rounded-2xl p-6 sm:p-8 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 via-yellow-500 to-amber-500" />
              
              {/* Header del Encuentro */}
              <div className="grid grid-cols-7 items-center justify-center mb-8">
                <div className="col-span-3 text-center sm:text-right">
                  <span className="block font-black text-lg sm:text-2xl tracking-wider text-white">ARGENTINA</span>
                  <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">3 Títulos</span>
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-bold text-gray-400">VS</span>
                </div>
                <div className="col-span-3 text-center sm:text-left">
                  <span className="block font-black text-lg sm:text-2xl tracking-wider text-white">FRANCIA</span>
                  <span className="text-xs text-amber-500 font-bold uppercase tracking-widest">2 Títulos</span>
                </div>
              </div>

              {/* Barras de Atributo */}
              <div className="space-y-6">
                {/* Atributo 1: Goles */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2 px-1">
                    <span>152 Goles</span>
                    <span className="uppercase tracking-widest text-[9px] text-gray-500 font-bold">Goles Totales</span>
                    <span>138 Goles</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden flex">
                    <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400" style={{ width: "52%" }}></div>
                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 ml-auto" style={{ width: "48%" }}></div>
                  </div>
                </div>

                {/* Atributo 2: Posesión */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2 px-1">
                    <span>56.8%</span>
                    <span className="uppercase tracking-widest text-[9px] text-gray-500 font-bold">Posesión Promedio</span>
                    <span>52.4%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden flex">
                    <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400" style={{ width: "58%" }}></div>
                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 ml-auto" style={{ width: "42%" }}></div>
                  </div>
                </div>

                {/* Atributo 3: Victorias H2H */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2 px-1">
                    <span>6 Victorias</span>
                    <span className="uppercase tracking-widest text-[9px] text-gray-500 font-bold">Victorias Directas</span>
                    <span>3 Victorias</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden flex">
                    <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400" style={{ width: "67%" }}></div>
                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 ml-auto" style={{ width: "33%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* BLOQUE 3: Oráculo IA y CTA */}
          <Reveal className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 text-yellow-500 text-xs font-semibold uppercase tracking-wider mb-6 border border-yellow-500/10">
              <Cpu className="h-4 w-4 text-yellow-500" />
              Recomendador Inteligente
            </div>
            <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              PREDICCIONES DEL <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">ORÁCULO IA</span>
            </h3>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Nuestro motor de IA procesa millones de datos históricos para generar predicciones detalladas sobre los ganadores y estadísticas clave de los próximos partidos.
            </p>

            {/* Tarjeta Simulación de IA */}
            <div className="glassmorphism max-w-md mx-auto rounded-2xl p-6 border border-white/5 mb-10 text-left relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <span className="block font-bold text-sm text-white">Análisis de Simulación H2H</span>
                  <span className="text-xs text-gray-400">Modelo Predictivo Mundial v2.1</span>
                </div>
              </div>

              <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Probabilidad de Victoria:</span>
                  <span className="font-bold text-yellow-500">Argentina (54.2%)</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-yellow-500 h-full" style={{ width: "54.2%" }}></div>
                </div>
                <div className="flex justify-between items-center text-[11px] text-gray-400 mt-1">
                  <span>Empate: 21.3%</span>
                  <span>Francia: 24.5%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 text-[11px] text-green-400">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Alta probabilidad de goles en el segundo tiempo (&gt;1.5 goles)</span>
              </div>
            </div>

            {/* Botones de acción CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link
                to="/register"
                className="w-full px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/35 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                Registrarse Gratis
              </Link>
              <Link
                to="/login"
                className="w-full px-8 py-3.5 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center cursor-pointer"
              >
                Iniciar Sesión
              </Link>
            </div>
          </Reveal>

        </div>
      </div>
    </div>
  );
}
