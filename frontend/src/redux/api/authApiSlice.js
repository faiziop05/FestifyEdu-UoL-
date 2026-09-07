import { apiSlice } from "./apiSlice";

export const loginApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: "/auth/profile",
        method: "PUT",
        body: profileData,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useUpdateProfileMutation } = loginApi;
