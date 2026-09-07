import { describe, it, expect } from 'vitest';
import authReducer, { loginSuccess, logout } from '../redux/slices/authSlice';

describe('authSlice reducer', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    role: null,
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle loginSuccess', () => {
    const actual = authReducer(
      initialState,
      loginSuccess({ user: { name: 'Test' }, token: '12345', role: 'teacher' })
    );
    expect(actual.user).toEqual({ name: 'Test' });
    expect(actual.token).toEqual('12345');
    expect(actual.role).toEqual('teacher');
    expect(actual.isAuthenticated).toEqual(true);
  });

  it('should handle logout', () => {
    const loggedInState = {
      user: { name: 'Test' },
      token: '12345',
      isAuthenticated: true,
      role: 'teacher',
    };
    const actual = authReducer(loggedInState, logout());
    expect(actual).toEqual(initialState);
  });
});
