from pathlib import Path
import sys
ANALYTICS_SRC = Path(__file__).resolve().parents[2] / "src"
sys.path.insert(0, str(ANALYTICS_SRC))
from events import AnalyticsEvent, InvalidEventError, ProcessingError
from processing import AnalyticsProcessor
from reporting import AnalyticsReporter
from tracking import AnalyticsTracker
def test_testimonials_analytics_flow():
    tracker = AnalyticsTracker()
    tracker.track(
        AnalyticsEvent(
            name="testimonials.viewed",
            properties={"source": "homepage"},
            timestamp="2026-11-06T18:00:00Z",
            event_type="view",
        )
    )
    tracker.track(
        AnalyticsEvent(
            name="testimonials.pagination.clicked",
            properties={"source": "testimonials", "page": 2},
            timestamp="2026-11-06T18:01:00Z",
            event_type="click",
        )
    )
    tracker.track(
        AnalyticsEvent(
            name="testimonial.helpful.clicked",
            properties={"source": "testimonial-card"},
            timestamp="2026-11-06T18:02:00Z",
            event_type="click",
        )
    )
    tracker.track(
        AnalyticsEvent(
            name="testimonial.story.clicked",
            properties={"source": "testimonial-card"},
            timestamp="2026-11-06T18:03:00Z",
            event_type="click",
        )
    )
    events = tracker.get_events()
    metrics = AnalyticsProcessor().process(events)
    report = AnalyticsReporter().report(metrics)
    assert metrics["total_events"] == 4
    assert metrics["event_counts"] == {
        "testimonials.viewed": 1,
        "testimonials.pagination.clicked": 1,
        "testimonial.helpful.clicked": 1,
        "testimonial.story.clicked": 1,
    }
    assert metrics["event_type_counts"] == {
        "click": 3,
        "view": 1,
    }
    assert report["summary"]["total_events"] == 4
    assert report["summary"]["event_counts"] == metrics["event_counts"]
    assert report["summary"]["event_type_counts"] == metrics["event_type_counts"]
def test_testimonials_analytics_preserves_event_order():
    tracker = AnalyticsTracker()
    event_names = [
        "testimonials.viewed",
        "testimonials.pagination.clicked",
        "testimonial.helpful.clicked",
        "testimonial.story.clicked",
    ]
    for name in event_names:
        event_type = "view" if name == "testimonials.viewed" else "click"
        tracker.track(
            AnalyticsEvent(
                name=name,
                properties={"source": "testimonials"},
                timestamp="2026-11-06T18:00:00Z",
                event_type=event_type,
            )
        )
    events = tracker.get_events()
    assert [event.name for event in events] == event_names
    assert tracker.count() == 4
def test_testimonials_analytics_rejects_invalid_event_type():
    try:
        AnalyticsEvent(
            name="testimonials.pagination.clicked",
            properties={"source": "testimonials"},
            timestamp="2026-11-06T18:01:00Z",
            event_type="pagination",
        )
    except InvalidEventError as error:
        assert str(error) == "Event type must be 'view' or 'click'."
    else:
        raise AssertionError("Expected InvalidEventError for invalid event type.")
def test_testimonials_analytics_processor_rejects_invalid_event():
    tracker = AnalyticsTracker()
    tracker.track(
        AnalyticsEvent(
            name="testimonials.viewed",
            properties={"source": "homepage"},
            timestamp="2026-11-06T18:00:00Z",
            event_type="view",
        )
    )
    events = tracker.get_events()
    events.append("invalid-event")
    try:
        AnalyticsProcessor().process(events)
    except ProcessingError as error:
        assert str(error) == "Analytics event contains an invalid item."
    else:
        raise AssertionError(
            "Expected ProcessingError for invalid analytics event."
        )
