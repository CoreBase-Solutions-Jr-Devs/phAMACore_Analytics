import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  loginUserAPI,
  logoutUserAPI,
} from "../../../helpers/fakebackend_helper";
import { setAuthorization } from "../../../helpers/api_helper";

export const loginUser = createAsyncThunk(
  "login/loginUser",
  async (data, { rejectWithValue }) => {
    try {
      const response = await loginUserAPI(data);

      const authUser = response.data.response;

      localStorage.setItem(
        "authUser",
        JSON.stringify(authUser)
      );

      setAuthorization(authUser.token);

      return authUser;
    } catch (error) {
      toast.error(error?.response?.data?.detail || error.message, {
        autoClose: 3000,
      });

      return rejectWithValue(
        error?.response?.data?.detail || error.message
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "login/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const authUser = JSON.parse(localStorage.getItem("authUser"));
      const token = authUser?.token;

      if (!token) {
        return rejectWithValue("No token found");
      }

      // Call logout endpoint
      await logoutUserAPI(token);

      // Only clear session if API succeeds
      localStorage.removeItem("authUser");
      setAuthorization(null);

      return true;
    } catch (error) {
      // Keep the user logged in
      return rejectWithValue(
        error?.detail ||
        error?.message ||
        "Logout failed"
      );
    }
  }
);

