class AnalyticsError(Exception):
    """Base error for analytics operations."""
class InvalidEventError(AnalyticsError):
    """Raised when an analytics event is invalid."""
class ProcessingError(AnalyticsError):
    """Raised when analytics processing fails."""
class CalculationError(AnalyticsError):
    """Raised when an analytics calculation fails."""
