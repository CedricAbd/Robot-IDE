from logging import Logger, getLogger, Formatter, INFO
from logging.handlers import RotatingFileHandler

LOG_FILE_PATH = "/tmp/robot-ide-api.log"
MAX_BYTES = 10_000_000
BACKUP_COUNT = 1

def create_logger() -> Logger:
    """
    Creates the API logger.

    Returns:
        Logger: API logger.
    """
    logger = getLogger("robot-ide-api")
    if not logger.hasHandlers():
        logger.setLevel(INFO)
        formatter = Formatter("[%(asctime)s]-[%(levelname)s]: %(message)s")
        rotating_handler = RotatingFileHandler(
            LOG_FILE_PATH,
            maxBytes= MAX_BYTES,
            backupCount= BACKUP_COUNT,
            encoding="utf-8"
        )
        rotating_handler.setLevel(INFO)
        rotating_handler.setFormatter(formatter)
        logger.addHandler(rotating_handler)
    return logger

logger = create_logger()