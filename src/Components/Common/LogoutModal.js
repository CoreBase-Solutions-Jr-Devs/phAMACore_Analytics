import PropTypes from "prop-types";
import React from "react";
import { Modal, ModalBody } from "reactstrap";

const LogoutModal = ({ show, onConfirm, onClose }) => {
    return (
        <Modal isOpen={show} toggle={onClose} centered fade>
            <ModalBody className="py-3 px-5">
                <div className="mt-2 text-center">
                    <lord-icon
                        src="https://cdn.lordicon.com/nocovwne.json"
                        trigger="loop"
                        colors="primary:#0ab39c,secondary:#f06548"
                        style={{ width: "100px", height: "100px" }}
                    ></lord-icon>

                    <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
                        <h4>Confirm Logout</h4>

                        <p className="text-muted mx-4 mb-0">
                            Are you sure you want to log out of your account?
                        </p>
                    </div>
                </div>

                <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                    <button
                        type="button"
                        className="btn btn-success w-sm"
                        onClick={onConfirm}
                    >
                        Yes, Logout
                    </button>

                    <button
                        type="button"
                        className="btn btn-caramel w-sm"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </ModalBody>
        </Modal>
    );
};

LogoutModal.propTypes = {
    show: PropTypes.bool,
    onConfirm: PropTypes.func,
    onClose: PropTypes.func,
};

export default LogoutModal;