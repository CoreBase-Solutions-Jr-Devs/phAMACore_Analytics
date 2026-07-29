import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';

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

    const [isProfileDropdown, setIsProfileDropdown] = useState(false);
    const toggleProfileDropdown = () => {
        setIsProfileDropdown(!isProfileDropdown);
    };
    return (
        <React.Fragment>
            <Dropdown isOpen={isProfileDropdown} toggle={toggleProfileDropdown} className="ms-sm-3 header-item ">
                <DropdownToggle tag="button" type="button" className="btn btn-light shadow-sm">
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
    <Link to="/logout" className="dropdown-item">
      <i
        className="mdi mdi-logout text-caramel fs-16 align-middle me-1"
       
      ></i>
      <span className="align-middle p-2">Logout</span>
    
    </Link>
  </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </React.Fragment>
    );
};

export default ProfileDropdown;