import React from "react";
import styled from "styled-components";
import { colors } from "@voltix/ui-kit";
import { FilterSidebar } from "../components/FilterSidebar.jsx";
import { SearchBar } from "../components/SearchBar.jsx";
import { SortDropdown } from "../components/SortDropdown.jsx";
import { ProductGrid } from "../components/ProductGrid.jsx";

const Shell = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: stretch;
  background: ${colors.pageBg};
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 1rem 1.5rem 2rem;
  background: ${colors.surfaceMuted};
`;

const TopBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1.25rem;
`;

export function CatalogHomePage() {
  return (
    <Shell>
      <FilterSidebar />
      <Main>
        <TopBar>
          <SearchBar />
          <SortDropdown />
        </TopBar>
        <ProductGrid />
      </Main>
    </Shell>
  );
}
