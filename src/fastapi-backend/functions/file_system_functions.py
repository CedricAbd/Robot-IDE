from pathlib import Path
from json import load, dump
from exceptions import GenericError

def validate_templates(templates: list) -> None:
    """
    Validates a templates list format.

    Args:
        templates (list): Templates list.

    Raises:
        GenericError: If templates list is invalid.
    """
    if not all(
        isinstance(template, dict)
        and {"name", "content", "new_line"} <= template.keys()
        and isinstance(template["name"], str)
        and isinstance(template["content"], str)
        and isinstance(template["new_line"], bool)
        for template in templates
    ):
        raise GenericError(
            f"file_system_functions.validate_templates: Argument must be a list of dictionaries with proper keys and values."
        )

def read_templates(file_path: str) -> list:
    """
    Reads the templates from a JSON file.

    Args:
        file_path (str): Path to the JSON file to read.

    Returns:
        list: Templates as a list.

    Raises:
        GenericError: If any error happens.
    """
    try:
        with Path(file_path).open("r", encoding="utf-8") as file:
            templates = load(file)
            validate_templates(templates)
            return templates
    except FileNotFoundError:
        write_templates(file_path, [])
        return []
    except Exception as e:
        raise GenericError(
            f"file_system_functions.read_templates: {type(e).__name__} -> {e}"
        )

def write_templates(file_path: str, templates: list) -> None:
    """
    Writes templates in a JSON file.

    Args:
        file_path (str): Path to the JSON file to write.
        templates (list): Template dictionaries.

    Raises:
        GenericError: If any error happens.
    """
    try:
        validate_templates(templates)
        with Path(file_path).open("w", encoding="utf-8") as file:
            dump(templates, file, indent=2, ensure_ascii=False)
    except GenericError:
        raise
    except Exception as e:
        raise GenericError(
            f"file_system_functions.write_templates: {type(e).__name__} -> {e}"
        )

def add_template(
    file_path: str,
    template_name: str,
    template_content: str,
    new_line: bool
) -> None:
    """
    Adds a template to a JSON file.

    Args:
        file_path (str): Path to the JSON file to read and write.
        template_name (str): Name of the template to add.
        template_content (str): Content of the template to add.
        new_line (bool): Whether the template should start on a new line before insertion.

    Raises:
        GenericError: If any error happens. 
    """
    try:
        templates = read_templates(file_path)
        if any(template["name"] == template_name for template in templates):
            return
        templates.append(
            {
                "name": template_name,
                "content": template_content,
                "new_line": new_line
            }
        )
        write_templates(file_path, templates)
    except GenericError as ge:
        raise GenericError(
            f"file_system_functions.add_template: {type(ge).__name__} -> {ge}"
        )

def remove_template(file_path: str, template_name: str) -> None:
    """
    Removes a template from a JSON file.

    Args:
        file_path (str): Path to the JSON file to read and write.
        template_name (str): Name of the template to remove.

    Raises:
        GenericError: If any error happens.
    """
    try:
        templates = read_templates(file_path)
        updated_templates = []
        for template in templates:
            if template["name"] != template_name:
                updated_templates.append(template)
        write_templates(file_path, updated_templates)
    except GenericError as ge:
        raise GenericError(
            f"file_system_functions.remove_template: {type(ge).__name__} -> {ge}"
        )