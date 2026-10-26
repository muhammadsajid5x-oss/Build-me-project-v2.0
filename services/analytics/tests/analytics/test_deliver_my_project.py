from events import AnalyticsEvent
from processing import AnalyticsProcessor
from reporting import AnalyticsReporter
from tracking import AnalyticsTracker


def test_deliver_my_project_analytics_flow():
    tracker = AnalyticsTracker()

    tracker.track(
        AnalyticsEvent(
            name="work.with.me.clicked",
            properties={"source": "homepage"},
            timestamp="2026-10-26T18:00:00Z",
            event_type="click",
        )
    )

    tracker.track(
        AnalyticsEvent(
            name="deliver.my.project.clicked",
            properties={"source": "impact-card"},
            timestamp="2026-10-26T18:01:00Z",
            event_type="click",
        )
    )

    tracker.track(
        AnalyticsEvent(
            name="deliver.my.project.viewed",
            properties={"source": "deliver-my-project-page"},
            timestamp="2026-10-26T18:02:00Z",
            event_type="view",
        )
    )

    tracker.track(
        AnalyticsEvent(
            name="deliver.my.project.completed",
            properties={"source": "deliver-my-project-page"},
            timestamp="2026-10-26T18:05:00Z",
            event_type="click",
        )
    )

    events = tracker.get_events()

    metrics = AnalyticsProcessor().process(events)

    report = AnalyticsReporter().report(metrics)

    assert metrics["total_events"] == 4

    assert metrics["event_counts"] == {
        "work.with.me.clicked": 1,
        "deliver.my.project.clicked": 1,
        "deliver.my.project.viewed": 1,
        "deliver.my.project.completed": 1,
    }

    assert metrics["event_type_counts"] == {
        "click": 3,
        "view": 1,
    }

    assert report["summary"]["total_events"] == 4
    assert report["summary"]["event_counts"] == metrics["event_counts"]
    assert report["summary"]["event_type_counts"] == metrics["event_type_counts"]