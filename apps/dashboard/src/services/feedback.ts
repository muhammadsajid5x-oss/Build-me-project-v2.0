import { apiClient } from "./apiClient";

export type FeedbackType = "score" | "rate" | "complaint" | "suggestion";

export type FeedbackSource =
  | "client-work"
  | "mentorship"
  | "coffee-chat"
  | "other";

export type FeedbackStatus = "pending" | "approved" | "rejected";

export type FeedbackModerationStatus = Exclude<FeedbackStatus, "pending">;

export type FeedbackRecord = {
  id: string;
  referenceId: string;
  type: FeedbackType;
  status: FeedbackStatus;
  name: string;
  email: string;
  role: string | null;
  company: string | null;
  location: string | null;
  source: FeedbackSource;
  tags: string[];
  score: number | null;
  rating: number | null;
  communications: number | null;
  timelines: number | null;
  knowledge: number | null;
  value: number | null;
  title: string | null;
  content: string;
  outcome: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FeedbackUpdateInput = {
  name?: string;
  role?: string;
  company?: string;
  location?: string;
  source?: FeedbackSource;
  tags?: string[];
  rating?: number;
  communications?: number;
  timelines?: number;
  knowledge?: number;
  value?: number;
  title?: string;
  content?: string;
  outcome?: string;
};

type FeedbackResponse = {
  data: FeedbackRecord[];
};

type FeedbackUpdateResponse = {
  data: FeedbackRecord;
};

type FeedbackStatusUpdateResponse = {
  data: Pick<FeedbackRecord, "id" | "status" | "updatedAt">;
};

type FeedbackDeleteResponse = {
  data: {
    id: string;
    deleted: boolean;
  };
};

const loadErrorMessage = "Feedback could not be loaded. Please try again.";

const updateErrorMessage = "Feedback could not be updated. Please try again.";

const statusErrorMessage =
  "Feedback status could not be updated. Please try again.";

const deleteErrorMessage = "Feedback could not be deleted. Please try again.";

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
      return "Review";

    case "complaint":
      return "Report Issue";

    case "suggestion":
      return "Suggestion";

    default:
      return type;
  }
}

export function getFeedbackSourceLabel(source: FeedbackSource): string {
  switch (source) {
    case "client-work":
      return "Client Work";

    case "mentorship":
      return "Mentorship";

    case "coffee-chat":
      return "Coffee With Me";

    default:
      return "Other Support";
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
        ? "You are not authorised to view feedback."
        : loadErrorMessage,
    };
  }
}

export async function updateFeedback(
  id: string,
  input: FeedbackUpdateInput,
): Promise<{
  data: FeedbackRecord | null;
  error: string | null;
}> {
  try {
    const response = await apiClient.put<FeedbackUpdateResponse>(
      `api/v1/feedback/${encodeURIComponent(id)}`,
      input,
    );

    if (!response?.data?.id) {
      return {
        data: null,
        error: updateErrorMessage,
      };
    }

    return {
      data: response.data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: isUnauthorizedError(error)
        ? "You are not authorised to edit feedback."
        : updateErrorMessage,
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

    return {
      data: response?.data ?? null,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: isUnauthorizedError(error)
        ? "You are not authorised to update feedback."
        : statusErrorMessage,
    };
  }
}

export async function deleteFeedback(id: string): Promise<{
  data: FeedbackDeleteResponse["data"] | null;
  error: string | null;
}> {
  try {
    const response = await apiClient.delete<FeedbackDeleteResponse>(
      `api/v1/feedback/${encodeURIComponent(id)}`,
    );

    return {
      data: response?.data ?? null,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: isUnauthorizedError(error)
        ? "You are not authorised to delete feedback."
        : deleteErrorMessage,
    };
  }
}
