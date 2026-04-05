import React from "react";
import styled from "styled-components";

const Wrap = styled.div`
  max-width: 28rem;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgb(26 26 52 / 0.08);
`;

const Title = styled.h1`
  margin: 0 0 0.5rem;
  font-size: 1.35rem;
`;

const Sub = styled.p`
  margin: 0 0 1.25rem;
  color: #5c6470;
  font-size: 0.9375rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  background: #333399;
  color: #fafaff;
  cursor: pointer;
`;

export default function App() {
  return (
    <Wrap>
      <Title>Sign in</Title>
      <Sub>
        Authentication is a placeholder for the Voltix marketplace shell.
      </Sub>
      <Button type="button">Continue</Button>
    </Wrap>
  );
}
