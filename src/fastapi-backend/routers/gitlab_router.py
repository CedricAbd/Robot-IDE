from logger import logger
from fastapi import APIRouter, HTTPException
from asyncio import to_thread
from functions import gitlab_functions
from gitlab import GitlabAuthenticationError
from exceptions import (
    GenericError,
    GitlabHTTPAuthenticationError,
    GitlabHTTPNetworkError
)
from models.gitlab_models import (
    AuthenticateRequest,
    GetLastCommitIdRequest,
    GetBranchesListRequest,
    CheckFileExistenceRequest,
    GetFileContentRequest,
    GetProjectStructureRequest,
    GetRepositoryRobotFilesRequest,
    PushFileRequest,
    GetExecutableTestsRequest
)

gitlab_router = APIRouter()

@gitlab_router.post("/authenticate", tags=["GitLab routes"], status_code=204)
async def authenticate(request: AuthenticateRequest) -> None:
    """
    Asynchronously authenticates with GitLab.

    Args:
        request (AuthenticateRequest): Parameters as an object.

    Raises:
        HTTPException: 401 error if authentication fails.
    """
    try:
        await to_thread(
            gitlab_functions.authenticate,
            request.gitlab_url,
            request.private_token
        )
    except GitlabAuthenticationError as gae:
        logger.error(gae)
        raise HTTPException(status_code=401)
    except GenericError as ge:
        logger.error(ge)
        raise HTTPException(status_code=500)

@gitlab_router.post("/get_last_commit_id", tags=["GitLab routes"], status_code=200)
async def get_last_commit_id(request: GetLastCommitIdRequest) -> str:
    """
    Asynchronously gets the last commit id for a specific project in a specific branch.

    Args:
        request (GetLastCommitIdRequest): Parameters as an object.

    Returns:
        str: Last commit id.

    Raises:
        HTTPException: 401 error if authentication fails,
                       500 error if any other errors happens.
    """
    try:
        return await to_thread(
            gitlab_functions.get_last_commit_id,
            request.gitlab_url,
            request.private_token,
            request.project_path,
            request.branch_name
        )
    except GitlabAuthenticationError as gae:
        logger.error(gae)
        raise HTTPException(status_code=401)
    except GenericError as ge:
        logger.error(ge)
        raise HTTPException(status_code=500)

@gitlab_router.post("/check_file_existence", tags=["GitLab routes"], status_code=200)
async def check_file_existence(request: CheckFileExistenceRequest) -> dict:
    """
    Asynchronously checks that a file exists for a specific project in a specific branch.

    Args:
        request (CheckFileExistenceRequest): Parameters as an object.

    Returns:
        dict: Dictonary indicating if the file exist, its last commit date and author.

    Raises:
        HTTPException: 401 error if authentication fails.
                       500 error if any other errors happens.
    """
    try:
        return await to_thread(
            gitlab_functions.check_file_existence,
            request.gitlab_url,
            request.private_token,
            request.project_path,
            request.branch_name,
            request.file_path
        )
    except GitlabAuthenticationError as gae:
        logger.error(gae)
        raise HTTPException(status_code=401)
    except GenericError as ge:
        logger.error(ge)
        raise HTTPException(status_code=500)

@gitlab_router.post("/get_file_content", tags=["GitLab routes"], status_code=200)
async def get_file_content(request: GetFileContentRequest) -> str:
    """
    Asynchronously gets a GitLab file content.

    Args:
        request (GetFileContentRequest): Parameters as an object.

    Returns:
        str: File raw text content.

    Raises:
        HTTPException: 401 error if authentication fails,
                       503 error if GitLab is unreachable,
                       500 error if any other error happens
    """
    try:
        return await gitlab_functions.get_file_content(
            request.gitlab_url,
            request.private_token,
            request.project_path,
            request.branch_name,
            request.file_path
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

@gitlab_router.post("/get_project_structure", tags=["GitLab routes"], status_code=200)
async def get_project_structure(request: GetProjectStructureRequest) -> list:
    """
    Asynchronously gets a project structure for a specific branch.

    Args:
        request (GetProjectStructureRequest): Parameters as an object.

    Returns:
        list: List representing the project structure.

    Raises:
        HTTPException: 401 error if authentication fails,
                       500 error if any other error happens
    """
    try:
        return await to_thread(
            gitlab_functions.get_project_stucture,
            request.gitlab_url,
            request.private_token,
            request.project_path,
            request.branch_name,
        )
    except GitlabAuthenticationError as gae:
        logger.error(gae)
        raise HTTPException(status_code=401)
    except GenericError as ge:
        logger.error(ge)
        raise HTTPException(status_code=500)

@gitlab_router.post("/get_branches_list", tags=["GitLab routes"], status_code=200)
async def get_branches_list(request: GetBranchesListRequest) -> list:
    """
    Asynchronously gets the list of branches for a specific project.

    Args:
        request (GetBranchesListRequest): Parameters as an object.

    Returns:
        list: List of retrieved branches.

    Raises:
        HTTPException: 401 error if authentication fails,
                       500 error if any other error happens
    """
    try:
        return await to_thread(
            gitlab_functions.get_branches_list,
            request.gitlab_url,
            request.private_token,
            request.project_path
        )
    except GitlabAuthenticationError as gae:
        logger.error(gae)
        raise HTTPException(status_code=401)
    except GenericError as ge:
        logger.error(ge)
        raise HTTPException(status_code=500)

@gitlab_router.post("/get_repository_robot_files", tags=["GitLab routes"], status_code=200)
async def get_repository_robot_files(request: GetRepositoryRobotFilesRequest) -> dict:
    """
    Asynchronously gets .robot and .resource files on each branch for a specific project.

    Args:
        request (GetRepositoryRobotFilesRequest): Parameters as an object.

    Returns:
        dict: Dictionary of retrieved files and errors.

    Raises:
        HTTPException: 401 error if authentication fails,
    """
    try:
        return await to_thread(
            gitlab_functions.get_repository_robot_files,
            request.gitlab_url,
            request.private_token,
            request.project_paths
        )
    except GitlabAuthenticationError as gae:
        logger.error(gae)
        raise HTTPException(status_code=401)

@gitlab_router.post("/push_file", tags=["GitLab routes"], status_code=204)
async def push_file(request: PushFileRequest) -> None:
    """
    Asynchronously pushes a file on GitLab.

    Args:
        request (PushFileRequest): Parameters as an object.

    Raises:
        HTTPException: 401 error if authentication fails,
                       500 error if any other error happens
    """
    try:
        await to_thread(
            gitlab_functions.push_file,
            request.gitlab_url,
            request.private_token,
            request.project_path,
            request.branch_name,
            request.file_path,
            request.file_content
        )
    except GitlabAuthenticationError as gae:
        logger.error(gae)
        raise HTTPException(status_code=401)
    except GenericError as ge:
        logger.error(ge)
        raise HTTPException(status_code=500)

@gitlab_router.post("/get_executable_tests", tags=["GitLab routes"], status_code=200)
async def get_executable_tests(request: GetExecutableTestsRequest) -> list:
    """
    Asynchronously gets executable tests from GitLab.

    Args:
        request (GetExecutableTestsRequest): Parameters as an object.

    Returns:
        list: List of executable tests with their names, paths and tags.

    Raises:
        HTTPException: 401 error if authentication fails,
                       500 error if any other error happens
    """
    try:
        return await gitlab_functions.get_executable_tests(
            request.gitlab_url,
            request.private_token,
            request.project_path,
            request.branch_name
        )
    except GitlabAuthenticationError as gae:
        logger.error(gae)
        raise HTTPException(status_code=401)
    except GenericError as ge:
        logger.error(ge)
        raise HTTPException(status_code=500)