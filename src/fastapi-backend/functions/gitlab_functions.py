from logger import logger
from gitlab import Gitlab, GitlabAuthenticationError, GitlabGetError
from urllib.parse import quote
from httpx import AsyncClient, HTTPStatusError, RequestError
from exceptions import GenericError, GitlabHTTPAuthenticationError, GitlabHTTPNetworkError
from robot.api import get_model

def authenticate(gitlab_url: str, private_token: str) -> Gitlab:
    """
    Attempts authentication with GitLab.

    Args:
        gitlab_url (str): GitLab repository URL.
        private_token (str): GitLab private token.

    Returns:
        Gitlab: Authenticated connection.

    Raises:
        GitlabAuthenticationError: On authentication failure.
        GenericError: If any other error happens.
    """
    if not gitlab_url:
        raise GitlabAuthenticationError(
            f"gitlab_functions.authenticate: Unable to authenticate with GitLab."
        )
    try:
        connection = Gitlab(gitlab_url, private_token)
        connection.auth()
        return connection
    except GitlabAuthenticationError:
        raise GitlabAuthenticationError(
            f"gitlab_functions.authenticate: Unable to authenticate with GitLab."
        )
    except Exception as e:
        raise GenericError(
            f"gitlab_functions.authenticate: {type(e).__name__} -> {e}"
        )

def get_last_commit_id(gitlab_url: str, private_token: str, project_path: str, branch_name: str) -> str:
    """
    Gets the last commit id for a specific project, in a specific branch.

    Args:
        gitlab_url (str): GitLab repository URL.
        private_token (str): GitLab private token.
        project_path (str): GitLab project path.
        branch_name (str): GitLab branch name.

    Returns:
        str: Last commit id.

    Raises:
        GitlabAuthenticationError: If authentication fails.
        GenericError: If any other errors happens.
    """
    try:
        connection = authenticate(gitlab_url, private_token)
        project = connection.projects.get(project_path)
        last_commit = project.commits.list(ref_name=branch_name, per_page=1, get_all=True)[0]
        return last_commit.id
    except GitlabAuthenticationError:
        raise GitlabAuthenticationError(
            f"gitlab_functions.get_last_commit_id: Unable to authenticate with GitLab."
        )
    except Exception as e:
        raise GenericError(
            f"gitlab_functions.get_last_commit_id: {type(e).__name__} -> {e}"
        )

def check_file_existence(
    gitlab_url: str,
    private_token: str,
    project_path: str,
    branch_name: str,
    file_path: str
) -> dict:
    """
    Checks if a file exists on GitLab.

    Args:
        gitlab_url (str): GitLab repository URL.
        private_token (str): GitLab private token.
        project_path (str): GitLab project path.
        branch_name (str): GitLab branch name.
        file_path (str): Path to the file in the project.

    Returns:
        dict: Dictionary indicating file existence.

    Raises:
        GitlabAuthenticationError: If authentication fails.
        GenericError: If any other errors happens.
    """
    result = {"exists": False, "date": None, "author": None}
    try:
        connection = authenticate(gitlab_url, private_token)
        project = connection.projects.get(project_path, lazy = False)
        try:
            project.files.get(file_path=file_path, ref=branch_name)
        except GitlabGetError:
            return result
        commits = project.commits.list(
            query_parameters={
                "path": file_path,
                "ref_name": branch_name,
                "per_page": 1
            }
        )
        if commits:
            commit = commits[0]
            result.update(
                exists = True,
                date = commit.committed_date or commit.created_at,
                author = commit.author_name
            )
        else:
            result["exists"] = True
        return result
    except GitlabAuthenticationError:
        raise GitlabAuthenticationError(
            f"gitlab_functions.check_file_existence: Unable to authenticate with GitLab."
        )
    except Exception as e:
        raise GenericError(
            f"gitlab_functions.check_file_existence: {type(e).__name__} -> {e}"
        )

async def get_file_content(gitlab_url: str, private_token: str, project_path: str, branch_name: str, file_path: str) -> str:
    """
    Gets a file raw content from GitLab.

    Args:
        gitlab_url (str): GitLab repository URL.
        private_token (str): GitLab private token.
        project_path (str): GitLab project path.
        branch_name (str): GitLab branch name.
        file_path (str): Path to the file in the project.
    
    Returns:
        str: The file raw text content.

    Raises:
        GitlabHTTPAuthenticationError: If authentication fails.
        GitlabHTTPNetworkError: If GitLab URL is not reachable.
        GenericError: If any other error happens.
    """
    encoded_project_path = quote(project_path, safe='')
    encoded_file_path = quote(file_path, safe='')
    gitlab_url = f"{gitlab_url}/api/v4/projects/{encoded_project_path}/repository/files/{encoded_file_path}/raw"
    headers = {"PRIVATE-TOKEN": private_token}
    params = {"ref": branch_name}
    try:
        async with AsyncClient() as client:
            response = await client.get(gitlab_url, headers=headers, params=params)
            response.raise_for_status()
            return response.text
    except HTTPStatusError as error:
        status_code = error.response.status_code
        if status_code in (401, 403):
            raise GitlabHTTPAuthenticationError(
                f"gitlab_functions.get_file_content: Unable to authenticate with GitLab."
            )
        else:
            raise GenericError(
                f"gitlab_functions.get_file_content:  {type(error).__name__} -> {error}"
            )
    except RequestError as error:
        raise GitlabHTTPNetworkError(
            f"gitlab_functions.get_file_content: Network error connecting to {gitlab_url} -> {error}."
        )
    except Exception as e:
        raise GenericError(
            f"gitlab_functions.get_file_content:  {type(e).__name__} -> {e}"
        )

def get_project_structure(gitlab_url: str, private_token: str, project_path: str, branch_name: str) -> list:
    """
    Gets a project structure for a specific branch.

    Args:
        gitlab_url (str): GitLab repository URL.
        private_token (str): GitLab private token.
        project_path (str): GitLab project path.
        branch_name (str): GitLab branch name.
    
    Returns:
        list: Project structure as a list.

    Raises:
        GitlabAuthenticationError: If authentication fails.
        GenericError: If any other error happens.
    """
    try:
        connection = authenticate(gitlab_url, private_token)
        project = connection.projects.get(project_path)
        raw_structure = project.repository_tree(ref=branch_name, recursive=True, all=True)
        return [{"name": node["name"], "path": node["path"], "type": node["type"]} for node in raw_structure]
    except GitlabAuthenticationError:
        raise GitlabAuthenticationError(
            f"gitlab_functions.get_project_structure: Unable to authenticate with GitLab."
        )
    except Exception as e:
        raise GenericError(
            f"gitlab_functions.get_project_structure: {type(e).__name__} -> {e}"
        )

def get_repository_robot_files(gitlab_url: str, private_token: str, project_paths: list) -> dict:
    """
    Searches for .robot and .resource files for given GitLab projects.

    This function authenticates the user with the provided GitLab private token,
    then iterates through the projects and their branches to locate all files
    ending in .robot or .resource. It returns both the collected results and
    a dictionary of non-blocking errors encountered during the process.

    Args:
        gitlab_url (str): GitLab repository URL.
        private_token (str): GitLab private token.
        project_paths (list): GitLab project paths to explore.

    Returns:
        dict: Found data and errors.

    Raises:
        GitlabAuthenticationError: If authentication fails.
    """
    # Authenticates to GitLab.
    try:
        repository = authenticate(gitlab_url, private_token)
    except Exception as e:
        raise GitlabAuthenticationError(
            "gitlab_functions.get_repository_robot_files: Unable to authenticate with GitLab."
        )

    # Creates empty dictionaries to store the errors and the results (project_results dictionaries).
    errors = {}
    repository_results = {}

    # Iterates through each project path.
    for project_path in project_paths:
            # Gets the project for the current iteration.
            try:
                project = repository.projects.get(project_path)
            except Exception:
                errors[project_path] = (
                    f"gitlab_functions.get_repository_robot_files: Unable to get the {project_path} project, this project will be ignored."
                )
                continue

            # Creates an empty dictionary to store the project results for the current iteration.
            project_results = {}

            # Gets the project branches list for the current iteration.
            try:
                branches = project.branches.list(get_all=True)
            except Exception:
                errors[project_path] = (
                    f"gitlab_functions.get_repository_robot_files: Unable to get the {project_path} branches, this project will be ignored."
                )
                continue

            # Iterates through each branch.
            for branch in branches:
                # Gets the project content for the currently iterated branch.
                try:
                    branch_content = project.repository_tree(ref=branch.name, recursive=True, all=True)
                except Exception as e:
                    errors[project_path] = (
                        f"gitlab_functions.get_repository_robot_files: Unable to get the {branch.name} branch project content, this branch will be ignored."
                    )
                    continue

                # Creates an empty list to store the currently iterated branch results.
                robot_files = []

                # Iterates through each element of the current branch.
                for element in branch_content:
                    # Appends the .robot and .resource files project_path and path to the robot files list.
                    if element.get("type") == "blob" and (element["path"].endswith(".robot") or element["path"].endswith(".resource")):
                        robot_files.append({
                            "project_path": project_path,
                            "path": element["path"]
                        })

                # Adds the found files results to the project results dictionary.
                if robot_files:
                    project_results[branch.name] = robot_files
            # Adds the project results to the repository results dictionary.
            if project_results:
                repository_results[project.name] = project_results

    # Logs a warning if some projects or branches couldn't be processed and an info message otherwise.
    if errors:
        logger.warning(
            f"get_repository_robot_files: Partial success while searching the provided projects for .robot and .resource files. Errors: {str(errors)}."
        )
    else:
        logger.info(
            f"get_repository_robot_files: Successfully searched the provided projects to return found .robot and .resource files."
        )

    # Returns the results and the errors.    
    return {
        "data": repository_results,
        "errors": errors
    }

def get_branches_list(gitlab_url: str, private_token: str, project_path: str) -> list:
    """
    Gets the list of branches for a specific project.

    Args:
        gitlab_url (str): GitLab repository URL.
        private_token (str): GitLab private token.
        project_path (str): GitLab project path.
    
    Returns:
        list: Found branch names as a list.

    Raises:
        GitlabAuthenticationError: If authentication fails.
        GenericError: If any other error happens.
    """
    try:
        connection = authenticate(gitlab_url, private_token)
        project = connection.projects.get(project_path)
        branches = project.branches.list(get_all=True)
        return [branch.name for branch in branches]
    except GitlabAuthenticationError:
        raise GitlabAuthenticationError(
            f"gitlab_functions.get_branches_list: Unable to authenticate with GitLab."
        )
    except Exception as e:
        raise GenericError(
            f"gitlab_functions.get_branches_list: {type(e).__name__} -> {e}"
        )

def push_file(gitlab_url: str, private_token: str, project_path: str, branch_name: str, file_path: str, file_content: str) -> None:
    """
    Pushes a file on GitLab.

    Args:
        gitlab_url (str): GitLab repository URL.
        private_token (str): GitLab private token.
        project_path (str): GitLab project path.
        branch_name (str): GitLab branch name.
        file_path (str): Path to the file in the project.

    Raises:
        GitlabAuthenticationError: If authentication fails.
        GenericError: If any other error happens.
    """
    try:
        connection = authenticate(gitlab_url, private_token)
        project = connection.projects.get(project_path)
        try:
            file = project.files.get(file_path=file_path, ref=branch_name)
            file.content = file_content
            file.save(branch=branch_name, commit_message="Commit")
        except GitlabGetError:
            project.files.create({
                'file_path': file_path,
                'branch': branch_name,
                'content': file_content,
                'commit_message': "Commit"
            })
    except GitlabAuthenticationError:
        raise GitlabAuthenticationError(
            f"gitlab_functions.push_file: Unable to authenticate with GitLab."
        )
    except Exception as e:
        raise GenericError(
            f"gitlab_functions.push_file: {type(e).__name__} -> {e}"
        )

async def get_executable_tests(gitlab_url: str, private_token: str, project_path: str, branch_name: str) -> list:
    """
    Gets a list of executable tests in a specific project for a specific branch.

    Args:
        gitlab_url (str): GitLab repository URL.
        private_token (str): GitLab private token.
        project_path (str): GitLab project path.
        branch_name (str): GitLab branch name.

    Raises:
        GitlabAuthenticationError: If authentication fails.
        GenericError: If any other error happens.
    """
    try:
        connection = authenticate(gitlab_url, private_token)
        project = connection.projects.get(project_path)
        tree = project.repository_tree(ref=branch_name, recursive=True, all=True)
        results = []
        for node in tree:
            tags = []
            if node["type"] != "blob" or not node["path"].endswith(".robot"):
                continue
            try:
                content = await get_file_content(
                    gitlab_url,
                    private_token,
                    project_path,
                    branch_name,
                    node["path"]
                )
                model = get_model(content)
                suite_tags = []
                for section in model.sections:
                    if section.type == 'SETTING':
                        for statement in section.body:
                            if statement.type in ('SUITE TAGS', 'FORCE TAGS'):
                                suite_tags.extend(token.value for token in statement.tokens[1:])
                tags = list(set(tags + suite_tags))
            except:
                tags = []
            results.append(
                {
                    "name": node["name"],
                    "path": node["path"],
                    "tags": tags
                }
            )
        return results
    except GitlabAuthenticationError:
        raise GitlabAuthenticationError(
            f"gitlab_functions.get_executable_tests: Unable to authenticate with GitLab."
        )
    except Exception as e:
        raise GenericError(
            f"gitlab_functions.get_executable_tests: {type(e).__name__} -> {e}"
        )

def run_tests(
    gitlab_url: str,
    private_token: str,
    project_path: str,
    branch_name: str,
    platform: str,
    site: int,
    tests: list
) -> bool:
    """
    Run tests in a GitLab pipeline.

    Args:
        gitlab_url (str): GitLab repository URL.
        private_token (str): GitLab private token.
        project_path (str): GitLab project path.
        branch_name (str): GitLab branch name.
        platform (str): Target platform.
        site (int): Target site.
        tests (list): Tests to run.

    Raises:
        GitlabAuthenticationError: If authentication fails.
    """
    pass
