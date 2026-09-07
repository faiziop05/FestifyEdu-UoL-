import { apiSlice } from "./apiSlice";

export const driveApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDriveAuthUrl: builder.query({
      query: (userId) => `/drive/auth-url?userId=${userId}`,
    }),
    getDriveFiles: builder.query({
      query: (userId) => `/drive/files?userId=${userId}`,
    }),
    importDriveFile: builder.mutation({
      query: (data) => ({
        url: "/drive/import",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLazyGetDriveAuthUrlQuery,
  useLazyGetDriveFilesQuery,
  useImportDriveFileMutation,
} = driveApiSlice;
