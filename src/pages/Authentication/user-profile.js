import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import defaultUser from "../../assets/images/users/user-dummy-img.jpg";

const UserProfile = () => {
  const [userData, setUserData] = useState({
    username: "Admin",
    fullName: "Admin",
    cusCode: "-",
    companyName: "-",
    email: "-",
    phone: "-",
    operatingHours: "08:00:00 - 17:00:00",
    passwordExDate: "-",
    usergrouplist: "-",
    packageName: "Standard",
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("authUser");
      if (!stored) return;

      const parsed = JSON.parse(stored);
      const user = parsed?.user || parsed || {};

      setUserData({
        username: user?.username || "Admin",
        fullName: user?.fullusername || user?.fullName || user?.username || "Admin",
        cusCode: user?.cusId || parsed?.cusCode || user?.cusCode || "-",
        companyName: user?.companyName || "-",
        email: user?.email || "Not Provided",
        phone: user?.cellnumber || user?.phone || "-",
        operatingHours: `${user?.timeIn || "08:00:00"} - ${user?.timeOut || "17:00:00"}`,
        passwordExDate: user?.passwordExDate || "-",
        usergrouplist: user?.usergrouplist || "-",
        packageName: user?.packageName?.trim() || "Standard",
      });
    } catch (err) {
      console.error("Failed to parse authUser from localStorage:", err);
    }
  }, []);

  document.title = "Profile | phAMACore Cloud";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center p-2 mb-2">
            <div>
              <h2 className="fw-bold mb-1">My Profile</h2>
              <p className="text-muted mb-0">View your account information</p>
            </div>
          </div>

          {/* User Header Summary Card */}
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <CardBody className="p-4">
              <div className="d-flex align-items-center">
                <img
                  src={defaultUser}
                  alt="User Avatar"
                  className="rounded-circle border border-3"
                  width={90}
                  height={90}
                />

                <div className="ms-4">
                  <h3 className="mb-1 fw-semibold">{userData.fullName}</h3>
                  <p className="text-muted mb-2">
                    {userData.companyName} &bull; {userData.packageName}
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
              <h5 className="fw-semibold mb-4">Account Information</h5>

              <Row>
                {/* Customer Code */}
                <Col md={6}>
                  <div className="d-flex align-items-center p-3 border rounded-3 mb-3">
                    <div className="avatar-sm bg-light rounded-3 d-flex align-items-center justify-content-center">
                      <i className="bx bx-id-card fs-3 text-caramel"></i>
                    </div>
                    <div className="ms-3">
                      <small className="text-muted">Customer Code</small>
                      <h6 className="mb-0 user-select-all">{userData.cusCode}</h6>
                    </div>
                  </div>
                </Col>

                {/* Company Name */}
                <Col md={6}>
                  <div className="d-flex align-items-center p-3 border rounded-3 mb-3">
                    <div className="avatar-sm bg-light rounded-3 d-flex align-items-center justify-content-center">
                      <i className="bx bx-buildings fs-3 text-caramel"></i>
                    </div>
                    <div className="ms-3">
                      <small className="text-muted">Company Name</small>
                      <h6 className="mb-0 user-select-all">{userData.companyName}</h6>
                    </div>
                  </div>
                </Col>

                {/* Username */}
                <Col md={6}>
                  <div className="d-flex align-items-center p-3 border rounded-3 mb-3">
                    <div className="avatar-sm bg-light rounded-3 d-flex align-items-center justify-content-center">
                      <i className="bx bx-user-pin fs-3 text-caramel"></i>
                    </div>
                    <div className="ms-3">
                      <small className="text-muted">Username</small>
                      <h6 className="mb-0 user-select-all">{userData.username}</h6>
                    </div>
                  </div>
                </Col>

                {/* Full Name */}
                <Col md={6}>
                  <div className="d-flex align-items-center p-3 border rounded-3 mb-3">
                    <div className="avatar-sm bg-light rounded-3 d-flex align-items-center justify-content-center">
                      <i className="bx bx-user fs-3 text-caramel"></i>
                    </div>
                    <div className="ms-3">
                      <small className="text-muted">Full Name</small>
                      <h6 className="mb-0 user-select-all">{userData.fullName}</h6>
                    </div>
                  </div>
                </Col>

                {/* Email Address */}
                <Col md={6}>
                  <div className="d-flex align-items-center p-3 border rounded-3 mb-3">
                    <div className="avatar-sm bg-light rounded-3 d-flex align-items-center justify-content-center">
                      <i className="bx bx-envelope fs-3 text-caramel"></i>
                    </div>
                    <div className="ms-3">
                      <small className="text-muted">Email</small>
                      <h6 className="mb-0 user-select-all">{userData.email}</h6>
                    </div>
                  </div>
                </Col>

                {/* Phone Number */}
                <Col md={6}>
                  <div className="d-flex align-items-center p-3 border rounded-3 mb-3">
                    <div className="avatar-sm bg-light rounded-3 d-flex align-items-center justify-content-center">
                      <i className="bx bx-phone fs-3 text-caramel"></i>
                    </div>
                    <div className="ms-3">
                      <small className="text-muted">Phone Number</small>
                      <h6 className="mb-0 user-select-all">{userData.phone}</h6>
                    </div>
                  </div>
                </Col>

                {/* Shift Hours */}
                {/* <Col md={6}>
                  <div className="d-flex align-items-center p-3 border rounded-3 mb-3">
                    <div className="avatar-sm bg-light rounded-3 d-flex align-items-center justify-content-center">
                      <i className="bx bx-time fs-3 text-caramel"></i>
                    </div>
                    <div className="ms-3">
                      <small className="text-muted">Operating Hours</small>
                      <h6 className="mb-0 user-select-all">{userData.operatingHours}</h6>
                    </div>
                  </div>
                </Col> */}

                {/* Password Expiry Date */}
                {/* <Col md={6}>
                  <div className="d-flex align-items-center p-3 border rounded-3 mb-3">
                    <div className="avatar-sm bg-light rounded-3 d-flex align-items-center justify-content-center">
                      <i className="bx bx-calendar-event fs-3 text-caramel"></i>
                    </div>
                    <div className="ms-3">
                      <small className="text-muted">Password Expiry</small>
                      <h6 className="mb-0 user-select-all">{userData.passwordExDate}</h6>
                    </div>
                  </div>
                </Col> */}

                {/* Assigned User Groups */}
                {/* <Col md={12}>
                  <div className="d-flex align-items-start p-3 border rounded-3">
                    <div className="avatar-sm bg-light rounded-3 d-flex align-items-center justify-content-center flex-shrink-0">
                      <i className="bx bx-shield-quarter fs-3 text-caramel"></i>
                    </div>
                    <div className="ms-3">
                      <small className="text-muted">Assigned Groups & Roles</small>
                      <h6 className="mb-0 fs-13 text-secondary lh-base user-select-all">
                        {userData.usergrouplist}
                      </h6>
                    </div>
                  </div>
                </Col> */}
              </Row>
            </CardBody>
          </Card>

          {/* Security Card */}
          <Card className="border-0 shadow-sm rounded-4">
            <CardBody>
              <h5 className="fw-semibold mb-4">Security</h5>

              <div className="d-flex justify-content-between align-items-center border rounded-3 p-3">
                <div className="d-flex align-items-center">
                  <div className="avatar-sm bg-light rounded-3 d-flex align-items-center justify-content-center">
                    <i className="bx bx-lock fs-3 text-caramel"></i>
                  </div>
                  <div className="ms-3">
                    <small className="text-muted">Password</small>
                    <h6 className="mb-0 user-select-all">&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</h6>
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