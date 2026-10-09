from events import AnalyticsEvent
class AnalyticsTracker:
    def __init__(self) -> None:
        self._events: list[AnalyticsEvent] = []
    def track(self, event: AnalyticsEvent) -> AnalyticsEvent:
        self._events.append(event)
        return event
    def get_events(self) -> list[AnalyticsEvent]:
        return list(self._events)
    def count(self) -> int:
        return len(self._events)
