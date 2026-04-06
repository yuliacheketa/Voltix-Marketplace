import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const ErrorBox = styled.div`
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  background: #fde8e8;
  color: #7a1c1c;
  font-size: 0.9rem;
  line-height: 1.45;
`;

const Hint = styled.code`
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #4a1515;
`;

function resolveMountApi(mod) {
  if (!mod || typeof mod !== "object") return null;
  if (typeof mod.mount === "function") return mod;
  const a = mod.default;
  if (a && typeof a.mount === "function") return a;
  if (a?.default && typeof a.default.mount === "function") return a.default;
  return null;
}

export function MicrofrontendHost({
  remoteImport,
  hostClassName,
  hostId,
  startHint,
}) {
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return undefined;
    let cancelled = false;
    setError(null);
    remoteImport()
      .then((m) => {
        if (cancelled || !hostRef.current) return;
        const api = resolveMountApi(m);
        if (!api) {
          throw new Error("У віддаленому модулі немає експорту mount()");
        }
        apiRef.current = api;
        return Promise.resolve(api.mount(hostRef.current));
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Не вдалося завантажити віддалений скрипт");
        }
      });
    return () => {
      cancelled = true;
      apiRef.current?.unmount?.();
      apiRef.current = null;
    };
  }, [remoteImport]);

  return (
    <>
      {error ? (
        <ErrorBox role="alert">
          {error}
          {startHint ? <Hint>{startHint}</Hint> : null}
        </ErrorBox>
      ) : null}
      <div ref={hostRef} id={hostId} className={hostClassName} />
    </>
  );
}
