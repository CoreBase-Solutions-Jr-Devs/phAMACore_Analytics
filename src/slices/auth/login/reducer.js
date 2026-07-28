import { createSlice } from "@reduxjs/toolkit";
import { loginUser, logoutUser, forgotPassword } from "./thunk";

const initialState = {
  user: null,
  loading: false,
  error: null,
  isUserLogout: false,
 
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    reset_login_flag: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOGOUT
    .addCase(logoutUser.pending, (state) => {
  state.loading = true;
})

.addCase(logoutUser.fulfilled, (state) => {
  state.loading = false;
  state.user = null;
  state.isUserLogout = true;
})

.addCase(logoutUser.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.isUserLogout = false; 
})
  },
});

export const { reset_login_flag } = loginSlice.actions;

export default loginSlice.reducer;