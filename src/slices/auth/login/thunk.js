//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import {
  postFakeLogin,
  postJwtLogin,
  postSocialLogin,
} from "../../../helpers/fakebackend_helper";
import { setAuthorization } from "../../../helpers/api_helper";
import { loginStart,loginSuccess, logoutUserSuccess, apiError, reset_login_flag } from './reducer';
import { loginUserAPI, logoutUserAPI  } from "../../../helpers/url_helper";

export const loginUser = (user, history) => async (dispatch) => {
  try {
    dispatch(loginStart());

    const apiResponse = await loginUserAPI({
      userName: user.username,
      password: user.password,
      clientPin: 0,
      long: "",
      latt: "",
      machineCookie: "",
      ipLocation: "",
    });

    const response = apiResponse.data;

    console.log("LOGIN RESPONSE:", response);

    if (response?.token) {

      sessionStorage.setItem("authUser", JSON.stringify(response));

      setAuthorization(response.token);

      dispatch(loginSuccess(response));

      history("/dashboard");

    } else {
      dispatch(apiError({ data: "Invalid credentials" }));
    }

  } catch (error) {

    console.log("LOGIN ERROR:", error);

    dispatch(
      apiError({
        data:
          error?.response?.data?.message ||
          error?.message ||
          "Login failed",
      })
    );
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    const token = JSON.parse(sessionStorage.getItem("authUser"))?.token;

    if (token) {
      await logoutUserAPI(token); // only call if token exists
    }

    sessionStorage.removeItem("authUser");
    setAuthorization(null);

    dispatch(logoutUserSuccess(true));

  } catch (error) {
    console.log("LOGOUT ERROR:", error);

    sessionStorage.removeItem("authUser");
    setAuthorization(null);

    dispatch(logoutUserSuccess(true));
  }
};

export const socialLogin = (type, history) => async (dispatch) => {
  try {
    let response;

    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const fireBaseBackend = getFirebaseBackend();
      response = fireBaseBackend.socialLoginUser(type);
    }
    //  else {
      //   response = postSocialLogin(data);
      // }
      
      const socialdata = await response;
    if (socialdata) {
      sessionStorage.setItem("authUser", JSON.stringify(response));
      dispatch(loginSuccess(response));
      history('/dashboard')
    }

  } catch (error) {
    dispatch(apiError(error));
  }
};

export const resetLoginFlag = () => async (dispatch) => {
  try {
    const response = dispatch(reset_login_flag());
    return response;
  } catch (error) {
    dispatch(apiError(error));
  }
};