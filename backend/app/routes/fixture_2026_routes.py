from flask import Blueprint
from app.middlewares.auth_middleware import token_required, admin_required
from app.controllers.fixture_2026_controller import (
    get_all_fixtures,
    get_fixture_by_id,
    get_all_teams,
    get_team_by_id,
    get_all_groups,
    get_all_stadiums,
    sync_2026,
    refresh_live_2026
)

fixture_2026_bp = Blueprint('fixture_2026', __name__)

@fixture_2026_bp.route('/', methods=['GET'])
@fixture_2026_bp.route('/fixtures', methods=['GET'])
def get_fixtures():
    return get_all_fixtures()

@fixture_2026_bp.route('/fixtures/<fixture_id>', methods=['GET'])
def get_fixture(fixture_id):
    return get_fixture_by_id(fixture_id)

@fixture_2026_bp.route('/teams', methods=['GET'])
def get_teams():
    return get_all_teams()

@fixture_2026_bp.route('/teams/<team_id>', methods=['GET'])
def get_team(team_id):
    return get_team_by_id(team_id)

@fixture_2026_bp.route('/groups', methods=['GET'])
def get_groups():
    return get_all_groups()

@fixture_2026_bp.route('/stadiums', methods=['GET'])
def get_stadiums():
    return get_all_stadiums()

@fixture_2026_bp.route('/sync', methods=['POST'])
@token_required
@admin_required
def sync():
    return sync_2026()

@fixture_2026_bp.route('/refresh-live', methods=['POST'])
@token_required
@admin_required
def refresh_live():
    return refresh_live_2026()
