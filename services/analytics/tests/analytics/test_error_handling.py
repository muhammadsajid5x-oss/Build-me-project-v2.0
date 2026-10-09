import sys
import pytest
sys.path.insert(0, "services/analytics/src")
from events import AnalyticsEvent, CalculationError, InvalidEventError, ProcessingError
from processing import AnalyticsProcessor
from reporting import AnalyticsReporter
def test_invalid_event_name_raises_error():
    with pytest.raises(InvalidEventError):
        AnalyticsEvent("")
def test_invalid_event_properties_raises_error():
    with pytest.raises(InvalidEventError):
        AnalyticsEvent("page_view", properties=[])
def test_processing_invalid_event_raises_error():
    with pytest.raises(ProcessingError):
        AnalyticsProcessor().process(["invalid-event"])
def test_processing_non_list_raises_error():
    with pytest.raises(ProcessingError):
        AnalyticsProcessor().process(None)
def test_invalid_calculation_metrics_raises_error():
    with pytest.raises(CalculationError):
        AnalyticsReporter().report({"total_events": -1})
def test_invalid_event_counts_raises_error():
    with pytest.raises(CalculationError):
        AnalyticsReporter().report({"total_events": 1, "event_counts": []})
