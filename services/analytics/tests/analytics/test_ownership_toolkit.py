from pathlib import Path
import sys

ANALYTICS_SRC = Path(__file__).resolve().parents[2] / "src"
sys.path.insert(0, str(ANALYTICS_SRC))

from events import AnalyticsEvent, InvalidEventError, ProcessingError
from processing import AnalyticsProcessor
from reporting import AnalyticsReporter
from tracking import AnalyticsTracker


def test_ownership_toolkit_analytics_flow():
    tracker = AnalyticsTracker()

    tracker.track(
        AnalyticsEvent(
            name="ownership.toolkit.clicked",
            properties={"source": "homepage"},
            timestamp="2026-11-02T18:00:00Z",
            event_type="click",
        )
    )

    tracker.track(
        AnalyticsEvent(
            name="ownership.toolkit.viewed",
            properties={"source": "ownership-toolkit-page"},
            timestamp="2026-11-02T18:01:00Z",
            event_type="view",
        )
    )

    tracker.track(
        AnalyticsEvent(
            name="ownership.toolkit.completed",
            properties={"source": "ownership-toolkit-page"},
            timestamp="2026-11-02T18:02:00Z",
            event_type="click",
        )
    )

    tracker.track(
        AnalyticsEvent(
            name="ownership.toolkit.downloaded",
            properties={"source": "ownership-toolkit-page"},
            timestamp="2026-11-02T18:03:00Z",
            event_type="click",
        )
    )

    events = tracker.get_events()
    metrics = AnalyticsProcessor().process(events)
    report = AnalyticsReporter().report(metrics)

    assert metrics["total_events"] == 4

    assert metrics["event_counts"] == {
        "ownership.toolkit.clicked": 1,
        "ownership.toolkit.viewed": 1,
        "ownership.toolkit.completed": 1,
        "ownership.toolkit.downloaded": 1,
    }

    assert metrics["event_type_counts"] == {
        "click": 3,
        "view": 1,
    }

    assert report["summary"]["total_events"] == 4
    assert report["summary"]["event_counts"] == metrics["event_counts"]
    assert report["summary"]["event_type_counts"] == metrics["event_type_counts"]


def test_ownership_toolkit_analytics_preserves_event_order():
    tracker = AnalyticsTracker()

    event_names = [
        "ownership.toolkit.clicked",
        "ownership.toolkit.viewed",
        "ownership.toolkit.completed",
        "ownership.toolkit.downloaded",
    ]

    for name in event_names:
        event_type = "view" if name == "ownership.toolkit.viewed" else "click"

        tracker.track(
            AnalyticsEvent(
                name=name,
                properties={"source": "ownership-toolkit"},
                timestamp="2026-11-02T18:00:00Z",
                event_type=event_type,
            )
        )

    events = tracker.get_events()

    assert [event.name for event in events] == event_names
    assert tracker.count() == 4


def test_ownership_toolkit_analytics_rejects_invalid_event_type():
    try:
        AnalyticsEvent(
            name="ownership.toolkit.completed",
            properties={"source": "ownership-toolkit-page"},
            timestamp="2026-11-02T18:02:00Z",
            event_type="completed",
        )
    except InvalidEventError as error:
        assert str(error) == "Event type must be 'view' or 'click'."
    else:
        raise AssertionError("Expected InvalidEventError for invalid event type.")


def test_ownership_toolkit_analytics_processor_rejects_invalid_event():
    tracker = AnalyticsTracker()

    tracker.track(
        AnalyticsEvent(
            name="ownership.toolkit.viewed",
            properties={"source": "ownership-toolkit-page"},
            timestamp="2026-11-02T18:01:00Z",
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