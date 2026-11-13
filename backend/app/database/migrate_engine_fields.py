from sqlalchemy import text

from app.database.connection import engine


def migrate():
    with engine.begin() as connection:

        existing_tables = connection.exec_driver_sql(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ).scalars().all()

        if "attack_results" not in existing_tables:
            raise RuntimeError(
                "attack_results table does not exist."
            )

        columns = {
            row[1]
            for row in connection.exec_driver_sql(
                "PRAGMA table_info(attack_results)"
            ).all()
        }

        if "risk_score" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE attack_results "
                    "ADD COLUMN risk_score FLOAT"
                )
            )
            print("Added risk_score column.")

        else:
            print("risk_score already exists.")

        if "risk_rationale" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE attack_results "
                    "ADD COLUMN risk_rationale TEXT"
                )
            )
            print("Added risk_rationale column.")

        else:
            print("risk_rationale already exists.")

    print("ENGINE DATABASE MIGRATION: SUCCESS")


if __name__ == "__main__":
    migrate()
