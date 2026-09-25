import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Row } from "reactstrap";

const Pagination = ({ data, currentPage, setCurrentPage, perPageData }) => {
    const totalPages = Math.ceil((data?.length || 0) / perPageData) || 0;

    const handleClick = (e) => {
        setCurrentPage(e);
    };

    const handleprevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handlenextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Build page items: 1, 2, current-1, current, current+1, totalPages-1, totalPages
    const pageItems = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pageItems.push(i);
        }
    } else {
        const pagesSet = new Set();
        // page 1, 2
        pagesSet.add(1);
        pagesSet.add(2);

        // current pg-1, current pg, current pg +1
        if (currentPage - 1 >= 1) pagesSet.add(currentPage - 1);
        if (currentPage >= 1 && currentPage <= totalPages) pagesSet.add(currentPage);
        if (currentPage + 1 <= totalPages) pagesSet.add(currentPage + 1);

        // 2nd last pg, last page
        pagesSet.add(totalPages - 1);
        pagesSet.add(totalPages);

        const sortedPages = Array.from(pagesSet).sort((a, b) => a - b);
        for (let i = 0; i < sortedPages.length; i++) {
            if (i > 0 && sortedPages[i] - sortedPages[i - 1] > 1) {
                pageItems.push("...");
            }
            pageItems.push(sortedPages[i]);
        }
    }

    useEffect(() => {
        if (totalPages && totalPages < currentPage) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage, setCurrentPage]);

    if (totalPages <= 1) {
        return null;
    }

    return (
        <React.Fragment>
            <Row className="g-0 justify-content-end mb-4">
                <div className="col-sm-auto">
                    <ul className="pagination-block pagination pagination-separated justify-content-center justify-content-sm-end mb-sm-0">
                        {currentPage <= 1 ? (
                            <li className="page-item disabled">
                                <Link className="page-link" to="#!">
                                    Previous
                                </Link>
                            </li>
                        ) : (
                            <li className="page-item">
                                <Link
                                    to="#!"
                                    className="page-link"
                                    onClick={handleprevPage}
                                >
                                    Previous
                                </Link>
                            </li>
                        )}

                        {pageItems.map((item, key) => (
                            <React.Fragment key={key}>
                                {item === "..." ? (
                                    <li className="page-item disabled">
                                        <span className="page-link">...</span>
                                    </li>
                                ) : (
                                    <li className="page-item">
                                        <Link
                                            to="#!"
                                            className={
                                                currentPage === item
                                                    ? "page-link active"
                                                    : "page-link"
                                            }
                                            onClick={() => handleClick(item)}
                                        >
                                            {item}
                                        </Link>
                                    </li>
                                )}
                            </React.Fragment>
                        ))}

                        {currentPage >= totalPages ? (
                            <li className="page-item disabled">
                                <Link className="page-link" to="#!">
                                    Next
                                </Link>
                            </li>
                        ) : (
                            <li className="page-item">
                                <Link
                                    to="#!"
                                    className="page-link"
                                    onClick={handlenextPage}
                                >
                                    Next
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </Row>
        </React.Fragment>
    );
};

export default Pagination;