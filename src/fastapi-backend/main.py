from logger import logger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.gitlab_router import gitlab_router
from routers.robot_framework_router import robot_framework_router
from routers.file_system_router import file_system_router

def start_api() -> FastAPI:
    """
    Starts and configure the Robot-IDE backend API.

    Returns:
        FastAPI: The FastAPI instance.
    """
    logger.info("Starting Robot-IDE API.")
    api = FastAPI()
    api.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:4200",
        ],
        allow_credentials=True,
        allow_methods=["POST"],
        allow_headers=["*"],
    )
    api.include_router(gitlab_router)
    api.include_router(robot_framework_router)
    api.include_router(file_system_router)
    return api

if __name__ == "__main__":
    from uvicorn import run
    run(start_api(), host="0.0.0.0", port=8000)