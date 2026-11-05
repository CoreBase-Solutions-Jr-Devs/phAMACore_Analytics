import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

//redux
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../slices/auth/login/thunk";

import withRouter from "../../Components/Common/withRouter";
import { createSelector } from "reselect";
import { Spinner } from "reactstrap";

const Logout = (props) => {
  const dispatch = useDispatch();
  const [timedOut, setTimedOut] = useState(false);
  const [hasDispatched, setHasDispatched] = useState(false);

const selectLogin = createSelector(
  (state) => state.Login,
  (login) => ({
    isUserLogout: login.isUserLogout,
    loading: login.loading,
  })
);

const { isUserLogout, loading } = useSelector(selectLogin);

  useEffect(() => {
    dispatch(logoutUser());

    setHasDispatched(true);
    const timer = setTimeout(() => {
      localStorage.removeItem("authUser");
      setTimedOut(true);
    }, 2500); // 2.5s timeout

    return () => clearTimeout(timer);
  }, [dispatch]);

  if ((isUserLogout && !loading && hasDispatched) || timedOut) {
    return <Navigate to="/login" replace />;
  }

  return <></>;
};

Logout.propTypes = {
  history: PropTypes.object,
};


export default withRouter(Logout);