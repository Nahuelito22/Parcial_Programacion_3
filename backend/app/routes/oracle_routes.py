from flask import Blueprint
from app.controllers.oracle_controller import OracleController

oracle_bp = Blueprint('oracle', __name__)

@oracle_bp.route('/equipos', methods=['GET'])
def get_teams():
    return OracleController.get_teams()

@oracle_bp.route('/methods', methods=['GET'])
def get_methods():
    return OracleController.get_methods()

@oracle_bp.route('/predict', methods=['POST'])
def predict():
    return OracleController.predict()
