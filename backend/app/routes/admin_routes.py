from flask import Blueprint
from app.middlewares.auth_middleware import token_required, admin_required
from app.controllers.admin_controller import clear_database, import_csv_data, sync_api_data

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/clear-db', methods=['POST'])
@token_required
@admin_required
def clear_db():
    return clear_database()

@admin_bp.route('/import-csv', methods=['POST'])
@token_required
@admin_required
def import_csv():
    return import_csv_data()

@admin_bp.route('/sync-api', methods=['POST'])
@token_required
@admin_required
def sync_api():
    return sync_api_data()
