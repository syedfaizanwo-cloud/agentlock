from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import Agent
from app.schemas.agent import AgentCreate


def create_agent(db: Session, agent_data: AgentCreate) -> Agent:
    agent = Agent(**agent_data.model_dump())

    try:
        db.add(agent)
        db.commit()
        db.refresh(agent)
        return agent
    except Exception:
        db.rollback()
        raise


def get_agent(db: Session, agent_id: int) -> Agent | None:
    return db.get(Agent, agent_id)


def list_agents(
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> list[Agent]:
    statement = (
        select(Agent)
        .order_by(Agent.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    return list(db.scalars(statement).all())


def delete_agent(db: Session, agent: Agent) -> None:
    try:
        db.delete(agent)
        db.commit()
    except Exception:
        db.rollback()
        raise
