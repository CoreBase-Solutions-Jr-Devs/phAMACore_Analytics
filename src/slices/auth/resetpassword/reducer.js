import { createSlice } from "@reduxjs/toolkit";
import { resetPassword } from "./thunk";

const initialState = {
    loading: false,
    error: null,
    success: false,
    message: "",
};

const resetPasswordSlice = createSlice({
    name: "ResetPassword",
    initialState,

    reducers: {
        reset_reset_password_flag: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })

            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.success = action.payload?.isSuccess ?? false;
                state.message = action.payload?.message ?? "";
            })

            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload;
            });
    },
});

export const { reset_reset_password_flag } =
    resetPasswordSlice.actions;

export default resetPasswordSlice.reducer;