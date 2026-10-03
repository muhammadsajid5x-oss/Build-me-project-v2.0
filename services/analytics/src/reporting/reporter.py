from events import CalculationError
class AnalyticsReporter:
    def report(self, metrics: dict[str, object]) -> dict[str, object]:
        if not isinstance(metrics, dict):
            raise CalculationError("Analytics metrics must be provided as an object.")
        try:
            total_events = metrics.get("total_events", 0)
            event_counts = metrics.get("event_counts", {})
            if not isinstance(total_events, int) or total_events < 0:
                raise CalculationError("Total events must be a non-negative integer.")
            if not isinstance(event_counts, dict):
                raise CalculationError("Event counts must be an object.")
            return {
                "summary": {
                    "total_events": total_events,
                    "event_counts": event_counts,
                }
            }
        except CalculationError:
            raise
        except Exception as error:
            raise CalculationError(
                "Analytics calculation failed."
            ) from error
