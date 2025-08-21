from logger import logger
from fastapi import APIRouter, HTTPException
from asyncio import to_thread
from functions import file_system_functions
from exceptions import GenericError
from models.file_system_models import (
    ReadTemplatesRequest,
    AddTemplateRequest,
    RemoveTemplateRequest
)

file_system_router = APIRouter()

@file_system_router.post("/read_templates", tags=["File system routes"], status_code=200)
async def read_templates(request: ReadTemplatesRequest) -> list:
    """
    Asynchronously gets templates from the templates file.

    Args:
        request (ReadTemplatesRequest): Parameters as an object.

    Returns:
        list: Templates as a list.

    Raises:
        HTTPException: 500 error if any error happens.
    """
    try:
        return await to_thread(
            file_system_functions.read_templates,
            request.file_path
        )
    except GenericError as ge:
        logger.error(ge)
        raise HTTPException(status_code=500)

@file_system_router.post("/add_template", tags=["File system routes"], status_code=204)
async def add_template(request: AddTemplateRequest) -> None:
    """
    Asynchronously adds a template to the templates file.

    Args:
        request (AddTemplateRequest): Parameters as an object.

    Raises:
        HTTPException: 500 error if any error happens.
    """
    try:
        await to_thread(
            file_system_functions.add_template,
            request.file_path,
            request.template_name,
            request.template_content,
            request.new_line
        )
    except GenericError as ge:
        logger.error(ge)
        raise HTTPException(status_code=500)

@file_system_router.post("/remove_template", tags=["File system routes"], status_code=204)
async def remove_template(request: RemoveTemplateRequest) -> None:
    """
    Asynchronously removes a template from the templates file.

    Args:
        request (RemoveTemplateRequest): Parameters as an object.

    Raises:
        HTTPException: 500 error if any error happens.
    """
    try:
        await to_thread(
            file_system_functions.remove_template,
            request.file_path,
            request.template_name
        )
    except GenericError as ge:
        logger.error(ge)
        raise HTTPException(status_code=500)