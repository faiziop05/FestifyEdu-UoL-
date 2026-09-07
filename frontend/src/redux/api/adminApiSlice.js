import { apiSlice } from "./apiSlice";

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTeachers: builder.query({
      query: (params) => {
        let url = `/admin/users/organization/${params.orgId}`;
        const filteredParams = {};
        Object.entries(params).forEach(([k, v]) => {
          if (k !== 'orgId' && v !== undefined && v !== "") {
            filteredParams[k] = v;
          }
        });
        const queryParams = new URLSearchParams(filteredParams).toString();
        if (queryParams) url += `?${queryParams}`;
        return url;
      },
      providesTags: ["Teacher"],
    }),
    createTeacher: builder.mutation({
      query: (data) => ({
        url: "/admin/users/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Teacher"],
    }),
    updateTeacher: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Teacher"],
    }),
    deleteTeacher: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teacher"],
    }),
    getAdminQuizzes: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams(params).toString();
        return `/admin/data-access/quizzes${queryParams ? `?${queryParams}` : ''}`;
      },
      providesTags: ["AdminQuizzes"],
    }),
    getAdminDatasets: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams(params).toString();
        return `/admin/data-access/datasets${queryParams ? `?${queryParams}` : ''}`;
      },
      providesTags: ["AdminDatasets"],
    }),
    updateAdminQuizAccess: builder.mutation({
      query: ({ quizId, access_type, allowed_teachers }) => ({
        url: `/admin/data-access/quizzes/${quizId}/access`,
        method: "PUT",
        body: { access_type, allowed_teachers },
      }),
      invalidatesTags: ["AdminQuizzes"],
    }),
    updateAdminDatasetAccess: builder.mutation({
      query: ({ datasetId, access_type, allowed_teachers }) => ({
        url: `/admin/data-access/datasets/${datasetId}/access`,
        method: "PUT",
        body: { access_type, allowed_teachers },
      }),
      invalidatesTags: ["AdminDatasets"],
    }),
    getOrganizationTeachers: builder.query({
      query: () => `/admin/data-access/teachers`,
      providesTags: ["Teacher"],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useGetAdminQuizzesQuery,
  useGetAdminDatasetsQuery,
  useUpdateAdminQuizAccessMutation,
  useUpdateAdminDatasetAccessMutation,
  useGetOrganizationTeachersQuery,
} = adminApiSlice;
