import { useCallback, useEffect, useMemo, useState } from "react";

import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";

import {
  deleteFeedback,
  fetchFeedback,
  formatFeedbackDate,
  getFeedbackSourceLabel,
  updateFeedback,
  updateFeedbackStatus,
  type FeedbackModerationStatus,
  type FeedbackRecord,
  type FeedbackStatus,
} from "../services/feedback";

type Filter = "all" | "pending" | "approved" | "rejected";

type EditorState = {
  rating: number;
  communications: number;
  timelines: number;
  knowledge: number;
  value: number;
  tags: string;
  outcome: string;
  content: string;
};

const filters: Array<{
  id: Filter;
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

function statusClasses(status: FeedbackStatus): string {
  switch (status) {
    case "pending":
      return "bg-blue-100 text-blue-700";

    case "approved":
      return "bg-blue-700 text-white";

    case "rejected":
      return "bg-black text-white";

    default:
      return "bg-white text-black";
  }
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function createEditorState(item: FeedbackRecord): EditorState {
  return {
    rating: item.rating ?? 5,
    communications: item.communications ?? item.rating ?? 5,
    timelines: item.timelines ?? item.rating ?? 5,
    knowledge: item.knowledge ?? item.rating ?? 5,
    value: item.value ?? item.rating ?? 5,
    tags: item.tags.join(", "),
    outcome: item.outcome ?? "",
    content: item.content,
  };
}

function StarInput({
  value,
  onChange,
}: {
  readonly value: number;
  readonly onChange: (value: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1;

        return (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={[
              "text-2xl leading-none",
              rating <= value ? "text-blue-700" : "text-black/20",
            ].join(" ")}
            aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default function FeedbackPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);

  const [selected, setSelected] = useState<FeedbackRecord | null>(null);

  const [editing, setEditing] = useState(false);

  const [editor, setEditor] = useState<EditorState | null>(null);

  const [updating, setUpdating] = useState(false);

  const [statusAction, setStatusAction] = useState<{
    id: string;
    status: FeedbackModerationStatus;
  } | null>(null);

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await fetchFeedback();

    setFeedback(result.data);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadFeedback();
  }, [loadFeedback]);

  const filteredFeedback = useMemo(() => {
    if (filter === "all") {
      return feedback;
    }

    return feedback.filter((item) => item.status === filter);
  }, [feedback, filter]);

  const counts = useMemo(
    () => ({
      all: feedback.length,
      pending: feedback.filter((item) => item.status === "pending").length,
      approved: feedback.filter((item) => item.status === "approved").length,
      rejected: feedback.filter((item) => item.status === "rejected").length,
    }),
    [feedback],
  );

  const openView = (item: FeedbackRecord) => {
    setSelected(item);
    setEditing(false);
    setEditor(createEditorState(item));
    setActionError(null);
  };

  const openEdit = (item: FeedbackRecord) => {
    if (item.status !== "pending") {
      return;
    }

    setSelected(item);
    setEditing(true);
    setEditor(createEditorState(item));
    setActionError(null);
  };

  const closeModal = () => {
    if (updating) {
      return;
    }

    setSelected(null);
    setEditing(false);
    setEditor(null);
  };

  const handleSave = async () => {
    if (!selected || !editor) {
      return;
    }

    setUpdating(true);
    setActionError(null);

    const tags = editor.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const result = await updateFeedback(selected.id, {
      rating: editor.rating,
      communications: editor.communications,
      timelines: editor.timelines,
      knowledge: editor.knowledge,
      value: editor.value,
      tags,
      outcome: editor.outcome.trim(),
      content: editor.content.trim(),
    });

    if (result.error || !result.data) {
      setActionError(result.error ?? "Feedback could not be updated.");
      setUpdating(false);
      return;
    }

    setFeedback((current) =>
      current.map((item) => (item.id === result.data?.id ? result.data : item)),
    );

    setSelected(result.data);
    setEditor(createEditorState(result.data));
    setEditing(false);
    setUpdating(false);
  };

  const handleStatusChange = async (
    id: string,
    status: FeedbackModerationStatus,
  ) => {
    setStatusAction({ id, status });
    setActionError(null);

    const result = await updateFeedbackStatus(id, status);

    if (result.error || !result.data) {
      setActionError(result.error ?? "Feedback status could not be updated.");
      setStatusAction(null);
      return;
    }

    setFeedback((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: result.data!.status,
              updatedAt: result.data!.updatedAt,
            }
          : item,
      ),
    );

    if (selected?.id === id) {
      setSelected((current) =>
        current
          ? {
              ...current,
              status: result.data!.status,
              updatedAt: result.data!.updatedAt,
            }
          : current,
      );

      if (result.data.status !== "pending") {
        setEditing(false);
      }
    }

    setStatusAction(null);
  };

  const handleDelete = async (item: FeedbackRecord) => {
    if (item.status !== "pending") {
      return;
    }

    const confirmed = window.confirm(`Delete feedback from ${item.name}?`);

    if (!confirmed) {
      return;
    }

    setActionError(null);
    setUpdating(true);

    const result = await deleteFeedback(item.id);

    if (result.error) {
      setActionError(result.error);
      setUpdating(false);
      return;
    }

    setFeedback((current) =>
      current.filter((feedbackItem) => feedbackItem.id !== item.id),
    );

    if (selected?.id === item.id) {
      setSelected(null);
      setEditing(false);
      setEditor(null);
    }

    setUpdating(false);
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return (
        <ErrorState
          message={error}
          onRetry={() => {
            void loadFeedback();
          }}
        />
      );
    }

    if (filteredFeedback.length === 0) {
      return <EmptyState message="No feedback matches this filter." />;
    }

    return (
      <div className="overflow-x-auto rounded-2xl border-2 border-blue-700 bg-black">
        <table className="w-full min-w-262.5">
          <thead>
            <tr className="border-b-2 border-blue-700">
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-white">
                Reviewer
              </th>

              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-white">
                Source
              </th>

              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-white">
                Rating
              </th>

              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-white">
                Tags
              </th>

              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-white">
                Status
              </th>

              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-white">
                Created
              </th>

              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-white">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredFeedback.map((item) => (
              <tr key={item.id} className="border-b border-blue-700/60">
                <td className="px-4 py-4 align-top">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-700 text-sm font-bold text-white">
                      {getInitials(item.name)}
                    </div>

                    <div>
                      <p className="font-bold text-white">{item.name}</p>

                      <p className="mt-1 text-xs text-blue-100">{item.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 align-top text-sm text-white">
                  {getFeedbackSourceLabel(item.source)}
                </td>

                <td className="px-4 py-4 align-top">
                  <p className="text-lg tracking-wide text-blue-100">
                    {"★".repeat(item.rating ?? 0)}
                  </p>
                </td>

                <td className="max-w-65 px-4 py-4 align-top">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.length > 0 ? (
                      item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-white">No tags</span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-4 align-top">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClasses(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-4 align-top text-xs text-white">
                  {formatFeedbackDate(item.createdAt)}
                </td>

                <td className="px-4 py-4 align-top">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openView(item)}
                      className="rounded-lg border-2 border-blue-700 bg-white px-3 py-2 text-xs font-bold text-black hover:bg-blue-100"
                    >
                      View
                    </button>

                    {item.status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-white hover:text-black"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={statusAction !== null}
                          onClick={() => {
                            void handleStatusChange(item.id, "approved");
                          }}
                          className="rounded-lg border-2 border-blue-700 bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-white disabled:opacity-50"
                        >
                          {statusAction?.id === item.id &&
                          statusAction.status === "approved"
                            ? "Accepting..."
                            : "Accept"}
                        </button>

                        <button
                          type="button"
                          disabled={statusAction !== null}
                          onClick={() => {
                            void handleStatusChange(item.id, "rejected");
                          }}
                          className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-black hover:bg-blue-100 disabled:opacity-50"
                        >
                          {statusAction?.id === item.id &&
                          statusAction.status === "rejected"
                            ? "Rejecting..."
                            : "Reject"}
                        </button>

                        <button
                          type="button"
                          disabled={updating}
                          onClick={() => {
                            void handleDelete(item);
                          }}
                          className="rounded-lg border-2 border-blue-700 bg-black px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <section aria-labelledby="feedback-heading">
        <header className="mb-6">
          <h1 id="feedback-heading" className="text-2xl font-bold text-white">
            Feedbacks
          </h1>

          <p className="mt-1 text-sm text-blue-100">
            Review, refine, approve, reject, or delete submitted customer
            feedback.
          </p>
        </header>

        <nav
          aria-label="Feedback filters"
          className="mb-6 border-b-2 border-blue-700"
        >
          <ul className="flex flex-wrap gap-6">
            {filters.map((item) => {
              const active = filter === item.id;
              const count = counts[item.id];

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={[
                      "flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-bold",
                      active
                        ? "border-blue-100 text-white"
                        : "border-transparent text-blue-100 hover:text-white",
                    ].join(" ")}
                  >
                    <span>{item.label}</span>

                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-xs",
                        active
                          ? "bg-blue-100 text-blue-700"
                          : "bg-blue-700 text-white",
                      ].join(" ")}
                    >
                      {count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {actionError && (
          <div className="mb-4 rounded-xl border-2 border-blue-700 bg-blue-100 px-4 py-3 text-sm font-bold text-black">
            {actionError}
          </div>
        )}

        {renderContent()}
      </section>

      {selected && editor && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/80"
            aria-hidden="true"
            onClick={closeModal}
          />

          <dialog
            open
            aria-modal="true"
            aria-labelledby="feedback-modal-heading"
            className="fixed inset-0 z-50 m-auto max-h-[92vh] w-[94vw] max-w-3xl overflow-y-auto rounded-2xl border-2 border-blue-700 bg-white p-0 text-black"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-blue-700 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  Feedback Detail
                </p>

                <h2
                  id="feedback-modal-heading"
                  className="mt-1 text-xl font-bold"
                >
                  {selected.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-2xl font-bold text-blue-700 hover:bg-blue-100"
                aria-label="Close feedback"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                    Email
                  </p>
                  <p className="mt-1 text-sm">{selected.email}</p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                    Source
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {getFeedbackSourceLabel(selected.source)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                    Role
                  </p>
                  <p className="mt-1 text-sm">
                    {selected.role ?? "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                    Company
                  </p>
                  <p className="mt-1 text-sm">
                    {selected.company ?? "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                    Location
                  </p>
                  <p className="mt-1 text-sm">
                    {selected.location ?? "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                    Status
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClasses(
                      selected.status,
                    )}`}
                  >
                    {selected.status}
                  </span>
                </div>
              </div>

              {editing && selected.status === "pending" ? (
                <>
                  <div>
                    <p className="text-sm font-bold">Overall Rating</p>

                    <div className="mt-2">
                      <StarInput
                        value={editor.rating}
                        onChange={(value) =>
                          setEditor({
                            ...editor,
                            rating: value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      ["communications", "Communications"],
                      ["timelines", "Timelines"],
                      ["knowledge", "Knowledge"],
                      ["value", "Value"],
                    ].map(([key, label]) => {
                      const field = key as keyof EditorState;

                      return (
                        <div
                          key={key}
                          className="rounded-xl border-2 border-blue-700 bg-blue-100 p-4"
                        >
                          <p className="text-sm font-bold">{label}</p>

                          <div className="mt-2">
                            <StarInput
                              value={Number(editor[field])}
                              onChange={(value) =>
                                setEditor({
                                  ...editor,
                                  [field]: value,
                                })
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label
                      htmlFor="admin-feedback-tags"
                      className="block text-sm font-bold"
                    >
                      Tags
                    </label>

                    <input
                      id="admin-feedback-tags"
                      value={editor.tags}
                      onChange={(event) =>
                        setEditor({
                          ...editor,
                          tags: event.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-lg border-2 border-blue-700 bg-white px-3 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="admin-feedback-content"
                      className="block text-sm font-bold"
                    >
                      Review
                    </label>

                    <textarea
                      id="admin-feedback-content"
                      value={editor.content}
                      onChange={(event) =>
                        setEditor({
                          ...editor,
                          content: event.target.value,
                        })
                      }
                      rows={7}
                      className="mt-2 w-full rounded-lg border-2 border-blue-700 bg-white px-3 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="admin-feedback-outcome"
                      className="block text-sm font-bold"
                    >
                      Outcome / Result
                    </label>

                    <textarea
                      id="admin-feedback-outcome"
                      value={editor.outcome}
                      onChange={(event) =>
                        setEditor({
                          ...editor,
                          outcome: event.target.value,
                        })
                      }
                      rows={4}
                      className="mt-2 w-full rounded-lg border-2 border-blue-700 bg-white px-3 py-3 text-sm"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                      Rating
                    </p>

                    <p className="mt-2 text-2xl tracking-wide text-blue-700">
                      {"★".repeat(selected.rating ?? 0)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                      Tags
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {selected.tags.length > 0 ? (
                        selected.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm">No tags</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                      Review
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                      {selected.content}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                      Outcome
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                      {selected.outcome ?? "No outcome provided."}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-4">
                    {[
                      ["Communications", selected.communications],
                      ["Timelines", selected.timelines],
                      ["Knowledge", selected.knowledge],
                      ["Value", selected.value],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl border-2 border-blue-700 bg-blue-100 p-4"
                      >
                        <p className="text-xs font-bold uppercase text-blue-700">
                          {label}
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                          {value ?? "—"}/5
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t-2 border-blue-700 bg-blue-100 px-5 py-4">
              {selected.status === "pending" && !editing && (
                <>
                  <button
                    type="button"
                    onClick={() => openEdit(selected)}
                    className="rounded-lg border-2 border-blue-700 bg-white px-4 py-3 text-sm font-bold"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={statusAction !== null}
                    onClick={() => {
                      void handleStatusChange(selected.id, "approved");
                    }}
                    className="rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {statusAction?.id === selected.id &&
                    statusAction.status === "approved"
                      ? "Accepting..."
                      : "Accept & Publish"}
                  </button>

                  <button
                    type="button"
                    disabled={statusAction !== null}
                    onClick={() => {
                      void handleStatusChange(selected.id, "rejected");
                    }}
                    className="rounded-lg bg-black px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {statusAction?.id === selected.id &&
                    statusAction.status === "rejected"
                      ? "Rejecting..."
                      : "Reject"}
                  </button>

                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => {
                      void handleDelete(selected);
                    }}
                    className="rounded-lg border-2 border-blue-700 bg-white px-4 py-3 text-sm font-bold disabled:opacity-50"
                  >
                    Delete
                  </button>
                </>
              )}

              {editing && selected.status === "pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setEditor(createEditorState(selected));
                    }}
                    disabled={updating}
                    className="rounded-lg border-2 border-blue-700 bg-white px-4 py-3 text-sm font-bold disabled:opacity-50"
                  >
                    Cancel Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      void handleSave();
                    }}
                    disabled={updating}
                    className="rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={closeModal}
                disabled={updating}
                className="rounded-lg border-2 border-blue-700 bg-white px-4 py-3 text-sm font-bold disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </dialog>
        </>
      )}
    </>
  );
}
