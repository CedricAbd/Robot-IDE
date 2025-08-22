import pytest
from functions import file_system_functions
from exceptions import GenericError
from pathlib import Path
from json import dumps, loads

# ------------------
# validate_templates
# ------------------

def test_validate_templates_valid():
    assert file_system_functions.validate_templates([{"name": "a_name", "content": "text_content", "new_line": True}]) is None

@pytest.mark.parametrize(
    "invalid_parameters",
    [
        "Not a list",
        [{"content": "text content", "new_line": True}],
        [{"name": "template name", "new_line": True}],
        [{"name": "template name", "content": "text content"}],
        [{"name": 123, "content": "text content", "new_line": True}],
        [{"name": "template name", "content": 123, "new_line": True}],
        [{"name": "template name", "content": "text content", "new_line": 123}],
    ]
)
def test_validate_templates_invalid_parameters(invalid_parameters):
    with pytest.raises(GenericError):
        file_system_functions.validate_templates(invalid_parameters)

# --------------
# read_templates
# --------------

def test_read_templates_valid(tmp_path: Path):
    file = tmp_path / "templates.json"
    templates = [{"name": "a_name", "content": "text_content", "new_line": True}]
    file.write_text(dumps(templates), encoding = "utf-8")
    assert file_system_functions.read_templates(str(file)) == templates

def test_read_templates_invalid_path(tmp_path: Path):
    file = tmp_path / "invalid_path.json"
    with pytest.raises(GenericError) as ge:
        file_system_functions.read_templates(str(file))
    assert "FileNotFoundError" in str(ge.value)

def test_read_templates_invalid_format(tmp_path: Path):
    file = tmp_path / "templates.json"
    templates = ["{ name }"]
    file.write_text(dumps(templates), encoding = "utf-8")
    with pytest.raises(GenericError) as ge:
        file_system_functions.read_templates(str(file))
    assert "validate_templates" in str(ge.value)

# ---------------
# write_templates
# ---------------

def test_write_templates_valid(tmp_path: Path):
    file = tmp_path / "templates.json"
    templates = [
        {"name": "a_name_1", "content": "text_content", "new_line": True},
        {"name": "a_name_2", "content": "text_content", "new_line": True},
    ]
    file_system_functions.write_templates(str(file), templates)
    assert file_system_functions.read_templates(str(file)) == templates

def test_write_templates_invalid_format(tmp_path: Path):
    file = tmp_path / "templates.json"
    invalid_templates = [
        {"name": "a_name_1", "content": "text_content"},
        {"content": "text_content", "new_line": True},
    ]
    with pytest.raises(GenericError) as ge:
        file_system_functions.write_templates(str(file), invalid_templates)
    assert "validate_templates" in str(ge.value)

# -------------
# add_template
# -------------

def test_add_template_valid(tmp_path: Path):
    file = tmp_path / "templates.json"
    initial_templates = [{"name": "a_name_1", "content": "text_content", "new_line": True}]
    file.write_text(dumps(initial_templates), encoding = "utf-8")
    file_system_functions.add_template(str(file), "a_name_2", "text_content", False)
    templates = loads(file.read_text(encoding = "utf-8"))
    assert any(template["name"] == "a_name_2" for template in templates)
    assert len(templates) == 2

def test_add_template_already_existing(tmp_path: Path):
    file = tmp_path / "templates.json"
    initial_templates = [{"name": "a_name_1", "content": "text_content", "new_line": True}]
    file.write_text(dumps(initial_templates), encoding = "utf-8")
    file_system_functions.add_template(str(file), "a_name_1", "text_content", False)
    templates = loads(file.read_text(encoding = "utf-8"))
    assert templates == initial_templates

def test_add_template_invalid_path(tmp_path: Path):
    file = tmp_path / "invalid_path.json"
    with pytest.raises(GenericError) as ge:
        file_system_functions.add_template(str(file), "a_name_1", "text_content", False)
    assert "FileNotFoundError" in str(ge.value)

def test_add_template_invalid_format(tmp_path: Path):
    file = tmp_path / "templates.json"
    initial_templates = "{ name }"
    file.write_text(dumps(initial_templates), encoding = "utf-8")
    with pytest.raises(GenericError) as ge:
        file_system_functions.add_template(str(file), "a_name_1", "text_content", False)
    assert "validate_templates" in str(ge.value)

# ----------------
# remove_template
# ----------------

def test_remove_template_valid(tmp_path: Path):
    file = tmp_path / "templates.json"
    initial_templates = [
        {"name": "a_name_1", "content": "text_content", "new_line": True},
        {"name": "a_name_2", "content": "text_content", "new_line": True},
    ]
    file.write_text(dumps(initial_templates), encoding = "utf-8")
    file_system_functions.remove_template(str(file), "a_name_2")
    templates = loads(file.read_text(encoding = "utf-8"))
    assert not any(template["name"] == "a_name_2" for template in templates)
    assert len(templates) == 1

def test_remove_template_non_existing(tmp_path: Path):
    file = tmp_path / "templates.json"
    initial_templates = [{"name": "a_name_1", "content": "text_content", "new_line": True}]
    file.write_text(dumps(initial_templates), encoding = "utf-8")
    file_system_functions.remove_template(str(file), "a_name_3")
    templates = loads(file.read_text(encoding = "utf-8"))
    assert templates == initial_templates

def test_remove_template_invalid_path(tmp_path: Path):
    file = tmp_path / "invalid_path.json"
    with pytest.raises(GenericError) as ge:
        file_system_functions.remove_template(str(file), "a_name_1")
    assert "FileNotFoundError" in str(ge.value)

def test_remove_template_invalid_format(tmp_path: Path):
    file = tmp_path / "templates.json"
    initial_templates = "{ name }"
    file.write_text(dumps(initial_templates), encoding = "utf-8")
    with pytest.raises(GenericError) as ge:
        file_system_functions.remove_template(str(file), "a_name_1")
    assert "validate_templates" in str(ge.value)