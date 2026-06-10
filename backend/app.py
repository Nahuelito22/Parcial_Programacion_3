from flask import Flask
from flask_cors import CORS
from app.routes.auth_routes import auth_bp

app = Flask(__name__)
CORS(app)

# Registrar Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')

@app.route('/')
def index():
    return {"message": "API Backend Mundial Web App - Estructura Base"}

if __name__ == '__main__':
    app.run(debug=True)

