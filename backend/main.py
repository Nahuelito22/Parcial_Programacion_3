from flask import Flask
from flask_cors import CORS
from app.routes.auth_routes import auth_bp
from app.routes.estadisticas_routes import estadisticas_bp
from app.routes.admin_routes import admin_bp
from app.routes.h2h_routes import h2h_bp
from app.routes.rankings_routes import rankings_bp
from app.routes.oracle_routes import oracle_bp
from app.routes.fixture_2026_routes import fixture_2026_bp

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Registrar Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(estadisticas_bp, url_prefix='/api')
app.register_blueprint(admin_bp)
app.register_blueprint(h2h_bp, url_prefix='/api/h2h')
app.register_blueprint(rankings_bp, url_prefix='/api/rankings')
app.register_blueprint(oracle_bp, url_prefix='/api/oracle')
app.register_blueprint(fixture_2026_bp, url_prefix='/api/2026')



@app.route('/')
def index():
    return {"message": "API Backend Mundial Web App - Estructura Base"}

if __name__ == '__main__':
    app.run(debug=True)


