import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const menuApi = createApi({
  reducerPath: 'menuApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://cartza-server.onrender.com/api',
    prepareHeaders: (headers, { getState }) => {
      // Get the token from the Redux state
      const token = getState().auth.token;
      
      // If we have a token, set it in the header
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Menu'],
  endpoints: (builder) => ({
    getMenu: builder.query({
      query: () => '/menu',
      providesTags: ['Menu'],
    }),
    getMenuItemById: builder.query({
      query: (id) => `/menu/${id}`,
    }),
  }),
});

export const { useGetMenuQuery, useGetMenuItemByIdQuery } = menuApi;