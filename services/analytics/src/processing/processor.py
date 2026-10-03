from collections import Counter
from events import AnalyticsEvent, ProcessingError
class AnalyticsProcessor:
    def process(self, events: list[AnalyticsEvent]) -> dict[str, object]:
        if not isinstance(events, list):
            raise ProcessingError("Analytics events must be provided as a list.")
        try:
            event_counts = Counter()
            for event in events:
                if not isinstance(event, AnalyticsEvent):
                    raise ProcessingError("Analytics event contains an invalid item.")
                event_counts[event.name] += 1
            return {
                "total_events": len(events),
                "event_counts": dict(event_counts),
            }
        except ProcessingError:
            raise
        except Exception as error:
            raise ProcessingError(
                "Analytics event processing failed."
            ) from error
