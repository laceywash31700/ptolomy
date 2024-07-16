import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const register = async (username, password) => {
    const response = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    setUser(data.user);
  };

  const login = async (username, password) => {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    setUser(data.user);
  };

  const createGame = async (gameName) => {
    const response = await fetch('/create-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, gameName }),
    });
    const data = await response.json();
    setUser({ ...user, sessionId: data.session.id, role: 'GM' });
  };

  const joinGame = async (sessionId) => {
    const response = await fetch('/join-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, sessionId }),
    });
    const data = await response.json();
    setUser({ ...user, sessionId: data.session.id, role: 'PC' });
  };

  return (
    <AuthContext.Provider value={{ user, register, login, createGame, joinGame }}>
      {children}
    </AuthContext.Provider>
  );
};
