import { apiSlice } from "./apiSlice";

export const superAdminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Organizations
    getOrganizations: builder.query({
      query: (params) => {
        let url = "/super-admin/organizations";
        if (params && typeof params === 'object') {
          const filteredParams = {};
          Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== "") {
              filteredParams[k] = v;
            }
          });
          const queryParams = new URLSearchParams(filteredParams).toString();
          if (queryParams) url += `?${queryParams}`;
        }
        return url;
      },
      providesTags: ["Organization"],
    }),
    createOrganization: builder.mutation({
      query: (data) => ({
        url: "/super-admin/organizations",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),
    updateOrganization: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/super-admin/organizations/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),
    deleteOrganization: builder.mutation({
      query: (id) => ({
        url: `/super-admin/organizations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Organization"],
    }),

    // Admins (Organization Users)
    getAdmins: builder.query({
      query: (data) => ({
        url: "/super-admin/users/getOrganizationUsers",
        method: "POST",
        body: data,
      }),
      providesTags: ["Admin"],
    }),
    createAdmin: builder.mutation({
      query: (data) => ({
        url: "/super-admin/users/addUser",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Admin"],
    }),
    updateAdmin: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/super-admin/users/updateUser/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Admin"],
    }),
    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/super-admin/users/removeUser/${id}`,
        method: "POST", // Based on backend route definition
      }),
      invalidatesTags: ["Admin"],
    }),

    // Quizzes Access Control
    getQuizzes: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page);
        if (params?.limit) queryParams.append("limit", params.limit);
        if (params?.search) queryParams.append("search", params.search);
        return `/super-admin/quizzes?${queryParams.toString()}`;
      },
      providesTags: ["Quiz"],
    }),
    updateQuizAccess: builder.mutation({
      query: ({ quizId, access_type, allowed_organizations }) => ({
        url: `/super-admin/quizzes/access/${quizId}`,
        method: "PUT",
        body: { access_type, allowed_organizations },
      }),
      invalidatesTags: ["Quiz"],
    }),

    // Datasets Access Control
    getSuperAdminDatasets: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page);
        if (params?.limit) queryParams.append("limit", params.limit);
        if (params?.search) queryParams.append("search", params.search);
        return `/super-admin/datasets?${queryParams.toString()}`;
      },
      providesTags: ["Dataset"],
    }),
    updateDatasetAccess: builder.mutation({
      query: ({ datasetId, access_type, allowed_organizations }) => ({
        url: `/super-admin/datasets/access/${datasetId}`,
        method: "PUT",
        body: { access_type, allowed_organizations },
      }),
      invalidatesTags: ["Dataset"],
    }),
  }),
});

export const {
  useGetOrganizationsQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useGetQuizzesQuery,
  useUpdateQuizAccessMutation,
  useGetSuperAdminDatasetsQuery,
  useUpdateDatasetAccessMutation,
} = superAdminApiSlice;
