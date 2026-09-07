import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
// CACHE BUST: 1

// Create our base API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL, // Adjust if your backend port changes
    prepareHeaders: (headers, { getState }) => {
      // Get the token from the Redux auth state
      const token = getState().auth.token;

      // If we have a token, add it to the authorization header
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  // Define tag types for caching and invalidation
  tagTypes: ['User', 'Quiz', 'Classroom', 'Dataset', 'Rooms'],
  
  // Endpoints will be injected from other files, but we can define some basic ones here
  endpoints: (builder) => ({
    // We can inject endpoints later using apiSlice.injectEndpoints()
  }),
});

export const { } = apiSlice;
