import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { debounce } from "@voltix/utils";
import { Input, colors } from "@voltix/ui-kit";
import { fetchCategories } from "../apiService/catalogApi.js";

const Wrap = styled.div`
  position: relative;
  flex: 1;
  min-width: 12rem;
`;

const Dropdown = styled.ul`
  position: absolute;
  z-index: 10;
  left: 0;
  right: 0;
  top: 100%;
  margin: 0.25rem 0 0;
  padding: 0.25rem 0;
  list-style: none;
  background: ${colors.surface};
  border: 1px solid ${colors.borderSubtle};
  border-radius: 0.375rem;
  box-shadow: 0 4px 16px rgb(${colors.shadowTint} / 0.12);
  max-height: 12rem;
  overflow-y: auto;
`;

const DropdownItem = styled.li`
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: ${colors.text};
  &:hover {
    background: ${colors.primarySubtle};
  }
`;

export function SearchBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQ = searchParams.get("q") ?? "";
  const [value, setValue] = useState(urlQ);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    setValue(urlQ);
  }, [urlQ]);

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((data) => {
        if (!cancelled) setCategories(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const debouncedSetQ = useMemo(
    () =>
      debounce((next) => {
        setSearchParams(
          (prev) => {
            const p = new URLSearchParams(prev);
            if (next) p.set("q", next);
            else p.delete("q");
            return p;
          },
          { replace: true }
        );
      }, 300),
    [setSearchParams]
  );

  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const filteredCats = categories.filter((c) =>
    c.name.toLowerCase().includes(value.trim().toLowerCase())
  );
  const showDropdown =
    open && value.trim().length > 0 && filteredCats.length > 0;

  const onChange = (e) => {
    const v = e.target.value;
    setValue(v);
    debouncedSetQ(v.trim());
    setOpen(true);
  };

  const pickCategory = (cat) => {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.delete("cat");
        p.append("cat", cat.id);
        return p;
      },
      { replace: true }
    );
    setOpen(false);
  };

  return (
    <Wrap ref={wrapRef}>
      <Input
        type="search"
        placeholder="Пошук товарів…"
        value={value}
        onChange={onChange}
        onFocus={() => setOpen(true)}
        aria-autocomplete="list"
        aria-expanded={showDropdown}
      />
      {showDropdown ? (
        <Dropdown role="listbox">
          {filteredCats.slice(0, 8).map((c) => (
            <DropdownItem
              key={c.id}
              role="option"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pickCategory(c)}
            >
              {c.name}
            </DropdownItem>
          ))}
        </Dropdown>
      ) : null}
    </Wrap>
  );
}
