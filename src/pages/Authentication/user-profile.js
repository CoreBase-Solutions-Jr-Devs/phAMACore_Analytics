import React, { useState, useEffect } from "react";
import { isEmpty } from "lodash";

import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  CardBody,
  Button,
  Label,
  Input,
  FormFeedback,
  Form,
} from "reactstrap";
// import BreadCrumb from "../../Components/Common/BreadCrumb";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";
import { Link } from "react-router-dom";
//redux
import { useSelector, useDispatch } from "react-redux";

import avatar from "../../assets/images/users/avatar-1.jpg";
// actions
import { editProfile, resetProfileFlag } from "../../slices/thunks";
import { createSelector } from "reselect";

const UserProfile = () => {
  const dispatch = useDispatch();
const [cusCode, setCusCode] = useState("");
const [phone, setPhone] = useState("");
const [fullName, setFullName] = useState("");
  const [email, setemail] = useState("admin@gmail.com");
  const [idx, setidx] = useState("1");

  const [userName, setUserName] = useState("Admin");



  const selectLayoutState = (state) => state.Profile;
  const userprofileData = createSelector(
    selectLayoutState,
    (state) => ({
      user: state.user,
      success: state.success,
      error: state.error
    })
  );
  // Inside your component
  const {
    user, success, error 
  } = useSelector(userprofileData);



useEffect(() => {
  const stored = localStorage.getItem("authUser");

  if (!stored) return;

  const obj = JSON.parse(stored);

  setCusCode(obj?.cusCode || "");
  setemail(obj?.email || "admin@gmail.com");
  setPhone(obj?.phone || "");
  setFullName(obj?.fullName || "Admin");

  // Use the full name as the username
  setUserName(obj?.fullName || "Admin");

  setTimeout(() => {
    dispatch(resetProfileFlag());
  }, 3000);

}, [dispatch]);



  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
   first_name: userName ?? "Admin",
      idx: idx || '',
    },
    validationSchema: Yup.object({
      first_name: Yup.string().required("Please Enter Your UserName"),
    }),
    onSubmit: (values) => {
      dispatch(editProfile(values));
    }
  });

  document.title = "Profile | Velzon - React Admin & Dashboard Template";
  return (
  <React.Fragment>
  <div className="page-content ">
    <Container fluid>
                  {/* <BreadCrumb  pageTitle="Profile" /> */}
      
<div className="d-flex justify-content-between align-items-center p-2 ">

    <div>
        <h2 className="fw-bold mb-1">
            My Profile
        </h2>

        <p className="text-muted mb-0">
            View your account information
        </p>
    </div>
</div>

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <CardBody className="p-4">
          <div className="d-flex align-items-center">

            <img
              src={avatar}
              alt=""
              className="rounded-circle border border-3 border-warning"
              width={90}
              height={90}
            />

            <div className="ms-4">
              <h3 className="mb-1 fw-semibold">
                {fullName || userName}
              </h3>

              <p className="text-muted mb-2">
                Administrator
              </p>

              <span className="badge bg-success-subtle text-success">
                ● Active
              </span>
            </div>

          </div>
        </CardBody>
      </Card>

      {/* Account Information */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <CardBody>

          <h5 className="fw-semibold mb-4">
            Account Information
          </h5>

          <Row>

            <Col md={6}>
              <div className="d-flex align-items-center p-3 border rounded-3 mb-3">

                <div className="avatar-sm bg-light rounded-3 d-flex align-items-center justify-content-center">
                  <i className="bx bx-id-card fs-3 text-caramel"></i>
                </div>

                <div className="ms-3">
                  <small className="text-muted">
                    Customer Code
                  </small>

                  <h6 className="mb-0">
                    {cusCode}
                  </h6>
                </div>

              </div>
            </Col>

            <Col md={6}>
              <div className="d-flex align-items-center p-3 border rounded-3 mb-3">

                <div className="avatar-sm bg-light rounded-3 d-flex align-items-center justify-content-center">
                  <i className="bx bx-envelope fs-3 text-caramel"></i>
                </div>

                <div className="ms-3">
                  <small className="text-muted">
                    Email
                  </small>

                  <h6 className="mb-0">
                    {email}
                  </h6>
                </div>

              </div>
            </Col>

            <Col md={6}>
              <div className="d-flex align-items-center p-3 border rounded-3">

                <div className="avatar-sm bg-light rounded-3 d-flex align-items-center justify-content-center">
                  <i className="bx bx-user fs-3 text-caramel"></i>
                </div>

                <div className="ms-3">
                  <small className="text-muted">
                    Full Name
                  </small>

                  <h6 className="mb-0">
                    {fullName}
                  </h6>
                </div>

              </div>
            </Col>

            <Col md={6}>
              <div className="d-flex align-items-center p-3 border rounded-3">

                <div className="avatar-sm bg-light rounded-3 d-flex align-items-center justify-content-center">
                  <i className="bx bx-phone fs-3 text-caramel"></i>
                </div>

                <div className="ms-3">
                  <small className="text-muted">
                    Phone Number
                  </small>

                  <h6 className="mb-0">
                    {phone}
                  </h6>
                </div>

              </div>
            </Col>

          </Row>

        </CardBody>
      </Card>

      <Card className="border-0 shadow-sm rounded-4">

        <CardBody>

          <h5 className="fw-semibold mb-4">
            Security
          </h5>

          <div className="d-flex justify-content-between align-items-center border rounded-3 p-3">

            <div className="d-flex align-items-center">

              <div className="avatar-sm bg-light rounded-3 d-flex align-items-center justify-content-center">
                <i className="bx bx-lock fs-3 text-caramel"></i>
              </div>

              <div className="ms-3">

                <small className="text-muted">
                  Password
                </small>

                <h6 className="mb-0">
                  ••••••••••••
                </h6>

              </div>

            </div>

            <Link
              to="/forgot-password"
              className="fw-semibold text-caramel text-decoration-none"
            >
              Change Password
              <i className="bx bx-chevron-right ms-1"></i>
            </Link>

          </div>

        </CardBody>

      </Card>

    </Container>
  </div>
</React.Fragment>
  );
};

export default UserProfile;
