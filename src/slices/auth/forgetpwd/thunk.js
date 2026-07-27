import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  forgotPasswordAPI,
} from "../../../helpers/fakebackend_helper";

export const forgotPassword = createAsyncThunk(
  "forgetpwd/forgotPassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await forgotPasswordAPI(data);

      toast.success(
        response?.data?.detail ||
          response?.data?.message ||
          "Password reset link sent successfully.",
        {
          autoClose: 3000,
        }
      );

      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send reset link.";

      toast.error(message, {
        autoClose: 3000,
      });

      return rejectWithValue(message);
    }
  }
);