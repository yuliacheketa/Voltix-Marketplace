import React from "react";
import { Link, NavLink } from "react-router-dom";
import styled from "styled-components";
import { authStore } from "@voltix/shared-state";
import { useAuthHydrated, useAuthUser } from "@voltix/shared-state/hooks";
import { CartIcon } from "./CartIcon.jsx";

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

const UserName = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  max-width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LogOutBtn = styled.button`
  color: #f0f0f8;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  padding: 0.35rem 0.65rem;
  border-radius: 0.375rem;
  background: rgb(255 255 255 / 0.12);
  border: none;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    background: rgb(255 255 255 / 0.22);
  }
`;

const Icons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export function ShellHeader() {
  const hydrated = useAuthHydrated();
  const user = useAuthUser();

  return (
    <Header>
      <Inner>
        <Brand to="/">Voltix Marketplace</Brand>
        <Nav aria-label="Головна навігація">
          <NavLinkStyled to="/checkout">Оформити замовлення</NavLinkStyled>
          {!hydrated || !user ? (
            <NavLinkStyled to="/auth/login">Увійти</NavLinkStyled>
          ) : (
            <>
              {user.role === "SELLER" ? (
                <NavLinkStyled to="/seller">Seller Dashboard</NavLinkStyled>
              ) : null}
              <NavLinkStyled to="/profile">Мій профіль</NavLinkStyled>
              <UserName title={user.email}>
                {user.name?.trim() || user.email}
              </UserName>
              <LogOutBtn
                type="button"
                onClick={() => authStore.getState().clearSession()}
              >
                Вийти
              </LogOutBtn>
            </>
          )}
          <Icons>
            <CartIcon />
          </Icons>
        </Nav>
      </Inner>
    </Header>
  );
}
