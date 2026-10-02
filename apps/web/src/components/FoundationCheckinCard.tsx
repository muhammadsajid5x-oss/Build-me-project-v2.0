import { useState, type SyntheticEvent } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalBody,
  ModalHeader,
  type ModalState,
} from "@build-me/ui";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type Checkin = { id: string; name: string; createdAt: string };

export default function FoundationCheckinCard() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [state, setState] = useState<ModalState>("default");
  const [message, setMessage] = useState("");

  const close = () => {
    setOpen(false);
    setName("");
    setState("default");
    setMessage("");
  };

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("loading");

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/foundation-checkins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await response.json();

      if (!response.ok) {
        setMessage(
          body?.error?.details?.[0]?.message ??
            "The check-in could not be recorded.",
        );
        setState("error");
        return;
      }

      setMessage(`Check-in recorded (ID ${(body.data as Checkin).id}).`);
      setState("success");
    } catch {
      setMessage("The check-in could not be recorded.");
      setState("error");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <h2>Foundation check-in</h2>
        </CardHeader>
        <CardBody>
          <Button onClick={() => setOpen(true)}>Record check-in</Button>
        </CardBody>
      </Card>
      <Modal
        open={open}
        onClose={close}
        state={state}
        aria-label="Record check-in"
      >
        <ModalHeader>
          <h2>Record check-in</h2>
        </ModalHeader>
        <ModalBody>
          {state === "success" ? (
            <output>{message}</output>
          ) : (
            <form onSubmit={submit}>
              <label htmlFor="checkin-name">Name</label>
              <input
                id="checkin-name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                required
              />
              {state === "error" && <p role="alert">{message}</p>}
              <Button type="submit" disabled={state === "loading"}>
                Submit
              </Button>
            </form>
          )}
        </ModalBody>
      </Modal>
    </>
  );
}
