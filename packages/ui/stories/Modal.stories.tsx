import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../src/components/Button";
import {
  Modal,
  ModalActions,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalStep,
} from "../src/components/Modal";
const meta = {
  title: "Components/Modal",
  component: Modal,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    open: false,
    onClose: () => undefined,
    children: null,
    size: "md",
    state: "default",
  },
} satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;
function ModalDemo(args: React.ComponentProps<typeof Modal>) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: "2rem" }}>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        aria-label="Example Modal"
      >
        <ModalHeader>
          <h2 style={{ margin: 0 }}>Example Modal</h2>
        </ModalHeader>
        <ModalBody>
          <p>
            This is the shared modal foundation. Feature-specific content should
            be composed inside this structure.
          </p>
        </ModalBody>
        <ModalFooter>
          <ModalActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </ModalActions>
        </ModalFooter>
      </Modal>
    </div>
  );
}
export const Default: Story = {
  render: (args) => <ModalDemo {...args} />,
};
export const Loading: Story = {
  args: {
    state: "loading",
  },
  render: (args) => <ModalDemo {...args} />,
};
export const ErrorState: Story = {
  args: {
    state: "error",
  },
  render: (args) => <ModalDemo {...args} />,
};
export const Success: Story = {
  args: {
    state: "success",
  },
  render: (args) => <ModalDemo {...args} />,
};
function MultiStepDemo(args: React.ComponentProps<typeof Modal>) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  return (
    <div style={{ padding: "2rem" }}>
      <Button
        onClick={() => {
          setStep(1);
          setOpen(true);
        }}
      >
        Open Multi-Step Modal
      </Button>
      <Modal
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        aria-label="Multi-Step Flow"
      >
        <ModalHeader>
          <h2 style={{ margin: 0 }}>Multi-Step Flow</h2>
        </ModalHeader>
        <ModalBody>
          <ModalStep active={step === 1}>
            <p>Step 1: Enter your information.</p>
          </ModalStep>
          <ModalStep active={step === 2}>
            <p>Step 2: Review your information.</p>
          </ModalStep>
          <ModalStep active={step === 3}>
            <p>Step 3: Everything is ready.</p>
          </ModalStep>
        </ModalBody>
        <ModalFooter>
          <ModalActions align="between">
            <Button
              disabled={step === 1}
              onClick={() => setStep((value) => value - 1)}
            >
              Back
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep((value) => value + 1)}>
                Next
              </Button>
            ) : (
              <Button onClick={() => setOpen(false)}>Finish</Button>
            )}
          </ModalActions>
        </ModalFooter>
      </Modal>
    </div>
  );
}
export const MultiStep: Story = {
  render: (args) => <MultiStepDemo {...args} />,
};
