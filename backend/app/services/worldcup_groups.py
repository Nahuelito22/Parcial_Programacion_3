"""
Official FIFA World Cup 2026 Group Assignments.
Source: FIFA Final Draw (May 5, 2026)
Total: 48 teams in 12 groups of 4.

Key: ESPN team abbreviation -> group letter
"""

# Groups by team abbreviation (FIFA code)
TEAM_TO_GROUP = {
    # Group A
    "MEX": "A", "CZE": "A", "RSA": "A", "KOR": "A",
    # Group B
    "CAN": "B", "BIH": "B", "QAT": "B", "SUI": "B",
    # Group C
    "BRA": "C", "HAI": "C", "MAR": "C", "SCO": "C",
    # Group D
    "USA": "D", "AUS": "D", "PAR": "D", "TUR": "D",
    # Group E
    "CUW": "E", "ECU": "E", "GER": "E", "CIV": "E",
    # Group F
    "NED": "F", "JPN": "F", "SWE": "F", "TUN": "F",
    # Group G
    "BEL": "G", "EGY": "G", "IRN": "G", "NZL": "G",
    # Group H
    "CPV": "H", "KSA": "H", "ESP": "H", "URU": "H",
    # Group I
    "FRA": "I", "NOR": "I", "SEN": "I", "IRQ": "I",
    # Group J
    "ALG": "J", "ARG": "J", "AUT": "J", "JOR": "J",
    # Group K
    "COL": "K", "JAM": "K", "POR": "K", "UZB": "K", "COD": "K",
    # Group L
    "CRO": "L", "ENG": "L", "GHA": "L", "PAN": "L",
}

# All group letters
GROUPS = list("ABCDEFGHIJKL")


def get_group_by_abbrev(abbrev):
    """Get group letter by FIFA abbreviation."""
    return TEAM_TO_GROUP.get(abbrev.upper())


def get_teams_in_group(group_letter):
    """Get all team abbreviations in a group."""
    return [abbr for abbr, grp in TEAM_TO_GROUP.items() if grp == group_letter.upper()]
