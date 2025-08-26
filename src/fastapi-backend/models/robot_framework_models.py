from pydantic import BaseModel, Field

class ParseRobotFrameworkFileRequest(BaseModel):
    """
    Request model to parse a Robot Framework file.
    """
    file_content: str = Field(..., description="File text content.")

class CheckContentRequest(BaseModel):
    """
    Request model to check a Robot Framework file syntax.
    """
    file_name: str = Field(..., description="File name.")
    file_content: str = Field(..., description="File text content.")

class GetResourcesKeywordsRequest(BaseModel):
    """
    Request model to get keywords from a list of resource file paths.
    """
    gitlab_url: str = Field(..., description="GitLab repository URL.")
    private_token: str = Field(..., description="GitLab private token.")
    project_path: str = Field(..., description="GitLab project path.")
    branch_name: str = Field(..., description="GitLab branch name.")
    resources: list = Field(..., description="Resource file paths.")

class GetLibrariesKeywordsRequest(BaseModel):
    """
    Request model to get keywords from a list of library names or file paths.
    """
    gitlab_url: str = Field(..., description="GitLab repository URL.")
    private_token: str = Field(..., description="GitLab private token.")
    project_path: str = Field(..., description="GitLab project path.")
    branch_name: str = Field(..., description="GitLab branch name.")
    libraries: list = Field(..., description="Library names or file paths.")