import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      // Extract the ID safely (whether MongoDB sends it as _id or id)
      const itemId = item._id || item.id; 
      
      const existingItem = state.items.find(i => (i._id || i.id) === itemId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        // Push the entire item object and append a quantity of 1
        state.items.push({ ...item, quantity: 1, _id: itemId });
      }
      
      state.totalPrice += item.price;
    },
    removeFromCart: (state, action) => {
      const idToRemove = action.payload;
      const existingItem = state.items.find(i => (i._id || i.id) === idToRemove);

      if (existingItem) {
        state.totalPrice -= (existingItem.price * existingItem.quantity);
        state.items = state.items.filter(i => (i._id || i.id) !== idToRemove);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;