import PropTypes from "prop-types";
import React from "react";
import { Row, Col, Alert, Card, CardBody, Container, FormFeedback, Input, Label, Form } from "reactstrap";
import phamacoreCloud from "../../assets/images/phamacore-cloud.jpg";
//redux
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import withRouter from "../../Components/Common/withRouter";
// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

// action
import { forgotPassword } from "../../slices/auth/forgetpwd/thunk";

// import images
// import profile from "../../assets/images/bg.png";
import logoLight from "../../assets/images/logo-light.png";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { createSelector } from "reselect";

const ForgetPasswordPage = props => {
  const dispatch = useDispatch();
 const navigate = useNavigate();
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

  initialValues: {
  identifier: "",
},
 validationSchema: Yup.object({
  identifier: Yup.string().required("Please enter Customer ID"),
}),
    onSubmit: (values) => {
      dispatch(forgotPassword({ identifier: values.identifier }));
    }
  });


const selectForgotPasswordState = (state) => state.forgotpwd;

const selectForgotPasswordProperties = createSelector(
  selectForgotPasswordState,
  (state) => ({
    loading: state.loading,
    forgetError: state.forgetError,
    forgetSuccessMsg: state.forgetSuccessMsg,
    forgetPasswordResponse: state.forgetPasswordResponse,
  })
);

const {
  loading,
  forgetError,
  forgetSuccessMsg,
  forgetPasswordResponse,
} = useSelector(selectForgotPasswordProperties);

  document.title = "Reset Password | Velzon - React Admin & Dashboard Template";
  return (
    <ParticlesAuth>
      <div className="auth-page-content py-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className=" shadow-sm p-2">
                <CardBody >
                  <div className="text-center ">
                         <Link to="/" className="d-block auth-logo">
                            <img
                              src={phamacoreCloud}
                              alt="phAMACore"
                              style={{ height: "80px" }}
                            />
                          </Link>
                    <h5 className="fw-medium mb-2">Forgot Password</h5>
                  </div>

                  <Alert className="border-0 alert-warning text-center mb-2 mx-2" role="alert">
Enter your Customer ID to receive your new password                  </Alert>
                  <div className="p-2">
                    {forgetError  ? (
                      <Alert color="danger" style={{ marginTop: "13px" }}>
                        {forgetError}
                      </Alert>
                    ) : null}
                    {forgetSuccessMsg ? (
                      <Alert color="success" style={{ marginTop: "13px" }}>
                        {forgetSuccessMsg}
                      </Alert>
                    ) : null}
                    <Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}
                    >
                      <div className="mb-4">
                        <Label className="form-label">Customer ID</Label>
                    <Input
  name="identifier"
  className="form-control"
  placeholder="Enter Customer ID"
  type="text"
  onChange={validation.handleChange}
  onBlur={validation.handleBlur}
  value={validation.values.identifier}
  invalid={
    validation.touched.identifier &&
    !!validation.errors.identifier
  }
/>

{validation.touched.identifier &&
validation.errors.identifier ? (
  <FormFeedback>
    {validation.errors.identifier}
  </FormFeedback>
) : null}
                  
                      </div>

                     <div className="d-flex gap-2 mt-4">
<button
  className="btn btn-success w-100"
  type="submit"
  disabled={loading}
>
  {loading ? "Sending..." : "Send Reset Link"}
</button>                
<button
  className="btn btn-outline-danger w-100"
  type="button"
  onClick={() => navigate("/login")}
>
  Cancel
</button>
                      </div>
                    </Form>
                  </div>
                </CardBody>
              </Card>

              {/* <div className="mt-4 text-center">
                <p className="mb-0">Wait, I remember my password... <Link to="/login" className="fw-semibold text-primary text-decoration-underline"> Click here </Link> </p>
              </div> */}

            </Col>
          </Row>
        </Container>
      </div>
    </ParticlesAuth>
  );
};

ForgetPasswordPage.propTypes = {
  history: PropTypes.object,
};

export default withRouter(ForgetPasswordPage);
