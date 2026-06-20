import os
import ssl as _ssl
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv

# Cargar variables de entorno buscando en directorios padres
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

class Database:
    @staticmethod
    def get_connection(autocommit=True):
        """
        Retorna una conexión activa a la base de datos MySQL usando la configuración de .env.
        """
        host = os.getenv("MYSQL_HOST", "localhost")
        port = int(os.environ.get('MYSQL_PORT', 3306))
        user = os.getenv("MYSQL_USER", "root")
        password = os.getenv("MYSQL_PASSWORD", "")
        database = os.getenv("MYSQL_DATABASE", "mundial_db")

        # Configurar SSL para Aiven en Render
        # En local con MYSQL_SSL=false se desactiva SSL
        ssl_env = os.getenv("MYSQL_SSL", "true").lower()

        ssl_config = None
        if ssl_env != "false":
            # Crear contexto SSL sin verificar CA (necesario para Aiven en Render)
            ctx = _ssl.SSLContext(_ssl.PROTOCOL_TLS_CLIENT)
            ctx.check_hostname = False
            ctx.verify_mode = _ssl.CERT_NONE
            ssl_config = ctx

        return pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            cursorclass=DictCursor,
            autocommit=autocommit,
            ssl=ssl_config
        )
