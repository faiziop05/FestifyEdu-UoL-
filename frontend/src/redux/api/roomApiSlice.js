import { apiSlice } from "./apiSlice";

export const roomApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRooms: builder.query({
      query: () => "/teacher/rooms",
      providesTags: ["Rooms"],
    }),
    getRoomById: builder.query({
      query: (id) => `/teacher/rooms/${id}`,
      providesTags: (result, error, id) => [{ type: "Rooms", id }],
    }),
    createRoom: builder.mutation({
      query: (roomData) => ({
        url: "/teacher/rooms",
        method: "POST",
        body: roomData,
      }),
      invalidatesTags: ["Rooms"],
    }),
    updateRoom: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/teacher/rooms/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Rooms", id }, "Rooms"],
    }),
    deleteRoom: builder.mutation({
      query: (id) => ({
        url: `/teacher/rooms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Rooms"],
    }),
    enterRoom: builder.mutation({
      query: (credentials) => ({
        url: "/student/rooms/enter",
        method: "POST",
        body: credentials, // { room_code, student_id }
      }),
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useGetRoomByIdQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useEnterRoomMutation,
} = roomApiSlice;
