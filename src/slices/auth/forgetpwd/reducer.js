import { createSlice } from "@reduxjs/toolkit";
import { forgotPassword } from "./thunk";

export const initialState = {
  forgetSuccessMsg: null,
  forgetError: null,
  loading: false,
  forgetPasswordResponse: null,
};

const forgotPasswordSlice = createSlice({
  name: "forgotpwd",

  initialState,

  reducers: {
    reset_forget_password: (state) => {
      state.forgetSuccessMsg = null;
      state.forgetError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.forgetError = null;
        state.forgetSuccessMsg = null;
      })

      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.forgetSuccessMsg =
          action.payload?.detail ||
          action.payload?.message ||
          "Password reset link sent successfully.";

        state.forgetPasswordResponse = action.payload;
      })

      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.forgetError = action.payload;
      });
  },
});

export const {
  reset_forget_password,
} = forgotPasswordSlice.actions;

export default forgotPasswordSlice.reducer;