import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";


const Verify = ({ user, logout }) => {
    const { regno } = useParams(); // Get tutor regno from URL
    console.log("Tutor RegNo:", regno);
    const [verificationData, setVerificationData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    useEffect(() => {
        if (regno) {
            axios
                .get(`http://localhost:5000/studentsVerify/${regno}`) // Fetch verification data
                .then((response) => {
                    setVerificationData(response.data);
                    console.log("Verification Data Fetched Successfully!", response.data);
                })
                .catch((error) => {
                    console.error("Error fetching verification data:", error);
                    setError("Failed to fetch verification records.");
                })
                .finally(() => setLoading(false));
        }
    }, [regno]);


    if (loading) return <p>Loading verification records...</p>;
    if (error) return <p>{error}</p>;


    return (
        <div className="outer-container-incharge">
            <nav className="navbar navbar-expand-lg shadow py-3">
                <div className="container">
                    <h1 style={{ color: "#F7DBA7", fontSize: "23px" }}>
                        WELCOME {user?.name?.toUpperCase()}!
                    </h1>
                    <div className="collapse navbar-collapse justify-content-end">
                        <ul className="navbar-nav gap-4">
                            <Link to={`/${user.role}HomePage`} className="text-decoration-none">
                                <li className="nav-item">Home</li>
                            </Link>
                            <Link to="/" onClick={logout} className="text-decoration-none">
                                <li className="nav-item">Logout</li>
                            </Link>
                        </ul>
                    </div>
                </div>
            </nav>




           


            <div className="container mt-5">
    <h2 className="mb-4 text-primary text-center text-uppercase fw-bold">
        Verification List
    </h2>


    {verificationData.length > 0 ? (
        <div className="table-responsive shadow-lg p-3 bg-white rounded"> {/* Adds shadow effect */}
            <table className="table table-hover table-bordered table-striped align-middle">
                <thead className="bg-gradient bg-primary text-white">
                <tr className="text-center" style={{ backgroundColor: "#111111" }}>
                    <th scope="col">Student Reg No</th>
                    <th scope="col">Course Code</th>
                    <th scope="col">Badge</th>
                    <th scope="col">Score</th>
                    <th scope="col">Certificate</th>
                </tr>
                </thead>
                <tbody className="table-light">
                    {verificationData.map((cert, index) => {
                        const details = cert.extracted_details;
                        return (
                            <tr key={index} className="text-center">
                                <td className="fw-semibold">{cert.student_regno}</td>
                                <td>{cert.course_code}</td>
                                <td>
                                    <span className="badge bg-info text-dark p-2">{details.badge_type}</span>
                                </td>
                                <td className="fw-bold text-success">{details.consolidated_score}</td>
                                <td>
                                    <a href={details.certificate_link}
                                       className="btn btn-outline-success btn-sm rounded-pill px-3 shadow-sm"
                                       target="_blank"
                                       rel="noopener noreferrer">
                                        🎓 View Certificate
                                    </a>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    ) : (
        <div className="alert alert-warning text-center fs-5 fw-bold shadow-sm">
            ⚠ No verification records found for your students.
        </div>
    )}
</div>


        </div>
    );
};


export default Verify;
