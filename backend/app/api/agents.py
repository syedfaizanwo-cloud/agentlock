from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.agent import AgentCreate, AgentRead
from app.services import agent_service


router = APIRouter(
    prefix="/agents",
    tags=["Agents"],
)


@router.post(
    "",
    response_model=AgentRead,
    status_code=status.HTTP_201_CREATED,
)
def register_agent(
    payload: AgentCreate,
    db: Session = Depends(get_db),
):
    return agent_service.create_agent(db, payload)


@router.get(
    "",
    response_model=list[AgentRead],
)
def get_agents(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return agent_service.list_agents(db, skip=skip, limit=limit)


@router.get(
    "/{agent_id}",
    response_model=AgentRead,
)
def get_agent(
    agent_id: int = Path(gt=0),
    db: Session = Depends(get_db),
):
    agent = agent_service.get_agent(db, agent_id)

    if agent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    return agent


@router.delete(
    "/{agent_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def remove_agent(
    agent_id: int = Path(gt=0),
    db: Session = Depends(get_db),
):
    agent = agent_service.get_agent(db, agent_id)

    if agent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    agent_service.delete_agent(db, agent)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
