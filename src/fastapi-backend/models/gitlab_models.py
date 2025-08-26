from pydantic import BaseModel, Field

class AuthenticateRequest(BaseModel):
    """
    Request model to authenticate with GitLab.
    """
    gitlab_url: str = Field(..., description="GitLab repository URL.")
    private_token: str = Field(..., description="GitLab private token.")

class GetLastCommitIdRequest(BaseModel):
    """
    Request model to get the last commit ID in a specific project, in a specific branch.
    """
    gitlab_url: str = Field(..., description="GitLab repository URL.")
    private_token: str = Field(..., description="GitLab private token.")
    project_path: str = Field(..., description="GitLab project path.")
    branch_name: str = Field(..., description="GitLab branch name.")

class GetFileContentRequest(BaseModel):
    """
    Request model to get the content of a file from GitLab.
    """
    gitlab_url: str = Field(..., description="GitLab repository URL.")
    private_token: str = Field(..., description="GitLab private token.")
    project_path: str = Field(..., description="GitLab project path.")
    branch_name: str = Field(..., description="GitLab branch name.")
    file_path: str = Field(..., description="Path to the file in the project.")

class CheckFileExistenceRequest(BaseModel):
    """
    Request model to check if a file exists in a specific project, in a specific branch.
    """
    gitlab_url: str = Field(..., description="GitLab repository URL.")
    private_token: str = Field(..., description="GitLab private token.")
    project_path: str = Field(..., description="GitLab project path.")
    branch_name: str = Field(..., description="GitLab branch name.")
    file_path: str = Field(..., description="Path to the file in the project.")

class GetProjectStructureRequest(BaseModel):
    """
    Request model to get the project structure for a specific branch.
    """
    gitlab_url: str = Field(..., description="GitLab repository URL.")
    private_token: str = Field(..., description="GitLab private token.")
    project_path: str = Field(..., description="GitLab project path.")
    branch_name: str = Field(..., description="GitLab branch name.")

class GetBranchesListRequest(BaseModel):
    """
    Request model to get the list of branches in a specific project.
    """
    gitlab_url: str = Field(..., description="GitLab repository URL.")
    private_token: str = Field(..., description="GitLab private token.")
    project_path: str = Field(..., description="GitLab project path.")

class GetRepositoryRobotFilesRequest(BaseModel):
    """
    Request model to get .robot and .resource files for each branch of the specified projects.
    """
    gitlab_url: str = Field(..., description="GitLab repository URL.")
    private_token: str = Field(..., description="GitLab private token.")
    project_paths: list = Field(..., description="GitLab project paths to explore.")

class PushFileRequest(BaseModel):
    """
    Request model to push a file to GitLab.
    """
    gitlab_url: str = Field(..., description="GitLab repository URL.")
    private_token: str = Field(..., description="GitLab private token.")
    project_path: str = Field(..., description="GitLab project path.")
    branch_name: str = Field(..., description="GitLab branch name.")
    file_path: str = Field(..., description="Path to the file in the project.")
    file_content: str = Field(..., description="File text content.")

class GetExecutableTestsRequest(BaseModel):
    """
    Request model to get the list of executable tests in a specific project, in a specific branch.
    """
    gitlab_url: str = Field(..., description="GitLab repository URL.")
    private_token: str = Field(..., description="GitLab private token.")
    project_path: str = Field(..., description="GitLab project path.")
    branch_name: str = Field(..., description="GitLab branch name.")

class RunTestsRequest(BaseModel):
    """
    Request model to run tests in a GitLab pipeline.
    """
    gitlab_url: str = Field(..., description="GitLab repository URL.")
    private_token: str = Field(..., description="GitLab private token.")
    project_path: str = Field(..., description="GitLab project path.")
    branch_name: str = Field(..., description="GitLab branch name.")
    platform: str = Field(..., description="Target platform.")
    site: int = Field(..., description="Target site.")
    tests: list = Field(..., description="Tests to run.")
