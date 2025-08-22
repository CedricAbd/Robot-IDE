class GenericError(Exception):
    """"
    Raised when a generic error happens in the application.
    """
    pass

class GitlabHTTPAuthenticationError(Exception):
    """
    Raised when GitLab authentication fails (HTTP 401 error).
    """
    pass

class GitlabHTTPNetworkError(Exception):
    """
    Raised when a network error is encountered during GitLab HTTP interactions.
    """
    pass