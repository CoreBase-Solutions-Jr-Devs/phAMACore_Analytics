import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Row,
  Button,
  Form,
  FormFeedback,
  Alert,
  Spinner,
  CardTitle,
} from "reactstrap";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
// import { loginUserAPI } from "../../helpers/url_helper";
//redux
import { useSelector, useDispatch } from "react-redux";
// import { setAuthorization } from "../../helpers/api_helper";
import { Link, useNavigate } from "react-router-dom";
import withRouter from "../../Components/Common/withRouter";
// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";

// actions
import { loginUser } from "../../slices/auth/login/thunk";
import phamacoreCloud from "../../assets/images/phamacore-cloud.jpg";
// import logoLight from "../../assets/images/logo-light.png";
import { createSelector } from "reselect";
//import images

const Login = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectLayoutState = (state) => state;
  const loginpageData = createSelector(selectLayoutState, (state) => ({
    user: state.Account.user,
    error: state.Login.error,
    loading: state.Login.loading,
    errorMsg: state.Login.errorMsg,
  }));
  const { user, error, loading, errorMsg } = useSelector(loginpageData);

  const [userLogin, setUserLogin] = useState({});
  const [passwordShow, setPasswordShow] = useState(false);

  useEffect(() => {
    if (user && user) {
      const updatedUserData =
        process.env.REACT_APP_DEFAULTAUTH === "firebase"
          ? user.multiFactor.user.username
          : user.username;
      const updatedUserPassword =
        process.env.REACT_APP_DEFAULTAUTH === "firebase"
          ? ""
          : user.confirm_password;
      setUserLogin({
        username: updatedUserData,
        password: updatedUserPassword,
      });
    }
  }, [user]);

  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      username: userLogin.username || "",
      password: userLogin.password || "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Please Enter Your Username"),
      password: Yup.string().required("Please Enter Your Password"),
    }),

 onSubmit: async (values) => {
  const payload = {
    user: {
      cusCode: values.username,
      password: values.password,
    },
  };

  try {
    const authUser = await dispatch(loginUser(payload)).unwrap();

    if (authUser.requirePasswordChange) {
      navigate("/change-password");
    } else {
      navigate("/dashboard");
    }
  } catch (error) {
    console.error(error);
  }
},
  });

  const signIn = (type) => {
    dispatch(socialLogin(type, props.router.navigate));
  };

  //handleTwitterLoginResponse
  // const twitterResponse = e => {}

  //for facebook and google authentication
  const socialResponse = (type) => {
    signIn(type);
  };

  useEffect(() => {
    if (errorMsg) {
      setTimeout(() => {
        dispatch(resetLoginFlag());
      }, 3000);
    }
  }, [dispatch, errorMsg]);
  document.title = "Login | phAMACore Analytics - Admin Dashboards";
  return (
    <React.Fragment>
 <ParticlesAuth>
  <div className="auth-page-content py-5">
    <Container >
      <Row className="justify-content-center">
      <Col md={8} lg={6} xl={5}>
      <Card className="shadow-sm p-2">
  <CardBody >
    <div className="text-center ">
      <Link to="/" className="d-block auth-logo">
        <img
          src={phamacoreCloud}
          alt="phAMACore"
          style={{ height: "80px" }}
        />
      </Link>

      <h5 className="fw-medium mb-2">Welcome Back!</h5>

      <p className="text-muted mb-0">
        Please enter your credentials to sign in!
      </p>
    </div>
                    {error && error ? (
                      <Alert color="danger"> {error} </Alert>
                    ) : null}
                    <div className="p-2 ">
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                          validation.handleSubmit();
                          return false;
                        }}
                        action="#"
                      >
                        <div className="mb-3">
                          <Label htmlFor="username" className="form-label">
                            Customer ID
                          </Label>
                          <Input
                            name="username"
                            className="form-control"
                            placeholder="Enter username"
                            type="username"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.username || ""}
                            invalid={
                              validation.touched.username &&
                              validation.errors.username
                                ? true
                                : false
                            }
                          />
                          {validation.touched.username &&
                          validation.errors.username ? (
                            <FormFeedback type="invalid">
                              {validation.errors.username}
                            </FormFeedback>
                          ) : null}
                        </div>

                        <div className="mb-3">
                          <div className="float-end">
                            <Link
                              to="/forgot-password"
                              className="text-caramel"
                            >
                              Forgot password?
                            </Link>
                          </div>
                          <Label
                            className="form-label"
                            htmlFor="password-input"
                          >
                            Password
                          </Label>
                          <div className="position-relative auth-pass-inputgroup mb-3">
                            <Input
                              name="password"
                              value={validation.values.password || ""}
                              type={passwordShow ? "text" : "password"}
                              className="form-control pe-5"
                              placeholder="Enter Password"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              invalid={
                                validation.touched.password &&
                                validation.errors.password
                                  ? true
                                  : false
                              }
                            />
                            {validation.touched.password &&
                            validation.errors.password ? (
                              <FormFeedback type="invalid">
                                {validation.errors.password}
                              </FormFeedback>
                            ) : null}
                            <button
                              className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                              type="button"
                              id="password-addon"
                              onClick={() => setPasswordShow(!passwordShow)}
                            >
                              <i className="ri-eye-fill align-middle"></i>
                            </button>
                          </div>
                        </div>

                        <div className="form-check">
                          <Input
                            className="form-check-input"
                            type="checkbox"
                            value=""
                            id="auth-remember-check"
                          />
                          <Label
                            className="form-check-label"
                            htmlFor="auth-remember-check"
                          >
                            Remember me
                          </Label>
                        </div>

                        <div className="mt-4">
                          <Button
                            color="caramel"
                            disabled={error ? null : loading ? true : false}
                            className="btn btn-caramel w-100"
                            type="submit"
                          >
                            {loading ? (
                              <Spinner size="sm" className="me-2">
                                {" "}
                                Loading...{" "}
                              </Spinner>
                            ) : null}
                            Sign In
                          </Button>
                        </div>

                        {/* <div className="mt-4 text-center">
                          <p className="mb-0">
                            Don't have an account ?{" "}
                            <Link
                              to="/register"
                              className="fw-semibold text-caramel text-decoration-underline"
                            >
                              {" "}
                              Signup{" "}
                            </Link>{" "}
                          </p>
                        </div> */}
                        {/* <div className="mt-4 text-center">
                          <div className="signin-other-title">
                            <h5 className="fs-13 mb-4 title">Sign In with</h5>
                          </div>
                          <div>
                            <Link
                              to="#"
                              className="btn btn-primary btn-icon me-1"
                              onClick={(e) => {
                                e.preventDefault();
                                socialResponse("facebook");
                              }}
                            >
                              <i className="ri-facebook-fill fs-16" />
                            </Link>
                            <Link
                              to="#"
                              className="btn btn-danger btn-icon me-1"
                              onClick={(e) => {
                                e.preventDefault();
                                socialResponse("google");
                              }}
                            >
                              <i className="ri-google-fill fs-16" />
                            </Link>
                            <Button color="dark" className="btn-icon">
                              <i className="ri-github-fill fs-16"></i>
                            </Button>{" "}
                            <Button color="info" className="btn-icon">
                              <i className="ri-twitter-fill fs-16"></i>
                            </Button>
                          </div>
                        </div> */}
                      </Form>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </ParticlesAuth>
    </React.Fragment>
  );
};

export default withRouter(Login);
