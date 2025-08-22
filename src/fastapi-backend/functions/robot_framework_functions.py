from os.path import exists
from os import remove
from pathlib import Path
from logger import logger
from robot.api import TestSuite
from robot.libdocpkg import LibraryDocumentation
from robocop.config import Config
from io import StringIO
from contextlib import redirect_stdout
from functions.gitlab_functions import get_file_content
from tempfile import NamedTemporaryFile
from exceptions import GenericError, GitlabHTTPAuthenticationError, GitlabHTTPNetworkError
import ast
import re

def get_safe_attribute(target: object, attribute: str) -> object:
    """
    Safely returns a given attribute value if it exists.

    Args:
        target (object): Targetted object.
        attribute (str): Attribute to get.

    Returns:
        object: Attribute value as a list or a string.

    Raises:
        GenericError: If any error happens.
    """
    list_attributes = ("args", "tags")
    try:
        value = getattr(target, attribute, None)
        if value is None:
            return [] if attribute in list_attributes else ""
        return list(value) if attribute in list_attributes else str(value)
    except Exception as e:
        raise GenericError(
            f"robot_framework_functions.get_safe_attribute: {type(e).__name__} -> {e}"
        )

def serialize_safe_keyword(keyword: object) -> dict:
    """
    Safely serializes a Robot Framework Keyword.

    Args:
        keyword: Keyword to serialize.
    
    Returns:
        dict: Serialized keyword.
    """
    return {
        "name": get_safe_attribute(keyword, "name"),
        "documentation": get_safe_attribute(keyword, "doc"),
        "arguments": [str(arg) for arg in getattr(keyword, "args", [])]
    }

def parse_robot_framework_file(file_content: str) -> dict:
    """
    Parses the content of a Robot Framework file.

    Args:
        file_content (str): File text content.

    Returns:
        dict: Dictionary of parsed data.

    Raises:
        GenericError: If any error happens.
    """
    try:
        test_suite = TestSuite.from_string(file_content)
        parsed_data = {
            "suite_documentation": get_safe_attribute(test_suite, "doc"),
            "suite_setup": get_safe_attribute(test_suite.setup, "name"),
            "suite_teardown": get_safe_attribute(test_suite.teardown, "name"),
            "imported_resources": [],
            "imported_libraries": [],
            "imported_variables": [],
            "created_variables": {},
            "created_test_cases": [],
            "created_keywords": []
        }
        for imported in test_suite.resource.imports:
            match imported.type:
                case "RESOURCE":
                    parsed_data["imported_resources"].append(imported.name)
                case "LIBRARY":
                    parsed_data["imported_libraries"].append(imported.name)
                case "VARIABLES":
                    parsed_data["imported_variables"].append(imported.name)
        for variable in test_suite.resource.variables:
            parsed_data["created_variables"][variable.name] = variable.value
        for test_case in test_suite.tests:
            parsed_data["created_test_cases"].append(
                {
                    "name": test_case.name,
                    "documentation": get_safe_attribute(test_case, "doc"),
                    "tags": get_safe_attribute(test_case, "tags"),
                    "setup": get_safe_attribute(test_case.setup, "name"),
                    "teardown": get_safe_attribute(test_case.teardown, "name")
                }
            )
        for keyword in test_suite.resource.keywords:
            parsed_data["created_keywords"].append(serialize_safe_keyword(keyword))
        return parsed_data
    except Exception as e:
        raise GenericError(
            f"robot_framework_functions.parse_robot_framework_file: {type(e).__name__} -> {e}"
        )

def check_content(file_name: str, file_content: str) -> list:
    """
    Performs a Robocop check on a Robot Framework file.

    Args:
        file_name (str): File name.
        file_content (str): File text content.

    Returns:
        list: List of Robocop messages.

    Raises:
        GenericError: If any error happens.
    """
    robocop_messages = []
    robocop = Robocop(Config())
    robocop.config.format = "{severity}:{line}:{col}:{desc}"
    buffer = StringIO()
    temp_file_path = None
    try:
        suffix = Path(file_name).suffix
        with NamedTemporaryFile(mode="w", encoding="utf-8", suffix=suffix, delete=False) as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name
        robocop.config.paths = [temp_file_path]
        with redirect_stdout(buffer):
            try:
                robocop.run()
            except SystemExit:
                pass
    except Exception as e:
            raise GenericError(
                f"robot_framework_functions.check_content: {type(e).__name__} -> {e}"
            )
    finally:
        if temp_file_path and exists(temp_file_path):
            remove(temp_file_path)
    for message in buffer.getvalue().splitlines():
        severity, line, col, desc = message.strip().split(":", 3)
        robocop_messages.append({
            "message_severity": severity,
            "line_number": int(line),
            "column_number": int(col),
            "message_description": desc
        })
    return robocop_messages

async def get_resources_keywords(
    gitlab_url: str,
    private_token: str,
    project_path: str,
    branch_name: str,
    resources: list
) -> list:
    """
    Gets keywords from resource files.

    Args:
        gitlab_url (str): GitLab repository URL.
        private_token (str): GitLab private token.
        project_path (str): GitLab project path.
        branch_name (str): GitLab branch name.
        resources (list): Resource file paths.

    Returns:
        list: List of retrieved keywords.

    Raises:
        GitlabHTTPAuthenticationError: If authentication fails.
        GitlabHTTPNetworkError: If GitLab URL is not reachable.    
    """
    retrieved_keywords = []
    for resource in resources:
        try:
            file_content = await get_file_content(
                gitlab_url,
                private_token,
                project_path,
                branch_name,
                resource
            )
            for keyword in TestSuite.from_string(file_content).resource.keywords:
                retrieved_keywords.append(serialize_safe_keyword(keyword))
        except (GitlabHTTPAuthenticationError, GitlabHTTPNetworkError):
            raise
        except Exception as e:
            logger.warning(
                f"robot_framework_functions.get_resources_keywords: {type(e).__name__} -> {e}"
            )
            continue
    return retrieved_keywords

def format_robot_keyword(name: str) -> str:
    """
    Formats Keyword names changing Python function names to separated words.

    Args:
        name (str): Python function name.

    Returns:
        str: Formatted Robot Framework Keyword name.
    """
    name = name.replace('_', ' ')
    name = re.sub(r'(?<=[a-z])([A-Z])', r' \1', name)
    return name.title()

def get_keywords_from_python(file_content: str) -> list:
    """
    Gets Robot Framework Keywords from a Python file functions.

    Args:
        file_content (str): Python file content.

    Returns:
        list: Found Keywords as a list of dictionaries (name, arguments, documentation).
    """
    keywords = []
    tree = ast.parse(file_content)
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and not node.name.startswith("_"):
            args = [arg.arg for arg in node.args.args if arg.arg != "self"]
            doc = (ast.get_docstring(node) or "").strip()
            keywords.append({
                "name": format_robot_keyword(node.name),
                "arguments": args,
                "documentation": doc
            })
    return keywords

async def get_libraries_keywords(
    gitlab_url: str,
    private_token: str,
    project_path: str,
    branch_name: str,
    libraries: list
) -> list:
    """
    Gets keywords from library files or names.

    Args:
        gitlab_url (str): GitLab repository URL.
        private_token (str): GitLab private token.
        project_path (str): GitLab project path.
        branch_name (str): GitLab branch name.
        libraries (list): Library names or file paths.

    Returns:
        list: List of retrieved keywords.

    Raises:
        GitlabHTTPAuthenticationError: If authentication fails.
        GitlabHTTPNetworkError: If GitLab URL is not reachable.    
    """
    retrieved_keywords = []
    for library in libraries:
        try:
            if library.endswith(".py"):
                file_content = await get_file_content(
                    gitlab_url,
                    private_token,
                    project_path,
                    branch_name,
                    library
                )
                keywords = get_keywords_from_python(file_content)
                retrieved_keywords.extend(keywords)
            elif "." in library:
                continue
            else:
                keywords = LibraryDocumentation(library).keywords
                for keyword in keywords:
                    retrieved_keywords.append(serialize_safe_keyword(keyword))
        except (GitlabHTTPAuthenticationError, GitlabHTTPNetworkError):
            raise
        except Exception as e:
            logger.warning(
                f"robot_framework_functions.get_libraries_keywords: {type(e).__name__} -> {e}"
            )
            continue
    return retrieved_keywords