# todo-projects-app

Built by Forge AI Agents.

A todo app with user auth and projects

## Run with Docker
```bash
docker-compose up
```

## QA
```json
{
  "approved": false,
  "issues": [
    "CRITICAL — task.updated_at not auto-updating on UPDATE: SQLAlchemy `onupdate=func.now()` does not fire on in-place attribute mutations unless `db.commit()` triggers a proper UPDATE statement; with SQLite (common in dev) `func.now()` is evaluated at DDL time, not runtime. Should use Python-side `datetime.utcnow` via `default` + explicit assignment in the update endpoint for reliability.",
    "CRITICAL — `get_tasks` endpoint declares `current_user