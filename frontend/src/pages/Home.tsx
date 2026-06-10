import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Trophy, BarChart3, Cpu, ChevronDown, Sparkles, TrendingUp } from "lucide-react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  // Referencias para la interpolación lineal (Lerp) / Scroll con inercia
  const targetFractionRef = useRef(0);
  const currentFractionRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }

    // Función que corre en el requestAnimationFrame para suavizar todo el flujo
    const updateInterpolatedElements = () => {
      const video = videoRef.current;
      const s1 = section1Ref.current;
      const s2 = section2Ref.current;
      const s3 = section3Ref.current;
      const indicator = scrollIndicatorRef.current;

      if (!video) return;

      // =========================================================================
      // AJUSTES DE FLUIDEZ Y FÍSICA DE SCROLL (Lerp / Inercia)
      // =========================================================================
      // 
      // 1. FACTOR DE SUAVIZADO (Inercia): Actualmente 0.08.
      //    - Si disminuyes este valor (ej: 0.04, 0.02), el video se desplazará de forma 
      //      MUCHO más lenta, suave e integrada, ideal si el video va en pequeños saltos.
      //    - Si lo aumentas (ej: 0.15, 0.20), el video responderá de forma más instantánea
      //      y rápida a tus dedos/rueda de mouse, pero amortiguará menos los tirones.
      const LERP_FACTOR = 0.08; 

      // 2. UMBRAL DE ESTABILIZACIÓN: Actualmente 0.0002.
      //    - Define qué tan cerca de su destino real se considera que la animación
      //      ya terminó. Si aumentas este valor (ej: 0.005), la animación se detendrá
      //      de golpe al final (salto brusco). Mantenerlo muy pequeño asegura un frenado suave.
      const STABILIZATION_THRESHOLD = 0.0002; 
      // =========================================================================

      const diff = targetFractionRef.current - currentFractionRef.current;
      
      if (Math.abs(diff) > STABILIZATION_THRESHOLD) {
        currentFractionRef.current += diff * LERP_FACTOR;
        // Continuar el bucle de animación
        animationFrameRef.current = requestAnimationFrame(updateInterpolatedElements);
      } else {
        // Estabilizar al llegar al destino y detener el bucle para ahorrar CPU
        currentFractionRef.current = targetFractionRef.current;
        animationFrameRef.current = null;
      }

      const fraction = currentFractionRef.current;

      // 1. Scrubbing del Video (Fase de 0.0 a 0.40)
      if (fraction <= 0.40) {
        const videoProgress = fraction / 0.40;
        const duration = video.duration && isFinite(video.duration) ? video.duration : 10;
        video.currentTime = Math.max(0, Math.min(duration - 0.05, videoProgress * duration));
        video.style.opacity = "1";
      } else {
        const duration = video.duration && isFinite(video.duration) ? video.duration : 10;
        video.currentTime = duration - 0.05;
        
        // Transición suave de desvanecimiento del video de 0.40 a 0.45
        if (fraction <= 0.45) {
          const fadeProgress = (fraction - 0.40) / 0.05;
          video.style.opacity = (1 - fadeProgress).toString();
        } else {
          video.style.opacity = "0";
        }
      }

      // 2. Animar el indicador de scroll inicial
      if (indicator) {
        const indOpacity = Math.max(0, 1 - fraction * 8);
        indicator.style.opacity = indOpacity.toString();
        indicator.style.transform = `translate(-50%, ${fraction * -35}px)`;
      }

      // 3. Animación de Secciones (de 0.40 a 1.0) con inercia coordinada
      
      // Sección 1: KPIs (rango 0.40 a 0.60)
      if (s1) {
        if (fraction >= 0.40 && fraction < 0.60) {
          const localProgress = (fraction - 0.40) / 0.20;
          let opacity = 0;
          let translateY = 50;

          if (localProgress <= 0.35) { // Entrada
            const inProgress = localProgress / 0.35;
            opacity = inProgress;
            translateY = 50 - inProgress * 50;
          } else if (localProgress > 0.35 && localProgress <= 0.65) { // Estable
            opacity = 1;
            translateY = 0;
          } else { // Salida
            const outProgress = (localProgress - 0.65) / 0.35;
            opacity = 1 - outProgress;
            translateY = -outProgress * 50;
          }

          s1.style.opacity = opacity.toString();
          s1.style.transform = `translateY(${translateY}px)`;
          s1.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
        } else {
          s1.style.opacity = "0";
          s1.style.transform = fraction >= 0.60 ? "translateY(-50px)" : "translateY(50px)";
          s1.style.pointerEvents = "none";
        }
      }

      // Sección 2: Comparativa H2H (rango 0.60 a 0.80)
      if (s2) {
        if (fraction >= 0.60 && fraction < 0.80) {
          const localProgress = (fraction - 0.60) / 0.20;
          let opacity = 0;
          let translateY = 50;

          if (localProgress <= 0.35) { // Entrada
            const inProgress = localProgress / 0.35;
            opacity = inProgress;
            translateY = 50 - inProgress * 50;
          } else if (localProgress > 0.35 && localProgress <= 0.65) { // Estable
            opacity = 1;
            translateY = 0;
          } else { // Salida
            const outProgress = (localProgress - 0.65) / 0.35;
            opacity = 1 - outProgress;
            translateY = -outProgress * 50;
          }

          s2.style.opacity = opacity.toString();
          s2.style.transform = `translateY(${translateY}px)`;
          s2.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
        } else {
          s2.style.opacity = "0";
          s2.style.transform = fraction >= 0.80 ? "translateY(-50px)" : "translateY(50px)";
          s2.style.pointerEvents = "none";
        }
      }

      // Sección 3: Oráculo IA (rango 0.80 a 1.0)
      if (s3) {
        if (fraction >= 0.80) {
          const localProgress = Math.min((fraction - 0.80) / 0.20, 1);
          let opacity = 0;
          let translateY = 50;

          if (localProgress <= 0.50) { // Entrada
            const inProgress = localProgress / 0.50;
            opacity = inProgress;
            translateY = 50 - inProgress * 50;
          } else { // Estable hasta el final
            opacity = 1;
            translateY = 0;
          }

          s3.style.opacity = opacity.toString();
          s3.style.transform = `translateY(${translateY}px)`;
          s3.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
        } else {
          s3.style.opacity = "0";
          s3.style.transform = "translateY(50px)";
          s3.style.pointerEvents = "none";
        }
      }
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = docHeight > 0 ? scrollTop / docHeight : 0;

      // Actualizar el objetivo al que queremos llegar (target)
      targetFractionRef.current = scrollFraction;

      // Iniciar el bucle de animación bajo demanda si no está corriendo actualmente
      if (animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(updateInterpolatedElements);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Disparar inicialmente para posicionar los elementos
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    // =========================================================================
    // 3. ALTURA TOTAL DE SCROLL (Recorrido Físico): Actualmente min-h-[500vh].
    //    - Si la aumentas (ej: min-h-[700vh] o [800vh]), el scroll durará más y la
    //      reproducción del video irá mucho más lenta y suave por cada píxel de scroll, 
    //      haciendo que el deslizamiento muy lento sea extremadamente granular y fluido.
    //    - Si la disminuyes (ej: min-h-[350vh]), la reproducción irá muy rápida y
    //      hará saltos más grandes por píxel de scroll.
    // =========================================================================
    <div className="relative min-h-[500vh] bg-black text-white select-none">
      
      {/* Contenedor de Video de Fondo Fijo */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          src="/hero-scroll.mp4"
          muted
          playsInline
          className="w-full h-full object-cover filter brightness-[0.4] contrast-[1.05]"
        />
        {/* Degradado y overlay oscuro */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/80 z-1" />
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

      {/* Secciones fijas superpuestas que se animan con el scroll */}
      <div className="fixed inset-0 w-full h-full flex items-center justify-center z-10 px-4 sm:px-6 pointer-events-none">
        
        {/* BLOQUE 1: KPIs y Título */}
        <div
          ref={section1Ref}
          className="absolute max-w-4xl w-full text-center transition-all duration-75 ease-out opacity-0 pointer-events-none"
        >
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
          <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Explora las estadísticas de todas las ediciones de la Copa del Mundo. El legado de los campeones mundiales, revivido a través de un análisis de datos moderno.
          </p>
          
          {/* Tarjetas de KPIs */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
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
        </div>

        {/* BLOQUE 2: Comparativa Head-to-Head */}
        <div
          ref={section2Ref}
          className="absolute max-w-4xl w-full text-center transition-all duration-75 ease-out opacity-0 pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6 border border-cyan-500/10">
            <BarChart3 className="h-4 w-4" />
            Análisis Estadístico
          </div>
          <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            COMPARATIVAS <span className="text-cyan-400 font-black">HEAD-TO-HEAD</span>
          </h3>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed font-light">
            Enfréntate a la historia. Compara el rendimiento histórico de las mejores selecciones cara a cara, analizando la posesión, goles y efectividad.
          </p>

          {/* Tarjeta Comparador Premium */}
          <div className="glassmorphism max-w-2xl mx-auto rounded-2xl p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 via-yellow-500 to-amber-500" />
            
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

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1.5 px-1">
                  <span>152 Goles</span>
                  <span className="uppercase tracking-widest text-[9px] text-gray-500 font-bold">Goles Totales</span>
                  <span>138 Goles</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
                  <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400" style={{ width: "52%" }}></div>
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 ml-auto" style={{ width: "48%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1.5 px-1">
                  <span>56.8%</span>
                  <span className="uppercase tracking-widest text-[9px] text-gray-500 font-bold">Posesión Promedio</span>
                  <span>52.4%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
                  <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400" style={{ width: "58%" }}></div>
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 ml-auto" style={{ width: "42%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1.5 px-1">
                  <span>6 Victorias</span>
                  <span className="uppercase tracking-widest text-[9px] text-gray-500 font-bold">Victorias Directas</span>
                  <span>3 Victorias</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
                  <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400" style={{ width: "67%" }}></div>
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 ml-auto" style={{ width: "33%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BLOQUE 3: Oráculo IA y CTA */}
        <div
          ref={section3Ref}
          className="absolute max-w-4xl w-full text-center transition-all duration-75 ease-out opacity-0 pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 text-yellow-500 text-xs font-semibold uppercase tracking-wider mb-6 border border-yellow-500/10">
            <Cpu className="h-4 w-4 text-yellow-500" />
            Recomendador Inteligente
          </div>
          <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            PREDICCIONES DEL <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">ORÁCULO IA</span>
          </h3>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed font-light">
            Nuestro motor de IA procesa millones de datos históricos para generar predicciones detalladas sobre los ganadores y estadísticas clave de los próximos partidos.
          </p>

          {/* Tarjeta Oráculo IA */}
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
        </div>

      </div>
    </div>
  );
}
