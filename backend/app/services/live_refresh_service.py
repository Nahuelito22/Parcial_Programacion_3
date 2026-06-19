import os
import logging
import threading
from app.services.worldcup_sync_service import WorldCupSyncService

logger = logging.getLogger(__name__)

class LiveRefreshService:
    def __init__(self):
        self._timer = None
        self._running = False
        # Instanciar el servicio de sincronización
        self.sync_service = WorldCupSyncService()

    def start(self):
        """
        Inicia el loop de refresco en vivo.
        """
        if not self._running:
            self._running = True
            print("[LiveRefreshService] Iniciando servicio de actualización en vivo cada 120s...")
            logger.info("Iniciando LiveRefreshService...")
            self._schedule_next()

    def stop(self):
        """
        Detiene el loop de refresco.
        """
        self._running = False
        if self._timer:
            self._timer.cancel()
            print("[LiveRefreshService] Servicio de actualización en vivo detenido.")
            logger.info("LiveRefreshService detenido.")

    def _schedule_next(self):
        if self._running:
            # Configurar temporizador a 120 segundos
            self._timer = threading.Timer(120.0, self._refresh)
            self._timer.daemon = True
            self._timer.start()

    def _refresh(self):
        """
        Llama a la actualización en vivo de partidos y se vuelve a programar.
        """
        print("[LiveRefreshService] Latido: actualizando partidos en vivo...")
        try:
            # Leer credenciales seguras de variables de entorno
            email = os.getenv("WORLDCUP_API_EMAIL")
            password = os.getenv("WORLDCUP_API_PASSWORD")
            
            # Ejecutar refresco rápido (únicamente get_games)
            result = self.sync_service.refresh_live_games(email, password)
            if result.get("success"):
                print(f"[LiveRefreshService] Latido exitoso: actualizados {result.get('matches')} partidos.")
                logger.info(f"Actualizados {result.get('matches')} partidos.")
            else:
                print(f"[LiveRefreshService] Latido fallido: {result.get('error')}")
                logger.warning(f"Error en refresco en vivo: {result.get('error')}")
        except Exception as e:
            print(f"[LiveRefreshService] Error inesperado en el latido: {e}")
            logger.error(f"Error inesperado en LiveRefreshService: {e}", exc_info=True)
        finally:
            # Reprogramar el siguiente ciclo
            self._schedule_next()
