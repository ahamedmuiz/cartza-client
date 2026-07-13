import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const vendorApi = createApi({
  reducerPath: 'vendorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://cartza-server.onrender.com/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Menu', 'Orders'],
  endpoints: (builder) => ({
    createMenuItem: builder.mutation({
      query: (newItem) => ({
        url: '/menu',
        method: 'POST',
        body: newItem,
      }),
      invalidatesTags: ['Menu'],
    }),
    // NEW: Update an existing item
    updateMenuItem: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `/menu/${id}`,
        method: 'PUT',
        body: updatedData,
      }),
      invalidatesTags: ['Menu'],
    }),
    // NEW: Delete an item
    deleteMenuItem: builder.mutation({
      query: (id) => ({
        url: `/menu/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Menu'],
    }),
    getVendorOrders: builder.query({
      query: () => '/orders/vendor',
      providesTags: ['Orders'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const { 
  useCreateMenuItemMutation, 
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useGetVendorOrdersQuery, 
  useUpdateOrderStatusMutation 
} = vendorApi;