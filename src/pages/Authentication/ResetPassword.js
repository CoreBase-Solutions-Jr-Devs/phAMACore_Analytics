import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Button,
    Card,
    CardBody,
    Col,
    Container,
    Form,
    FormFeedback,
    Input,
    InputGroup,
    InputGroupText,
    Label,
    Row,
} from "reactstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { useFormik } from "formik";
import * as Yup from "yup";

import withRouter from "../../Components/Common/withRouter";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import phamacoreCloud from "../../assets/images/phamacore-cloud.jpg";

import { resetPassword } from "../../slices/auth/resetpassword/thunk";

const ResetPassword = () => {
    document.title = "Reset Password | phAMACore Analytics";

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validation = useFormik({
        enableReinitialize: true,

        initialValues: {
            email: "",
            newPassword: "",
            confirmPassword: "",
        },

        validationSchema: Yup.object({
            email: Yup.string()
                .email("Please enter a valid email")
                .required("Please enter your email"),

            newPassword: Yup.string()
                .min(6, "Password must be at least 6 characters")
                .required("Please enter your new password"),

            confirmPassword: Yup.string()
                .oneOf(
                    [Yup.ref("newPassword"), null],
                    "Passwords do not match"
                )
                .required("Please confirm your password"),
        }),

        onSubmit: (values) => {
            if (!token) {
                return;
            }

            dispatch(
                resetPassword({
                    user: {
                        token: encodeURIComponent(token),
                        email: values.email,
                        newPassword: values.newPassword,
                        confirmPassword: values.confirmPassword,
                    },
                })
            );
        },
    });

    const selectResetPasswordState = (state) => state.ResetPassword;

    const selectResetPasswordProperties = createSelector(
        selectResetPasswordState,
        (state) => ({
            loading: state.loading,
            error: state.error,
            success: state.success,
        })
    );

    const { loading, error, success } = useSelector(
        selectResetPasswordProperties
    );

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    useEffect(() => {
        if (success) {
            navigate("/login");
        }
    }, [success, navigate]);

    return (
        <ParticlesAuth>
            <div className="auth-page-content py-2">
                <Container>
                    <Row className="justify-content-center">
                        <Col md={8} lg={6} xl={5}>
                            <Card className="shadow-sm">
                                <CardBody className="p-3">
                                    <div className="text-center">
                                        <Link
                                            to="/login"
                                            className="d-block auth-logo"
                                        >
                                            <img
                                                src={phamacoreCloud}
                                                alt="phAMACore"
                                                style={{ height: "58px" }}
                                            />
                                        </Link>

                                        <h5 className="fw-medium fs-4 mb-2">
                                            Reset Password
                                        </h5>
                                    </div>

                                    <Alert
                                        color="warning"
                                        className="border-0 text-center py-2 px-3 mb-2"
                                    >
                                        Enter your email and choose a new password.
                                    </Alert>

                                    <div className="p-2">
                                        {error && (
                                            <Alert color="danger">
                                                {error}
                                            </Alert>
                                        )}

                                        {success && (
                                            <Alert color="success">
                                                Password reset successfully.
                                                Redirecting to login...
                                            </Alert>
                                        )}

                                        <Form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                validation.handleSubmit();
                                                return false;
                                            }}
                                        >
                                            <div className="mb-2">
                                                <Label className="small fw-semibold mb-1">Email</Label>

                                                <Input
                                                    bsSize="sm"
                                                    name="email"
                                                    type="email"
                                                    value={validation.values.email}
                                                    onChange={validation.handleChange}
                                                    onBlur={validation.handleBlur}
                                                    invalid={
                                                        validation.touched.email &&
                                                        !!validation.errors.email
                                                    }
                                                />

                                                <FormFeedback>
                                                    {validation.errors.email}
                                                </FormFeedback>
                                            </div>

                                            <div className="mb-2">
                                                <Label className="small fw-semibold mb-1">New Password</Label>

                                                <InputGroup>
                                                    <Input
                                                        bsSize="sm"
                                                        name="newPassword"
                                                        type={
                                                            showNewPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        value={validation.values.newPassword}
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        invalid={
                                                            validation.touched.newPassword &&
                                                            !!validation.errors.newPassword
                                                        }
                                                    />

                                                    <InputGroupText
                                                        className="px-2"
                                                        role="button"
                                                        onClick={() =>
                                                            setShowNewPassword(
                                                                !showNewPassword
                                                            )
                                                        }
                                                    >
                                                        <i
                                                            className={
                                                                showNewPassword
                                                                    ? "ri-eye-off-line"
                                                                    : "ri-eye-line"
                                                            }
                                                        />
                                                    </InputGroupText>

                                                    <FormFeedback>
                                                        {validation.errors.newPassword}
                                                    </FormFeedback>
                                                </InputGroup>
                                            </div>

                                            <div className="mb-3">
                                                <Label className="small fw-semibold mb-1">Confirm Password</Label>

                                                <InputGroup>
                                                    <Input
                                                        bsSize="sm"
                                                        name="confirmPassword"
                                                        type={
                                                            showConfirmPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        value={
                                                            validation.values
                                                                .confirmPassword
                                                        }
                                                        onChange={
                                                            validation.handleChange
                                                        }
                                                        onBlur={
                                                            validation.handleBlur
                                                        }
                                                        invalid={
                                                            validation.touched
                                                                .confirmPassword &&
                                                            !!validation.errors
                                                                .confirmPassword
                                                        }
                                                    />

                                                    <InputGroupText
                                                        className="px-2"
                                                        role="button"
                                                        onClick={() =>
                                                            setShowConfirmPassword(
                                                                !showConfirmPassword
                                                            )
                                                        }
                                                    >
                                                        <i
                                                            className={
                                                                showConfirmPassword
                                                                    ? "ri-eye-off-line"
                                                                    : "ri-eye-line"
                                                            }
                                                        />
                                                    </InputGroupText>

                                                    <FormFeedback>
                                                        {
                                                            validation.errors
                                                                .confirmPassword
                                                        }
                                                    </FormFeedback>
                                                </InputGroup>
                                            </div>

                                            <Button
                                                color="success"
                                                size="sm"
                                                className="w-100 py-2"
                                                type="submit"
                                                disabled={loading}
                                            >
                                                {loading
                                                    ? "Resetting..."
                                                    : "Reset Password"}
                                            </Button>

                                            <div className="text-center mt-2">
                                                <Link className="small" to="/login">
                                                    Back to Login
                                                </Link>
                                            </div>
                                        </Form>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </ParticlesAuth>
    );
};

ResetPassword.propTypes = {
    history: PropTypes.object,
};

export default withRouter(ResetPassword);