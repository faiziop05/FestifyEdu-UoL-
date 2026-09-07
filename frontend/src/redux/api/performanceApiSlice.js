import { apiSlice } from './apiSlice';

export const performanceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStudentPerformance: builder.query({
      query: () => '/teacher/performance',
      providesTags: ['Performance'],
    }),
    getStudentPerformanceDetail: builder.query({
      query: (studentId) => `/teacher/performance/${studentId}`,
      providesTags: (result, error, arg) => [{ type: 'Performance', id: arg }],
    }),
  }),
});

export const { useGetStudentPerformanceQuery, useGetStudentPerformanceDetailQuery } = performanceApiSlice;
