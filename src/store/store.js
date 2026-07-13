import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import { authApi } from './api/authApi';
import { menuApi } from './api/menuApi';
import { vendorApi } from './api/vendorApi';
import { orderApi } from './api/orderApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    [authApi.reducerPath]: authApi.reducer,
    [menuApi.reducerPath]: menuApi.reducer,
    [vendorApi.reducerPath]: vendorApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(menuApi.middleware)
      .concat(vendorApi.middleware)
      .concat(orderApi.middleware),
});