from logger import logger
from fastapi import APIRouter, HTTPException
from asyncio import to_thread
from functions import robot_framework_functions
from exceptions import (
    GenericError,
    GitlabHTTPAuthenticationError,
    GitlabHTTPNetworkError
)
from models.robot_framework_models import (
    ParseRobotFrameworkFileRequest,
    # CheckContentRequest,
    GetResourcesKeywordsRequest,
    GetLibrariesKeywordsRequest,
)

robot_framework_router = APIRouter()

@robot_framework_router.post("/parse_robot_framework_file", tags=["Robot Framework routes"], status_code=200)
async def parse_robot_framework_file(request: ParseRobotFrameworkFileRequest) -> dict:
    """
    Asynchronously parses a Robot Framework file.

    Args:
        request (ParseRobotFrameworkFileRequest): Parameters as an object.

    Returns:
        dict: Dictionary of parsed data.

    Raises:
        HTTPException: 500 error if any error happens.
    """
    try:
        return await to_thread(
            robot_framework_functions.parse_robot_framework_file,
            request.file_content
        )
    except GenericError as ge:
        logger.error(ge)
        raise HTTPException(status_code=500)

# ---------------------------------------------------------------------------
# CPYTHON ERROR WHILE PACKAGING THE BACKEND AS AN EXECUTABLE WITH PYINSTALLER
# ---------------------------------------------------------------------------
# @robot_framework_router.post("/check_content", tags=["Robot Framework routes"], status_code=200)
# async def check_content(request: CheckContentRequest) -> list:
#     """   
#     Asynchronously checks a Robot Framework file content.

#     Args:
#         request (CheckContentRequest): Parameters as an object.

#     Returns:
#         list: List of Robocop messages.

#     Raises:
#         HTTPException: 500 error if any error happens.
#     """
#     try:
#         return await to_thread(
#             robot_framework_functions.check_content,
#             request.file_name,
#             request.file_content
#         )
#     except GenericError as ge:
#         logger.error(ge)
#         raise HTTPException(status_code=500)

@robot_framework_router.post("/get_resources_keywords", tags=["Robot Framework routes"], status_code=200)
async def get_resources_keywords(request: GetResourcesKeywordsRequest) -> list:
    """
    Asynchronously gets keywords from resource files.

    Args:
        request (GetResourcesKeywordsRequest): Parameters as an object.

    Returns:
        list: List of retrieved keywords.

    Raises:
        HTTPException: 401 error if authentication fails,
                       503 error if GitLab is unreachable,
                       500 error if any other error happens
    """
    try:
        return await robot_framework_functions.get_resources_keywords(
            request.gitlab_url,
            request.private_token,
            request.project_path,
            request.branch_name,
            request.resources
        )
    except GitlabHTTPAuthenticationError as gae:
        logger.error(gae)
        raise HTTPException(status_code=401)
    except GitlabHTTPNetworkError as gne:
        logger.error(gne)
        raise HTTPException(status_code=503)
    except GenericError as ge:
        logger.error(ge)
        raise HTTPException(status_code=500)

@robot_framework_router.post("/get_libraries_keywords", tags=["Robot Framework routes"], status_code=200)
async def get_libraries_keywords(request: GetLibrariesKeywordsRequest) -> list:
    """
    Asynchronously gets keywords from library names or files.

    Args:
        request (GetLibrariesKeywordsRequest): Parameters as an object.

    Returns:
        list: List of retrieved keywords.

    Raises:
        HTTPException: 401 error if authentication fails,
                       503 error if GitLab is unreachable,
                       500 error if any other error happens
    """
    try:
        return await robot_framework_functions.get_libraries_keywords(
            request.gitlab_url,
            request.private_token,
            request.project_path,
            request.branch_name,
            request.libraries
        )
    except GitlabHTTPAuthenticationError as gae:
        logger.error(gae)
        raise HTTPException(status_code=401)
    except GitlabHTTPNetworkError as gne:
        logger.error(gne)
        raise HTTPException(status_code=503)
    except GenericError as ge:
        logger.error(ge)
        raise HTTPException(status_code=500)