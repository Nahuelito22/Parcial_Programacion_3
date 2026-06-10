import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, BarChart3, Cpu, ChevronDown, Sparkles, TrendingUp } from "lucide-react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  // Referencias para la interpolación lineal (Lerp) / Scroll con inercia
  const targetFractionRef = useRef(0);
  const currentFractionRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Estados para la carga de fotogramas
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const TOTAL_FRAMES = 300;

  // Precarga de imágenes
  useEffect(() => {
    let loadedCount = 0;
    const tempImages: HTMLImageElement[] = [];

    // Bloquear el scroll del body al inicio
    document.body.style.overflow = "hidden";

    const handleImageLoad = () => {
      loadedCount++;
      setImagesLoaded(loadedCount);
      if (loadedCount >= TOTAL_FRAMES * 0.8) {
        setIsLoaded(true);
        document.body.style.overflow = "";
      }
    };

    const handleImageError = () => {
      // Si falla la carga de algún frame, lo contamos igual para evitar bloqueo
      loadedCount++;
      setImagesLoaded(loadedCount);
      if (loadedCount >= TOTAL_FRAMES * 0.8) {
        setIsLoaded(true);
        document.body.style.overflow = "";
      }
    };

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      // Construir el path con padStart para ezgif-frame-001.jpg hasta ezgif-frame-300.jpg
      img.src = `/frames/ezgif-frame-${String(i).padStart(3, "0")}.jpg`;
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      tempImages.push(img);
    }
    imagesRef.current = tempImages;

    return () => {
      // Liberar scroll en desmontaje
      document.body.style.overflow = "";
    };
  }, []);

  // Función para dibujar un fotograma con efecto "cover"
  const drawFrame = (fraction: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Rango 0.0 a 0.40 para la animación de la copa
    if (fraction <= 0.40) {
      const progress = fraction / 0.40;
      // Mapeo matemático del progreso (0 a 1) al índice del array (0 a 299)
      const imageIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES)));
      const img = imagesRef.current[imageIndex];

      if (img && img.complete) {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const imgWidth = img.naturalWidth || img.width;
        const imgHeight = img.naturalHeight || img.height;

        if (imgWidth > 0 && imgHeight > 0) {
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);

          const imgRatio = imgWidth / imgHeight;
          const canvasRatio = canvasWidth / canvasHeight;

          let drawWidth = canvasWidth;
          let drawHeight = canvasHeight;
          let offsetX = 0;
          let offsetY = 0;

          if (canvasRatio > imgRatio) {
            drawHeight = canvasWidth / imgRatio;
            offsetY = (canvasHeight - drawHeight) / 2;
          } else {
            drawWidth = canvasHeight * imgRatio;
            offsetX = (canvasWidth - drawWidth) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        }
      }
      canvas.style.opacity = "1";
    } else {
      // Mantener el último fotograma al pasarse de la sección del video
      const img = imagesRef.current[TOTAL_FRAMES - 1];
      if (img && img.complete) {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const imgWidth = img.naturalWidth || img.width;
        const imgHeight = img.naturalHeight || img.height;

        if (imgWidth > 0 && imgHeight > 0) {
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);

          const imgRatio = imgWidth / imgHeight;
          const canvasRatio = canvasWidth / canvasHeight;

          let drawWidth = canvasWidth;
          let drawHeight = canvasHeight;
          let offsetX = 0;
          let offsetY = 0;

          if (canvasRatio > imgRatio) {
            drawHeight = canvasWidth / imgRatio;
            offsetY = (canvasHeight - drawHeight) / 2;
          } else {
            drawWidth = canvasHeight * imgRatio;
            offsetX = (canvasWidth - drawWidth) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        }
      }

      // Transición de desvanecimiento suave del canvas (0.40 a 0.45)
      if (fraction <= 0.45) {
        const fadeProgress = (fraction - 0.40) / 0.05;
        canvas.style.opacity = (1 - fadeProgress).toString();
      } else {
        canvas.style.opacity = "0";
      }
    }
  };

  // Manejo de redimensionamiento responsivo
  useEffect(() => {
    if (!isLoaded) return;

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawFrame(currentFractionRef.current);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [isLoaded]);

  // Manejo de scroll e interpolación lineal (Lerp)
  useEffect(() => {
    if (!isLoaded) return;

    const updateInterpolatedElements = () => {
      const s1 = section1Ref.current;
      const s2 = section2Ref.current;
      const s3 = section3Ref.current;
      const indicator = scrollIndicatorRef.current;

      const diff = targetFractionRef.current - currentFractionRef.current;
      
      if (Math.abs(diff) > 0.0002) {
        currentFractionRef.current += diff * 0.08;
        animationFrameRef.current = requestAnimationFrame(updateInterpolatedElements);
      } else {
        currentFractionRef.current = targetFractionRef.current;
        animationFrameRef.current = null;
      }

      const fraction = currentFractionRef.current;

      // Dibujar fotograma
      drawFrame(fraction);

      // Desvanecer indicador inicial
      if (indicator) {
        const indOpacity = Math.max(0, 1 - fraction * 8);
        indicator.style.opacity = indOpacity.toString();
        indicator.style.transform = `translate(-50%, ${fraction * -35}px)`;
      }

      // Animaciones de secciones
      if (s1) {
        if (fraction >= 0.40 && fraction < 0.60) {
          const localProgress = (fraction - 0.40) / 0.20;
          let opacity = 0;
          let translateY = 50;

          if (localProgress <= 0.35) {
            const inProgress = localProgress / 0.35;
            opacity = inProgress;
            translateY = 50 - inProgress * 50;
          } else if (localProgress > 0.35 && localProgress <= 0.65) {
            opacity = 1;
            translateY = 0;
          } else {
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

      if (s2) {
        if (fraction >= 0.60 && fraction < 0.80) {
          const localProgress = (fraction - 0.60) / 0.20;
          let opacity = 0;
          let translateY = 50;

          if (localProgress <= 0.35) {
            const inProgress = localProgress / 0.35;
            opacity = inProgress;
            translateY = 50 - inProgress * 50;
          } else if (localProgress > 0.35 && localProgress <= 0.65) {
            opacity = 1;
            translateY = 0;
          } else {
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

      if (s3) {
        if (fraction >= 0.80) {
          const localProgress = Math.min((fraction - 0.80) / 0.20, 1);
          let opacity = 0;
          let translateY = 50;

          if (localProgress <= 0.50) {
            const inProgress = localProgress / 0.50;
            opacity = inProgress;
            translateY = 50 - inProgress * 50;
          } else {
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

      targetFractionRef.current = scrollFraction;

      if (animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(updateInterpolatedElements);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isLoaded]);

  // Si no está cargado el mínimo del 80%, renderizar la pantalla de carga premium
  if (!isLoaded) {
    const progressPercent = Math.round((imagesLoaded / TOTAL_FRAMES) * 100);
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 text-white select-none">
        <div className="flex flex-col items-center max-w-xs w-full px-4">
          <Trophy className="h-12 w-12 text-yellow-500 animate-pulse mb-6" />
          <h2 className="text-lg font-bold tracking-widest text-gray-200 uppercase mb-2">Preparando Experiencia</h2>
          <span className="text-xs text-yellow-500 font-mono mb-4">{progressPercent}%</span>
          
          {/* Barra de progreso */}
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/10">
            <div 
              className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[500vh] bg-black text-white select-none">
      
      {/* Contenedor de Canvas de Fondo Fijo */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover filter brightness-[0.4] contrast-[1.05] transition-opacity duration-75"
        />
        {/* Degradado y overlay oscuro */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/80 z-[1]" />
        <div 
          className="absolute inset-0 opacity-[0.03] z-[2]" 
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
          className="absolute max-w-4xl w-full text-center transition-all duration-75 ease-out opacity-0"
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
          className="absolute max-w-4xl w-full text-center transition-all duration-75 ease-out opacity-0"
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
          className="absolute max-w-4xl w-full text-center transition-all duration-75 ease-out opacity-0"
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
          className="pointer-events-auto w-full px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/35 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
        >
          Registrarse Gratis
        </Link>
        <Link
          to="/login"
          className="pointer-events-auto w-full px-8 py-3.5 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center cursor-pointer"
        >
          Iniciar Sesión
        </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
