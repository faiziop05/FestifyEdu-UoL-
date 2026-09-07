import { apiSlice } from "./apiSlice";

export const quizApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createQuiz: builder.mutation({
      query: (data) => ({
        url: "/teacher/quizzes",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Quiz"],
    }),
    getQuizzesByTeacher: builder.query({
      query: (args) => {
        if (typeof args === 'string' || typeof args === 'number') {
          return `/teacher/quizzes/teacher/${args}`;
        }
        
        const { teacherId, ...params } = args;
        let url = `/teacher/quizzes/teacher/${teacherId}`;
        
        if (params && Object.keys(params).length > 0) {
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
      providesTags: ["Quiz"],
    }),
    getPublishedQuizzes: builder.query({
      query: () => `/teacher/quizzes/published`,
      providesTags: ["Quiz"],
    }),
    getQuizById: builder.query({
      query: (id) => `/teacher/quizzes/quiz/${id}`,
      providesTags: (result, error, id) => [{ type: "Quiz", id }],
    }),
    getStudentQuizById: builder.query({
      query: (id) => `/student/quizzes/${id}`,
      providesTags: (result, error, id) => [{ type: "Quiz", id }],
    }),
    submitStudentQuiz: builder.mutation({
      invalidatesTags: ["SessionStatus"],
      query: (payload) => ({
        url: "/student/quizzes/submit",
        method: "POST",
        body: payload,
      }),
    }),
    saveStudentProgress: builder.mutation({
      query: (progressData) => ({
        url: "/student/quizzes/progress",
        method: "POST",
        body: progressData,
      }),
    }),
    getStudentSessionStatus: builder.query({
      query: (sessionId) => `/student/quizzes/session/${sessionId}`,
      providesTags: ["SessionStatus"],
    }),
    updateQuiz: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/teacher/quizzes/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Quiz"],
    }),
    deleteQuiz: builder.mutation({
      query: (id) => ({
        url: `/teacher/quizzes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Quiz"],
    }),
  }),
});

export const {
  useCreateQuizMutation,
  useGetQuizzesByTeacherQuery,
  useGetPublishedQuizzesQuery,
  useGetQuizByIdQuery,
  useGetStudentQuizByIdQuery,
  useSubmitStudentQuizMutation,
  useSaveStudentProgressMutation,
  useGetStudentSessionStatusQuery,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
} = quizApiSlice;
