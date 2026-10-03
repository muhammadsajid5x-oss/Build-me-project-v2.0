import sys
sys.path.insert(0, "services/analytics/src")
from events import AnalyticsEvent
from tracking import AnalyticsTracker
from processing import AnalyticsProcessor
from reporting import AnalyticsReporter
def test_analytics_foundation_pipeline():
    tracker = AnalyticsTracker()
    tracker.track(AnalyticsEvent("page_view"))
    tracker.track(AnalyticsEvent("page_view"))
    tracker.track(AnalyticsEvent("button_click"))
    foundation_event = AnalyticsEvent(
        "foundation.test.clicked",
        properties={
            "feature": "foundation",
            "session_id": "foundation-test-session",
            "data": {"source": "foundation-pipeline-test"},
        },
    )
    tracked_event = tracker.track(foundation_event)
    stored_events = tracker.get_events()
    metrics = AnalyticsProcessor().process(stored_events)
    report = AnalyticsReporter().report(metrics)
    assert tracker.count() == 4
    assert tracked_event is foundation_event
    assert stored_events[-1] == foundation_event
    assert metrics["total_events"] == 4
    assert metrics["event_counts"] == {
        "page_view": 2,
        "button_click": 1,
        "foundation.test.clicked": 1,
    }
    assert report["summary"]["total_events"] == 4
    assert report["summary"]["event_counts"]["page_view"] == 2
    assert report["summary"]["event_counts"]["foundation.test.clicked"] == 1
