import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';
import LogoutModal from './LogoutModal';

import avatar1 from "../../assets/images/users/avatar-1.jpg";

const ProfileDropdown = () => {


 const profiledropdownData = createSelector(
    (state) => state.Profile,
    (state) => ({
        user: state?.user || null
    })
);

const { user } = useSelector((state) => state.Profile || {});

    const [fullName, setFullName] = useState("Admin");

useEffect(() => {
    const storedUser = localStorage.getItem("authUser");

    let parsedUser = null;
    try {
        parsedUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
        parsedUser = null;
    }

    const name =
        parsedUser?.fullName ||
        parsedUser?.email ||
        "Admin";

    setFullName(name);
}, [user]);

    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isProfileDropdown, setIsProfileDropdown] = useState(false);
    const toggleProfileDropdown = () => {
        setIsProfileDropdown(!isProfileDropdown);
    };

    const handleLogoutClick = (e) => {
        e.preventDefault();
        setIsProfileDropdown(false);
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = () => {
        setShowLogoutModal(false);
        navigate("/logout");
    };

    const handleLogoutClose = () => {
        setShowLogoutModal(false);
    };

    return (
        <React.Fragment>
            <Dropdown isOpen={isProfileDropdown} toggle={toggleProfileDropdown} className="ms-sm-3 header-item ">
                <DropdownToggle tag="button" type="button" className="btn btn-body shadow-sm">
                    <span className="d-flex align-items-center">
                        <img className="rounded-circle header-profile-user" src={avatar1}
                            alt="Header Avatar" />
                        <span className="text-start ms-xl-2">
                            <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">{fullName}</span>
                        </span>
                    </span>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end p-2">
                    <DropdownItem className="p-0">
                        <Link to="/profile" className="dropdown-item">
                            <i
                                className="mdi mdi-account-circle text-caramel fs-16 align-middle me-1"

                            ></i>
                            <span className="align-middle p-2">Profile</span>

                        </Link>
                    </DropdownItem>

                    <div className="dropdown-divider"></div>

                    <DropdownItem className="p-0">
                        <button
                            type="button"
                            className="dropdown-item border-0 bg-transparent"
                            onClick={handleLogoutClick}
                        >
                            <i className="mdi mdi-logout text-caramel fs-16 align-middle me-1"></i>
                            <span className="align-middle p-2">Logout</span>
                        </button>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <LogoutModal
                show={showLogoutModal}
                onConfirm={handleLogoutConfirm}
                onClose={handleLogoutClose}
            />
        </React.Fragment>
    );
};

export default ProfileDropdown;