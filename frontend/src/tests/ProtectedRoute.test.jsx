import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';

const mockStore = (initialState) => configureStore({
  reducer: {
    auth: (state = initialState) => state,
  },
  preloadedState: {
    auth: initialState
  }
});

const TestComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;
const UnauthorizedComponent = () => <div>Unauthorized Page</div>;

describe('ProtectedRoute Component', () => {
  it('redirects to /login if not authenticated', () => {
    const store = mockStore({ isAuthenticated: false, user: null });
    
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/protected" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TestComponent />
              </ProtectedRoute>
            } />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children if authenticated and role is allowed', () => {
    const store = mockStore({ isAuthenticated: true, role: 'admin' });
    
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={
              <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
                <TestComponent />
              </ProtectedRoute>
            } />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login if authenticated but role is not allowed', () => {
    const store = mockStore({ isAuthenticated: true, role: 'student' });
    
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/protected" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TestComponent />
              </ProtectedRoute>
            } />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
