import pytest
from functions import robot_framework_functions
from exceptions import (
    GitlabHTTPAuthenticationError,
    GitlabHTTPNetworkError
)

# ------------------
# get_safe_attribute
# ------------------

def test_get_safe_attribute_valid():
    class ARandomClass():
        name = "John"
        age = 32
    random_object = ARandomClass()
    assert robot_framework_functions.get_safe_attribute(random_object, "name") == "John"
    assert robot_framework_functions.get_safe_attribute(random_object, "age") == "32"

def test_get_safe_attribute_invalid():
    class ARandomClass():
        name = "John"
        age = 32
    random_object = ARandomClass()
    assert robot_framework_functions.get_safe_attribute(random_object, "tags") == []
    assert robot_framework_functions.get_safe_attribute(random_object, "other_attribute") == ""

# ----------------------
# serialize_safe_keyword
# ----------------------

def test_serialize_safe_keyword_valid():
    class KW:
        def __init__(self):
            self.name = "Login"
            self.doc = "Enables user's login."
            self.args = ("username", "password")
    output = robot_framework_functions.serialize_safe_keyword(KW())
    assert output == {
        "name": "Login",
        "documentation": "Enables user's login.",
        "arguments": ["username", "password"]
    }

def test_serialize_safe_keyword_missing_attributes():
    class KW:
        def __init__(self):
            pass
    output = robot_framework_functions.serialize_safe_keyword(KW())
    assert output == {
        "name": "",
        "documentation": "",
        "arguments": []
    }

# --------------------------
# parse_robot_framework_file
# --------------------------

def test_parse_robot_framework_file_valid_file():
    file_content = """
*** Settings ***
Documentation       Suite documentation
Library             MyLibrary.py
Resource            MyResource.resource
Variables           MyVariables.py
Suite Setup         Setup Keyword
Suite Teardown      Teardown Keyword

*** Variables ***
${URL}              http://localhost
@{LIST}             a       b

*** Test Cases ***
My Test Case
    [Documentation]     Test Case Documentation
    [Tags]              tag1        tag2
    [Setup]             Setup
    [Teardown]          Teardown
    Log To Console      Hello world !

*** Keywords ***
Setup Keyword
    Log To Console      Setup

Teardown Keyword
    Log To Console      Teardown

My Keyword
    [Arguments]         ${a}
    Log To Console      ${a}    
"""
    output = robot_framework_functions.parse_robot_framework_file(file_content)
    assert output == {
        "suite_documentation": "Suite documentation",
        "suite_setup": "Setup Keyword",
        "suite_teardown": "Teardown Keyword",
        "imported_resources": ["MyResource.resource"],
        "imported_libraries": ["MyLibrary.py"],
        "imported_variables": ["MyVariables.py"],
        "created_variables": {
            "${URL}": ("http://localhost",),
            "@{LIST}": ("a", "b")
        },
        "created_test_cases": [
            {
                "name": "My Test Case",
                "documentation": "Test Case Documentation",
                "tags": ["tag1", "tag2"],
                "setup": "Setup",
                "teardown": "Teardown"
            }
        ],
        "created_keywords": [
            {
                "arguments": [],
                "documentation": "",
                "name": "Setup Keyword"
            },
            {
                "arguments": [],
                "documentation": "",
                "name": "Teardown Keyword"
            },
            {
                "arguments": ["a"],
                "name": "My Keyword",
                "documentation": "",
            }
        ]
    }

def test_parse_robot_framework_file_empty_file():
    file_content = ""
    output = robot_framework_functions.parse_robot_framework_file(file_content)
    assert output == {
        "suite_documentation": "",
        "suite_setup": "",
        "suite_teardown": "",
        "imported_resources": [],
        "imported_libraries": [],
        "imported_variables": [],
        "created_variables": {},
        "created_test_cases": [],
        "created_keywords": []
    }

# ----------------------
# get_resources_keywords
# ----------------------

@pytest.mark.asyncio
async def test_get_resources_keywords_with_mocked_file(monkeypatch):
    async def fake_get_file_content_function(
        gitlab_url,
        private_token,
        project_path,
        branch_name,
        resource
    ):
        return """
*** Keywords ***
A Keyword
    [Arguments]     ${arg}
    Log To Console      ${arg}
"""

    monkeypatch.setattr(
        "functions.robot_framework_functions.get_file_content",
        fake_get_file_content_function
    )

    output = await robot_framework_functions.get_resources_keywords(
        gitlab_url = "fake_url",
        private_token = "fake_private_token",
        project_path = "fake_project_path",
        branch_name = "fake_branch_name",
        resources = ["fake_resource"]
    )

    assert {
            "name": "A Keyword",
            "documentation": "",
            "arguments": ["arg"]
    } in output

@pytest.mark.asyncio
async def test_get_resources_keywords_with_authentication_error(monkeypatch):
    async def fake_get_file_content_function(
        gitlab_url,
        private_token,
        project_path,
        branch_name,
        resource
    ):
        raise GitlabHTTPAuthenticationError("Unable to authenticate with GitLab.")

    monkeypatch.setattr(
        "functions.robot_framework_functions.get_file_content",
        fake_get_file_content_function
    )

    with pytest.raises(GitlabHTTPAuthenticationError) as gae:
        await robot_framework_functions.get_resources_keywords(
            gitlab_url = "fake_url",
            private_token = "fake_private_token",
            project_path = "fake_project_path",
            branch_name = "fake_branch_name",
            resources = ["fake_resource"]
        )
    assert "Unable to authenticate with GitLab." in str(gae)

@pytest.mark.asyncio
async def test_get_resources_keywords_with_network_error(monkeypatch):
    async def fake_get_file_content_function(
        gitlab_url,
        private_token,
        project_path,
        branch_name,
        resource
    ):
        raise GitlabHTTPNetworkError("Unable to reach GitLab.")

    monkeypatch.setattr(
        "functions.robot_framework_functions.get_file_content",
        fake_get_file_content_function
    )

    with pytest.raises(GitlabHTTPNetworkError) as gae:
        await robot_framework_functions.get_resources_keywords(
            gitlab_url = "fake_url",
            private_token = "fake_private_token",
            project_path = "fake_project_path",
            branch_name = "fake_branch_name",
            resources = ["fake_resource"]
        )
    assert "Unable to reach GitLab." in str(gae)

# --------------------
# format_robot_keyword
# --------------------

def test_format_robot_keyword_valid():
    assert robot_framework_functions.format_robot_keyword("hello_world") == "Hello World"
    assert robot_framework_functions.format_robot_keyword("helloWorld") == "Hello World"
    assert robot_framework_functions.format_robot_keyword("HelloWorld") == "Hello World"
    assert robot_framework_functions.format_robot_keyword("Hello World") == "Hello World"

def test_format_robot_keyword_empty_input():
    assert robot_framework_functions.format_robot_keyword("") == ""

# ------------------------
# get_keywords_from_python
# ------------------------

def test_get_keywords_from_python_with_docstring():
    python_code = '''
def greet_user(name):
    """ Greets the user using its name. """
    print(f"Hello {name} !")
'''
    output = robot_framework_functions.get_keywords_from_python(python_code)
    assert output == [
        {
            "name": "Greet User",
            "arguments": ["name"],
            "documentation": "Greets the user using its name."
        }
    ]

def test_get_keywords_from_python_no_docstring():
    python_code = '''
def greet_user(name):
    print(f"Hello {name} !")
'''
    output = robot_framework_functions.get_keywords_from_python(python_code)
    assert output == [
        {
            "name": "Greet User",
            "arguments": ["name"],
            "documentation": ""
        }
    ]

def test_get_keywords_from_python_ignore_private_functions():
    python_code = '''
def _greet_user_privately(name):
    print(f"Hello {name} !")

def greet_user(name):
    print(f"Hello {name} !")
'''
    output = robot_framework_functions.get_keywords_from_python(python_code)
    assert output == [
        {
            "name": "Greet User",
            "arguments": ["name"],
            "documentation": ""
        }
    ]

def test_get_keywords_from_python_ignore_self():
    python_code = '''
def greet_user(self, name):
    print(f"Hello {name} !")
'''
    output = robot_framework_functions.get_keywords_from_python(python_code)
    assert output == [
        {
            "name": "Greet User",
            "arguments": ["name"],
            "documentation": ""
        }
    ]

# ----------------------
# get_libraries_keywords
# ----------------------

@pytest.mark.asyncio
async def test_get_libraries_keywords_with_mocked_file(monkeypatch):
    async def fake_get_file_content_function(
        gitlab_url,
        private_token,
        project_path,
        branch_name,
        library
    ):
        return '''
def greet_user(name):
    print(f"Hello {name} !")
'''

    monkeypatch.setattr(
        "functions.robot_framework_functions.get_file_content",
        fake_get_file_content_function
    )

    output = await robot_framework_functions.get_libraries_keywords(
        gitlab_url = "fake_url",
        private_token = "fake_private_token",
        project_path = "fake_project_path",
        branch_name = "fake_branch_name",
        libraries = ["fake_library.py"]
    )

    assert {
            "name": "Greet User",
            "documentation": "",
            "arguments": ["name"]
    } in output

@pytest.mark.asyncio
async def test_get_libraries_keywords_with_mocked_file_authentication_error(monkeypatch):
    async def fake_get_file_content_function(
        gitlab_url,
        private_token,
        project_path,
        branch_name,
        library
    ):
        raise GitlabHTTPAuthenticationError("Unable to authenticate with GitLab.")

    monkeypatch.setattr(
        "functions.robot_framework_functions.get_file_content",
        fake_get_file_content_function
    )

    with pytest.raises(GitlabHTTPAuthenticationError) as gae:
        await robot_framework_functions.get_libraries_keywords(
            gitlab_url = "fake_url",
            private_token = "fake_private_token",
            project_path = "fake_project_path",
            branch_name = "fake_branch_name",
            libraries = ["fake_library.py"]
        )
    assert "Unable to authenticate with GitLab." in str(gae)

@pytest.mark.asyncio
async def test_get_libraries_keywords_with_mocked_file_network_error(monkeypatch):
    async def fake_get_file_content_function(
        gitlab_url,
        private_token,
        project_path,
        branch_name,
        library
    ):
        raise GitlabHTTPNetworkError("Unable to reach GitLab.")

    monkeypatch.setattr(
        "functions.robot_framework_functions.get_file_content",
        fake_get_file_content_function
    )

    with pytest.raises(GitlabHTTPNetworkError) as gae:
        await robot_framework_functions.get_libraries_keywords(
            gitlab_url = "fake_url",
            private_token = "fake_private_token",
            project_path = "fake_project_path",
            branch_name = "fake_branch_name",
            libraries = ["fake_library.py"]
        )
    assert "Unable to reach GitLab." in str(gae)

@pytest.mark.asyncio
async def test_get_libraries_keywords_with_library_name(monkeypatch):
    class FakeKeyword:
        def __init__(self):
            self.name = "Fake Keyword"
            self.doc = ""
            self.args = ["arg1", "arg2"]

    class FakeLibraryDocumentation:
        def __init__(self, library_name):
            self.keywords = [FakeKeyword()]

    monkeypatch.setattr(
        "functions.robot_framework_functions.LibraryDocumentation",
        FakeLibraryDocumentation
    )

    output = await robot_framework_functions.get_libraries_keywords(
        gitlab_url = "fake_url",
        private_token = "fake_private_token",
        project_path = "fake_project_path",
        branch_name = "fake_branch_name",
        libraries = ["fake_library"]
    )

    assert {
            "name": "Fake Keyword",
            "documentation": "",
            "arguments": ["arg1", "arg2"]
    } in output