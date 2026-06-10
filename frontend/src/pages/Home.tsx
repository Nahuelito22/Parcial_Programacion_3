import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Trophy, BarChart3, Cpu, ChevronDown, Sparkles, TrendingUp } from "lucide-react";
// @ts-ignore
import heroVideo from "../assets/hero-scroll.mp4";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intentar precargar el video
    if (videoRef.current) {
      videoRef.current.load();
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const video = videoRef.current;
          const s1 = section1Ref.current;
          const s2 = section2Ref.current;
          const s3 = section3Ref.current;
          const indicator = scrollIndicatorRef.current;

          if (!video) {
            ticking = false;
            return;
          }

          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          // Calcular la fracción de scroll de 0 a 1
          const scrollFraction = docHeight > 0 ? scrollTop / docHeight : 0;

          // 1. Controlar el video en scroll (Video Scrubbing)
          if (video.duration && isFinite(video.duration)) {
            // Asegurarnos de que el valor esté acotado
            const targetTime = Math.max(0, Math.min(video.duration - 0.05, video.duration * scrollFraction));
            video.currentTime = targetTime;
          }

          // 2. Animar el indicador de scroll de la primera pantalla
          if (indicator) {
            const indOpacity = Math.max(0, 1 - scrollFraction * 8);
            indicator.style.opacity = indOpacity.toString();
            indicator.style.transform = `translate(-50%, ${scrollFraction * -30}px)`;
          }

          // 3. Coordinar opacidad y posición de las secciones de texto para un efecto de transición fluida
          
          // Sección 1: Visible en el rango de scroll de 0 a 0.28
          if (s1) {
            if (scrollFraction <= 0.28) {
              const progress = scrollFraction / 0.28;
              const opacity = 1 - progress;
              const translateY = -progress * 60; // Desplazamiento hacia arriba
              s1.style.opacity = opacity.toString();
              s1.style.transform = `translateY(${translateY}px)`;
              s1.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
            } else {
              s1.style.opacity = "0";
              s1.style.transform = "translateY(-60px)";
              s1.style.pointerEvents = "none";
            }
          }

          // Sección 2: Visible en el rango de scroll de 0.28 a 0.65
          if (s2) {
            if (scrollFraction > 0.28 && scrollFraction <= 0.65) {
              // Transición de entrada (0.28 a 0.40)
              let opacity = 0;
              let translateY = 60;
              if (scrollFraction <= 0.40) {
                const rangeProgress = (scrollFraction - 0.28) / 0.12;
                opacity = rangeProgress;
                translateY = 60 - rangeProgress * 60;
              }
              // Mantener estable (0.40 a 0.52)
              else if (scrollFraction > 0.40 && scrollFraction <= 0.52) {
                opacity = 1;
                translateY = 0;
              }
              // Transición de salida (0.52 a 0.65)
              else {
                const rangeProgress = (scrollFraction - 0.52) / 0.13;
                opacity = 1 - rangeProgress;
                translateY = -rangeProgress * 60;
              }

              s2.style.opacity = opacity.toString();
              s2.style.transform = `translateY(${translateY}px)`;
              s2.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
            } else {
              s2.style.opacity = "0";
              s2.style.transform = "translateY(60px)";
              s2.style.pointerEvents = "none";
            }
          }

          // Sección 3: Visible en el rango de scroll de 0.65 a 1.0
          if (s3) {
            if (scrollFraction > 0.65) {
              // Transición de entrada (0.65 a 0.82)
              const rangeProgress = Math.min((scrollFraction - 0.65) / 0.17, 1);
              const opacity = rangeProgress;
              const translateY = 60 - rangeProgress * 60;

              s3.style.opacity = opacity.toString();
              s3.style.transform = `translateY(${translateY}px)`;
              s3.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
            } else {
              s3.style.opacity = "0";
              s3.style.transform = "translateY(60px)";
              s3.style.pointerEvents = "none";
            }
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Llamar una vez inicialmente para establecer opacidades y tiempos iniciales
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative min-h-[450vh] bg-slate-950 text-white select-none">
      {/* Contenedor de Video de Fondo Fijo */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          src={heroVideo}
          muted
          playsInline
          loop
          className="w-full h-full object-cover filter brightness-[0.35] contrast-[1.05]"
        />
        {/* Degradado y overlay de cuadrícula deportiva */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/90 z-1" />
        <div 
          className="absolute inset-0 opacity-[0.03] z-2" 
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />
      </div>

      {/* Indicador de scroll inicial */}
      <div
        ref={scrollIndicatorRef}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 opacity-100 transition-all pointer-events-none"
      >
        <span className="text-xs font-semibold tracking-widest text-yellow-500/80 uppercase">Desliza para explorar</span>
        <ChevronDown className="h-5 w-5 text-yellow-500 animate-bounce" />
      </div>

      {/* Contenedores de Secciones con Posición Fija */}
      <div className="fixed inset-0 w-full h-full flex items-center justify-center z-10 px-4 sm:px-6 pointer-events-none">
        
        {/* SECCIÓN 1: Legado Histórico */}
        <div
          ref={section1Ref}
          className="absolute max-w-4xl w-full text-center transition-all duration-75 ease-out opacity-100"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glassmorphism-light text-yellow-500 text-xs font-semibold uppercase tracking-wider mb-6 border border-yellow-500/20">
            <Trophy className="h-4 w-4" />
            La Gloria del Fútbol Mundial
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-none">
            LA HISTORIA SE ESCRIBE EN <br />
            <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              CADA SEGUNDO DE JUEGO
            </span>
          </h1>
          <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Explora las estadísticas de todas las ediciones de la Copa del Mundo. El legado de los campeones mundiales, revivido a través de un análisis de datos moderno.
          </p>
          
          {/* Tarjetas de Estadísticas Clave */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="glassmorphism p-5 rounded-xl text-center">
              <span className="block text-2xl sm:text-4xl font-extrabold text-yellow-500 mb-1">22</span>
              <span className="text-xs sm:text-sm text-gray-400 uppercase font-medium tracking-wide">Ediciones</span>
            </div>
            <div className="glassmorphism p-5 rounded-xl text-center">
              <span className="block text-2xl sm:text-4xl font-extrabold text-yellow-500 mb-1">80+</span>
              <span className="text-xs sm:text-sm text-gray-400 uppercase font-medium tracking-wide">Selecciones</span>
            </div>
            <div className="glassmorphism p-5 rounded-xl text-center">
              <span className="block text-2xl sm:text-4xl font-extrabold text-yellow-500 mb-1">2.5k+</span>
              <span className="text-xs sm:text-sm text-gray-400 uppercase font-medium tracking-wide">Goles</span>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Estadísticas H2H y Comparador */}
        <div
          ref={section2Ref}
          className="absolute max-w-4xl w-full text-center transition-all duration-75 ease-out opacity-0 pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glassmorphism-light text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6 border border-cyan-500/20">
            <BarChart3 className="h-4 w-4" />
            Análisis Estadístico
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            COMPARATIVAS <span className="text-cyan-400 font-black">HEAD-TO-HEAD</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed font-light">
            Enfréntate a la historia. Compara el rendimiento histórico de las mejores selecciones cara a cara, analizando la posesión, goles y efectividad.
          </p>

          {/* Tarjeta de Comparación Deportiva Premium */}
          <div className="glassmorphism max-w-2xl mx-auto rounded-2xl p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 via-yellow-500 to-amber-500" />
            
            {/* Header del Encro */}
            <div className="grid grid-cols-7 items-center justify-center mb-6">
              <div className="col-span-3 text-center sm:text-right">
                <span className="block font-black text-lg sm:text-xl tracking-wider text-white">ARGENTINA</span>
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">3 Títulos</span>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-bold text-gray-400">VS</span>
              </div>
              <div className="col-span-3 text-center sm:text-left">
                <span className="block font-black text-lg sm:text-xl tracking-wider text-white">FRANCIA</span>
                <span className="text-xs text-amber-500 font-bold uppercase tracking-widest">2 Títulos</span>
              </div>
            </div>

            {/* Barras de Atributo */}
            <div className="space-y-4">
              {/* Atributo 1: Goles */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1.5 px-1">
                  <span>152 Goles</span>
                  <span className="uppercase tracking-widest text-[10px]">Goles Totales</span>
                  <span>138 Goles</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden flex">
                  <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400" style={{ width: "52%" }}></div>
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 ml-auto" style={{ width: "48%" }}></div>
                </div>
              </div>

              {/* Atributo 2: Posesión */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1.5 px-1">
                  <span>56.8%</span>
                  <span className="uppercase tracking-widest text-[10px]">Posesión Promedio</span>
                  <span>52.4%</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden flex">
                  <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400" style={{ width: "58%" }}></div>
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 ml-auto" style={{ width: "42%" }}></div>
                </div>
              </div>

              {/* Atributo 3: Victorias H2H */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1.5 px-1">
                  <span>6 Victorias</span>
                  <span className="uppercase tracking-widest text-[10px]">Victorias Directas</span>
                  <span>3 Victorias</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden flex">
                  <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400" style={{ width: "67%" }}></div>
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 ml-auto" style={{ width: "33%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: Oráculo IA y Registro CTA */}
        <div
          ref={section3Ref}
          className="absolute max-w-4xl w-full text-center transition-all duration-75 ease-out opacity-0 pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glassmorphism-light text-yellow-500 text-xs font-semibold uppercase tracking-wider mb-6 border border-yellow-500/20">
            <Cpu className="h-4 w-4 text-yellow-500" />
            Recomendador Inteligente
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            PREDICCIONES DEL <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">ORÁCULO IA</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed font-light">
            Nuestro motor de IA procesa millones de datos históricos para generar predicciones detalladas sobre los ganadores y estadísticas clave de los próximos partidos.
          </p>

          {/* Tarjeta Simulación de IA */}
          <div className="glassmorphism max-w-md mx-auto rounded-2xl p-6 border border-white/5 mb-8 text-left relative overflow-hidden">
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/35 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Registrarse Gratis
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
