import { createSlice } from "@reduxjs/toolkit";
import { changePassword } from "./thunk";

const initialState = {
    loading: false,
    error: null,
    success: false,
};

const changePasswordSlice = createSlice({
    name: "ChangePassword",
    initialState,

    reducers: {
        reset_change_password_flag: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(changePassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })

            .addCase(changePassword.fulfilled, (state, action) => {
                state.loading = false;
                state.success = action.payload?.isSuccess ?? false;
            })

            .addCase(changePassword.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload;
            });
    },
});

export const { reset_change_password_flag } =
    changePasswordSlice.actions;

export default changePasswordSlice.reducer;