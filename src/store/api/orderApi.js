import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://cartza-server.onrender.com/api', 
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Orders'],
    }),
    getMyOrders: builder.query({
      query: () => '/orders/myorders',
      providesTags: ['Orders'],
    }),
    // ADDED: Mutation for students to cancel their own order
    cancelOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}/status`, // Uses the same status endpoint
        method: 'PUT',
        body: { status: 'Cancelled' },
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const { useCreateOrderMutation, useGetMyOrdersQuery, useCancelOrderMutation } = orderApi;