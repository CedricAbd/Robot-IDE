from pydantic import BaseModel, Field

class ReadTemplatesRequest(BaseModel):
    """
    Request model to read templates from the templates file.
    """
    file_path: str = Field(..., description="Path to the JSON file to read.")

class AddTemplateRequest(BaseModel):
    """
    Request model to add a template to the templates file.
    """
    file_path: str = Field(..., description="Path to the JSON file to read and write.")
    template_name: str = Field(..., description="Name of the template to add.")
    template_content: str = Field(..., description="Content of the template to add.")
    new_line: bool = Field(..., description="Whether the template should start on a new line before insertion.")

class RemoveTemplateRequest(BaseModel):
    """
    Request model to remove a template from the templates file.
    """
    file_path: str = Field(..., description="Path to the JSON file to read and write.")
    template_name: str = Field(..., description="Name of the template to remove.")