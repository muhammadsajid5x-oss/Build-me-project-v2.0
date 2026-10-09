from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from .errors import InvalidEventError
@dataclass
class AnalyticsEvent:
    name: str
    properties: dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    def __post_init__(self) -> None:
        if not isinstance(self.name, str) or not self.name.strip():
            raise InvalidEventError("Event name must be a non-empty string.")
        if not isinstance(self.properties, dict):
            raise InvalidEventError("Event properties must be an object.")
        if not isinstance(self.timestamp, str) or not self.timestamp.strip():
            raise InvalidEventError("Event timestamp must be a non-empty string.")
    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "properties": self.properties,
            "timestamp": self.timestamp,
        }
