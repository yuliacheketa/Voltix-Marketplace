import React from "react";
import { Link, NavLink } from "react-router-dom";
import styled from "styled-components";
import { CartIcon } from "./CartIcon.jsx";
import { CompareIcon } from "./CompareIcon.jsx";

const Header = styled.header`
  padding: 18px 40px;
  background: linear-gradient(135deg, #333399 0%, #4a4ab5 55%, #5c5cc4 100%);
  color: #fafaff;
  box-shadow: 0 2px 12px rgb(51 51 153 / 0.25);
`;

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const Brand = styled(Link)`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: inherit;
  text-decoration: none;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const NavLinkStyled = styled(NavLink)`
  color: #f0f0f8;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  padding: 0.35rem 0.65rem;
  border-radius: 0.375rem;
  background: rgb(255 255 255 / 0.12);

  &:hover {
    background: rgb(255 255 255 / 0.22);
  }

  &.active {
    background: rgb(255 255 255 / 0.28);
  }
`;

const Icons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export function ShellHeader() {
  return (
    <Header>
      <Inner>
        <Brand to="/">Voltix Marketplace</Brand>
        <Nav aria-label="Main">
          <NavLinkStyled to="/checkout">Checkout</NavLinkStyled>
          <NavLinkStyled to="/compare">Compare</NavLinkStyled>
          <NavLinkStyled to="/auth">Sign in</NavLinkStyled>
          <Icons>
            <CartIcon />
            <CompareIcon />
          </Icons>
        </Nav>
      </Inner>
    </Header>
  );
}
