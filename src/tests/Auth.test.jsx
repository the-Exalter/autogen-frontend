import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

function Wrapper({ initialPath = '/', isLoggedIn = false }) {
  if (isLoggedIn) {
    localStorage.setItem('ag_token', 'fake_token');
    localStorage.setItem('ag_user', JSON.stringify({ id: '1', name: 'Test', role: 'user' }));
  } else {
    localStorage.removeItem('ag_token');
    localStorage.removeItem('ag_user');
  }

  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  afterEach(() => { localStorage.clear(); });

  it('redirects unauthenticated users to /login', () => {
    render(<Wrapper initialPath="/protected" isLoggedIn={false} />);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('shows content for authenticated users', () => {
    render(<Wrapper initialPath="/protected" isLoggedIn={true} />);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
