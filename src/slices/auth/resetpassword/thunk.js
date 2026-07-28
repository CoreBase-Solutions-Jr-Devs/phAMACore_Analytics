import { createAsyncThunk } from "@reduxjs/toolkit";
import { resetPasswordAPI } from "../../../helpers/fakebackend_helper";

export const resetPassword = createAsyncThunk(
    "auth/resetPassword",
    async (data, { rejectWithValue }) => {
        try {
            const response = await resetPasswordAPI(data);

            console.log("Axios response:", response);
            console.log("Response data:", response.data);

            const payload = response.data ?? response;

            console.log("Payload:", payload);

            if (payload.result?.isSuccess) {
                console.log("FULFILLED");
                return payload.result;
            }

            console.log("REJECTED (business logic)");
            return rejectWithValue(
                payload.result?.message ?? "Unable to reset password."
            );
        } catch (error) {
            console.log("THUNK ERROR:", error);

            return rejectWithValue(
                error?.result?.message ||
                error?.message ||
                "Something went wrong."
            );
        }
    }
);