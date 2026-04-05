import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Modal open={open} title="Example" onClose={() => setOpen(false)}>
        <p>Modal body</p>
      </Modal>
    </>
  );
}

export default {
  title: "UI/Modal",
  render: () => <ModalDemo />,
};

export const Default = {};
