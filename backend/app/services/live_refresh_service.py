import logging
import threading
from app.services.worldcup_sync_service import WorldCupSyncService

logger = logging.getLogger(__name__)


class LiveRefreshService:
    """
    Servicio de actualizacion en vivo para partidos del Mundial 2026.
    Fuente unica: ESPN API.
    - Intervalo base: 120s
    - Backoff exponencial en errores: 120s -> 300s -> 600s -> 900s max
    - Resetea a 120s tras 3 exitos consecutivos
    """

    BASE_INTERVAL = 120.0
    MAX_INTERVAL = 900.0
    BACKOFF_MULTIPLIER = 2.5
    SUCCESS_THRESHOLD = 3

    def __init__(self):
        self._timer = None
        self._running = False
        self.sync_service = WorldCupSyncService()
        self._current_interval = self.BASE_INTERVAL
        self._consecutive_successes = 0
        self._consecutive_failures = 0
        self._refresh_count = 0

    def start(self):
        if not self._running:
            self._running = True
            self._current_interval = self.BASE_INTERVAL
            self._consecutive_successes = 0
            self._consecutive_failures = 0
            print(f"[LiveRefresh] Iniciando servicio de actualizacion en vivo (intervalo: {self._current_interval:.0f}s)")
            logger.info("LiveRefreshService iniciado.")
            self._schedule_next()

    def stop(self):
        self._running = False
        if self._timer:
            self._timer.cancel()
            print("[LiveRefresh] Servicio detenido.")
            logger.info("LiveRefreshService detenido.")

    def _schedule_next(self):
        if self._running:
            self._timer = threading.Timer(self._current_interval, self._refresh)
            self._timer.daemon = True
            self._timer.start()

    def _refresh(self):
        self._refresh_count += 1
        print(f"[LiveRefresh] Refresh #{self._refresh_count} (intervalo: {self._current_interval:.0f}s)")

        try:
            result = self.sync_service.refresh_live_games()

            if result.get("success"):
                self._on_success(result)
            else:
                self._on_failure(result.get("error", "Unknown error"))
        except Exception as e:
            self._on_failure(str(e))
        finally:
            self._schedule_next()

    def _on_success(self, result):
        self._consecutive_successes += 1
        self._consecutive_failures = 0

        matches = result.get("matches", 0)
        print(f"[LiveRefresh] OK: {matches} partidos (ESPN). Exitos consecutivos: {self._consecutive_successes}")

        if (self._consecutive_successes >= self.SUCCESS_THRESHOLD
                and self._current_interval > self.BASE_INTERVAL):
            self._current_interval = self.BASE_INTERVAL
            print(f"[LiveRefresh] Intervalo restaurado a {self.BASE_INTERVAL:.0f}s.")

    def _on_failure(self, error_msg):
        self._consecutive_failures += 1
        self._consecutive_successes = 0

        old_interval = self._current_interval
        self._current_interval = min(
            self._current_interval * self.BACKOFF_MULTIPLIER,
            self.MAX_INTERVAL,
        )

        print(f"[LiveRefresh] FAIL #{self._consecutive_failures}: {error_msg}")
        print(f"[LiveRefresh] Backoff: {old_interval:.0f}s -> {self._current_interval:.0f}s")
        logger.warning(f"Refresh fallo ({self._consecutive_failures} consecutivos): {error_msg}")

    def get_status(self):
        return {
            "running": self._running,
            "interval": self._current_interval,
            "consecutive_successes": self._consecutive_successes,
            "consecutive_failures": self._consecutive_failures,
            "total_refreshes": self._refresh_count,
        }
