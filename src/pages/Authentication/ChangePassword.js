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
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { useFormik } from "formik";
import * as Yup from "yup";

import withRouter from "../../Components/Common/withRouter";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import phamacoreCloud from "../../assets/images/phamacore-cloud.jpg";

import { getLoggedinUser } from "../../helpers/api_helper";
import { changePassword } from "../../slices/auth/changepassword/thunk";

const ChangePassword = () => {
    document.title =
        "Change Password | phAMACore Analytics";

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const authUser = getLoggedinUser();

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);
    const [showNewPassword, setShowNewPassword] =
        useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const validation = useFormik({
        enableReinitialize: true,

        initialValues: {
            email: authUser?.email || "",
            identifier: authUser?.cusCode || "",
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },

        validationSchema: Yup.object({
            oldPassword: Yup.string().required(
                "Please enter your current password"
            ),

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
            dispatch(
                changePassword({
                    user: {
                        identifier: values.identifier,
                        oldPassword: values.oldPassword,
                        newPassword: values.newPassword,
                        confirmPassword: values.confirmPassword,
                    },
                })
            );
        },
    });

    const selectChangePasswordState = (state) =>
        state.ChangePassword;

    const selectChangePasswordProperties =
        createSelector(
            selectChangePasswordState,
            (state) => ({
                loading: state.loading,
                error: state.error,
                success: state.success,
            })
        );

    const { loading, error, success } = useSelector(
        selectChangePasswordProperties
    );

    useEffect(() => {
        if (success) {
            sessionStorage.removeItem("authUser");
            navigate("/login");
        }
    }, [success, navigate]);

    // useEffect(() => {
    //     if (!authUser) {
    //         navigate("/login");
    //     }
    // }, [authUser, navigate]);

    return (
        <ParticlesAuth>
            <div className="auth-page-content py-5">
                <Container>
                    <Row className="justify-content-center">
                        <Col md={8} lg={6} xl={5}>
                            <Card className="shadow-sm p-2">
                                <CardBody>
                                    <div className="text-center">
                                        <Link
                                            to="/login"
                                            className="d-block auth-logo"
                                        >
                                            <img
                                                src={phamacoreCloud}
                                                alt="phAMACore"
                                                style={{ height: "80px" }}
                                            />
                                        </Link>

                                        <h5 className="fw-medium mb-2">
                                            Change Password
                                        </h5>
                                    </div>

                                    <Alert
                                        color="warning"
                                        className="border-0 text-center mb-3"
                                    >
                                        Update your password to continue
                                        using phAMACore Analytics.
                                    </Alert>

                                    <div className="p-2">
                                        {error && (
                                            <Alert color="danger">
                                                {error}
                                            </Alert>
                                        )}

                                        {success && (
                                            <Alert color="success">
                                                Password updated successfully.
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
                                            {/* Email */}

                                            <div className="mb-3">
                                                <Label>Email</Label>

                                                <Input
                                                    value={validation.values.email}
                                                    disabled
                                                />
                                            </div>

                                            {/* Customer ID */}

                                            <div className="mb-3">
                                                <Label>Customer ID</Label>

                                                <Input
                                                    value={
                                                        validation.values.identifier
                                                    }
                                                    disabled
                                                />
                                            </div>

                                            {/* Current Password */}

                                            <div className="mb-3">
                                                <Label>
                                                    Current Password
                                                </Label>

                                                <InputGroup>
                                                    <Input
                                                        name="oldPassword"
                                                        type={
                                                            showCurrentPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        value={
                                                            validation.values
                                                                .oldPassword
                                                        }
                                                        onChange={
                                                            validation.handleChange
                                                        }
                                                        onBlur={
                                                            validation.handleBlur
                                                        }
                                                        invalid={
                                                            validation.touched
                                                                .oldPassword &&
                                                            !!validation.errors
                                                                .oldPassword
                                                        }
                                                    />

                                                    <InputGroupText
                                                        role="button"
                                                        onClick={() =>
                                                            setShowCurrentPassword(
                                                                !showCurrentPassword
                                                            )
                                                        }
                                                    >
                                                        <i
                                                            className={
                                                                showCurrentPassword
                                                                    ? "ri-eye-off-line"
                                                                    : "ri-eye-line"
                                                            }
                                                        />
                                                    </InputGroupText>

                                                    <FormFeedback>
                                                        {
                                                            validation.errors
                                                                .oldPassword
                                                        }
                                                    </FormFeedback>
                                                </InputGroup>
                                            </div>

                                            {/* New Password */}

                                            <div className="mb-3">
                                                <Label>New Password</Label>

                                                <InputGroup>
                                                    <Input
                                                        name="newPassword"
                                                        type={
                                                            showNewPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        value={
                                                            validation.values
                                                                .newPassword
                                                        }
                                                        onChange={
                                                            validation.handleChange
                                                        }
                                                        onBlur={
                                                            validation.handleBlur
                                                        }
                                                        invalid={
                                                            validation.touched
                                                                .newPassword &&
                                                            !!validation.errors
                                                                .newPassword
                                                        }
                                                    />

                                                    <InputGroupText
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
                                                        {
                                                            validation.errors
                                                                .newPassword
                                                        }
                                                    </FormFeedback>
                                                </InputGroup>
                                            </div>

                                            {/* Confirm Password */}

                                            <div className="mb-4">
                                                <Label>
                                                    Confirm Password
                                                </Label>

                                                <InputGroup>
                                                    <Input
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
                                                className="w-100"
                                                type="submit"
                                                disabled={loading}
                                            >
                                                {loading
                                                    ? "Updating..."
                                                    : "Update Password"}
                                            </Button>
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

ChangePassword.propTypes = {
    history: PropTypes.object,
};

export default withRouter(ChangePassword);