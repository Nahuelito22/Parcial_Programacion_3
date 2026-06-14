import os
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv

# Cargar variables de entorno buscando en directorios padres
# Funciona tanto si se arranca desde la raíz como desde la carpeta /backend
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

class Database:
    @staticmethod
    def get_connection(autocommit=True):
        """
        Retorna una conexión activa a la base de datos MySQL usando la configuración de .env.
        Utiliza el cursor tipo DictCursor para devolver filas como diccionarios.
        """
        host = os.getenv("MYSQL_HOST", "localhost")
        port = int(os.getenv("MYSQL_PORT", 3306))
        user = os.getenv("MYSQL_USER", "root")
        password = os.getenv("MYSQL_PASSWORD", "")
        database = os.getenv("MYSQL_DATABASE", "mundial_db")

        return pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            cursorclass=DictCursor,
            autocommit=autocommit
        )
