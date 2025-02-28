import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes.roomRoute import router as room_router
from routes.accessRoute import router as access_router
from routes.authRoute import router as auth_router
from routes.repoRoute import router as repo_router
from routes.allRepos import router as arepo_router

from routes.addCollab import router as addCollab_router
from routes.roomRoute import router as room_router
from routes.accessRoute import router as access_router
from routes.versionRoute import router as version_router

load_dotenv()
app = FastAPI()

allowed_origin = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origin,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router, prefix="/auth")
app.include_router(repo_router, prefix="/repo")
app.include_router(arepo_router, prefix="/repo")
app.include_router(room_router, prefix="/room")
app.include_router(access_router, prefix="/access")
app.include_router(addCollab_router, prefix="/repo")
app.include_router(version_router, prefix="/version")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
