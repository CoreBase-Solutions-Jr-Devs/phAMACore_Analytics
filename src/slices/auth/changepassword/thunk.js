import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { changePasswordAPI } from "../../../helpers/fakebackend_helper";
import { setAuthorization } from "../../../helpers/api_helper";

export const changePassword = createAsyncThunk(
    "changePassword/changePassword",
    async (data, { rejectWithValue }) => {
        try {
            const response = await changePasswordAPI(data);

            return response.data.result;
        } catch (error) {
            toast.error(
                error?.response?.data?.detail || error.message,
                {
                    autoClose: 3000,
                }
            );

            return rejectWithValue(
                error?.response?.data?.detail || error.message
            );
        }
    }
);