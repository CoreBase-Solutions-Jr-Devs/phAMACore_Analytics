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
      const authUser = response.data;

      localStorage.setItem("authUser", JSON.stringify(authUser));
      setAuthorization(authUser.token);
      setTimeout(() => {
        toast.success("Login successful!", {
          autoClose: 2000,
        });
      }, 500);

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
      const token = JSON.parse(localStorage.getItem("authUser"))?.token;
      if (token) {
        await logoutUserAPI({ token });
        toast.success("Logout successful!", {
          autoClose: 2000,
        });
      }
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error?.response?.data?.detail || error.message, {
        autoClose: 3000,
      });
      return rejectWithValue(
        error?.response?.data?.detail || error.message || "Logout failed!"
      );
    } finally {
      localStorage.removeItem("authUser");
      setAuthorization(null);
    }
  }
);
