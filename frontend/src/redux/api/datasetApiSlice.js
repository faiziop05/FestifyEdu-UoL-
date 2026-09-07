import { apiSlice } from "./apiSlice";

export const datasetApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDatasets: builder.query({
      query: (teacherId) => `/teacher/datasets?teacherId=${teacherId}`,
      providesTags: ["Dataset"],
    }),
    getDatasetData: builder.query({
      query: ({ datasetId, sheet, page = 1, limit = 100, search = "" }) =>
        `/teacher/datasets/${datasetId}/data?sheet=${encodeURIComponent(sheet)}&page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      providesTags: (result, error, arg) => [
        { type: "DatasetData", id: arg.datasetId },
      ],
    }),
    getDatasetExport: builder.query({
      query: (datasetId) => `/teacher/datasets/${datasetId}/export`,
    }),
    createDataset: builder.mutation({
      query: (data) => ({
        url: "/teacher/datasets",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Dataset"],
    }),
    deleteDataset: builder.mutation({
      query: (datasetId) => ({
        url: `/teacher/datasets/${datasetId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Dataset"],
    }),
  }),
});

export const {
  useGetDatasetsQuery,
  useGetDatasetDataQuery,
  useLazyGetDatasetDataQuery,
  useLazyGetDatasetExportQuery,
  useCreateDatasetMutation,
  useDeleteDatasetMutation,
} = datasetApiSlice;
