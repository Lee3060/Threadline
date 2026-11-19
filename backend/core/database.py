from extensions import db


def commit():
    """Commit, or roll back and re-raise so a failed request leaves nothing half saved."""
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise


def add(obj):
    db.session.add(obj)
    return obj


def delete(obj):
    db.session.delete(obj)
