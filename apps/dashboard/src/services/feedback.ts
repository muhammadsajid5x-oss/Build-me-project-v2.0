import { apiClient } from "./apiClient";

export type FeedbackType = "score" | "rate" | "complaint" | "suggestion";
export type FeedbackStatus = "pending" | "approved" | "rejected";
export type FeedbackModerationStatus = Exclude<FeedbackStatus, "pending">;

export type FeedbackRecord = {
  id: string;
  referenceId: string;
  type: FeedbackType;
  status: FeedbackStatus;
  name: string;
  email: string;
  score: number | null;
  rating: number | null;
  title: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type FeedbackResponse = {
  data: FeedbackRecord[];
};

type FeedbackStatusUpdateResponse = {
  data: Pick<FeedbackRecord, "id" | "status" | "updatedAt">;
};

const loadErrorMessage = "Feedback could not be loaded. Please try again.";
const updateErrorMessage =
  "Feedback status could not be updated. Please try again.";

const unauthorizedMessage = "You are not authorised to view feedback.";
const unauthorizedUpdateMessage =
  "You are not authorised to update feedback.";

function isUnauthorizedError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    status?: number;
    response?: {
      status?: number;
    };
  };

  return (
    candidate.status === 401 ||
    candidate.status === 403 ||
    candidate.response?.status === 401 ||
    candidate.response?.status === 403
  );
}

export function formatFeedbackDate(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getFeedbackTypeLabel(type: FeedbackType): string {
  switch (type) {
    case "score":
      return "Score";

    case "rate":
      return "Rating";

    case "complaint":
      return "Report Issue";

    case "suggestion":
      return "Suggestion";

    default:
      return type;
  }
}

export async function fetchFeedback(): Promise<{
  data: FeedbackRecord[];
  error: string | null;
}> {
  try {
    const response = await apiClient.get<FeedbackResponse>("api/v1/feedback");

    return {
      data: Array.isArray(response?.data) ? response.data : [],
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error: isUnauthorizedError(error)
        ? unauthorizedMessage
        : loadErrorMessage,
    };
  }
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackModerationStatus,
): Promise<{
  data: FeedbackStatusUpdateResponse["data"] | null;
  error: string | null;
}> {
  try {
    const response = await apiClient.put<FeedbackStatusUpdateResponse>(
      `api/v1/feedback/${encodeURIComponent(id)}/status`,
      { status },
    );

    const updatedFeedback = response?.data;
    if (
      !updatedFeedback ||
      updatedFeedback.id !== id ||
      updatedFeedback.status !== status ||
      typeof updatedFeedback.updatedAt !== "string"
    ) {
      return {
        data: null,
        error: updateErrorMessage,
      };
    }

    return {
      data: updatedFeedback,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: isUnauthorizedError(error)
        ? unauthorizedUpdateMessage
        : updateErrorMessage,
    };
  }
}
