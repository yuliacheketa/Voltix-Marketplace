import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { colors } from "./theme.js";
import { Button } from "./Button.js";

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgb(15 23 42 / 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
`;

const Panel = styled.div`
  background: ${colors.surface};
  color: ${colors.text};
  border-radius: 0.5rem;
  max-width: min(32rem, 100%);
  width: 100%;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  padding: 1.25rem;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
`;

export type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ open, title, onClose, children }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <Backdrop
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Panel
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <Header>
          {title ? <Title id={titleId}>{title}</Title> : <span aria-hidden />}
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </Header>
        {children}
      </Panel>
    </Backdrop>,
    document.body
  );
}
