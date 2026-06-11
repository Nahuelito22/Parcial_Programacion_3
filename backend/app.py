from flask import Flask
from flask_cors import CORS
from app.routes.auth_routes import auth_bp
from app.routes.estadisticas_routes import estadisticas_bp

app = Flask(__name__)
CORS(app)

# Registrar Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(estadisticas_bp, url_prefix='/api')

@app.route('/')
def index():
    return {"message": "API Backend Mundial Web App - Estructura Base"}

if __name__ == '__main__':
    app.run(debug=True)


