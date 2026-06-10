from fastapi import WebSocket

class ConnectionManager:
    def __init__(self) -> None:
        self.active: dict[int, set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, task_id: int, user_email: str) -> None:
        await websocket.accept()
        self.active.setdefault(task_id, set()).add(websocket)

    def disconnect(self, websocket: WebSocket, task_id: int) -> None:
        connections = self.active.get(task_id)
        if not connections:
            return
        connections.discard(websocket)
        if not connections:
            del self.active[task_id]

    async def broadcast(self, task_id: int, message: dict) -> None:
        for connection in list(self.active.get(task_id, set())):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection, task_id)