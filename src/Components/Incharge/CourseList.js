import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link,useLocation } from 'react-router-dom';


const CourseList = ({logout}) => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [departments] = useState(['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS', 'IT', 'SH']);
    const [selectedDept, setSelectedDept] = useState("");
    const location = useLocation();
    const user = location.state?.user || {};
   
    const navigate = useNavigate();


    useEffect(() => {
        fetchCourses();
    }, []);


    const fetchCourses = async () => {
        try {
            const res = await axios.get("http://localhost:5000/courses");
            setCourses(res.data);
            setFilteredCourses(res.data); // Initialize filtered list
        } catch (err) {
            console.error("Error fetching courses", err);
        }
    };


    const handleSearch = (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setFilteredCourses(courses);
        } else {
            setFilteredCourses(
                courses.filter(course =>
                    course.name.toLowerCase().includes(query.toLowerCase()) ||
                    course.code.toLowerCase().includes(query.toLowerCase())
                )
            );
        }
    };


    const handleFilter = async (dept) => {
        setSelectedDept(dept);


        if (!dept) {
            setFilteredCourses(courses); // Reset to all courses
            return;
        }


        try {
            const res = await axios.get(`http://localhost:5000/courses/filter/${dept}`);
            setFilteredCourses(res.data);
        } catch (err) {
            console.error("Error filtering courses", err);
            setFilteredCourses([]);
        }
    };


    return (
        <>


<div>
            <nav className="navbar navbar-expand-lg shadow py-3">
                <div className="container">
                    <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
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
        </div>
        <Container className="my-5">
            <h2 className="text-center text-primary fw-bold mb-4">
                📚 Explore Our Courses
            </h2>


            {/* Search & Filter Row */}
            <Row className="mb-4 justify-content-center">
                <Col md={5}>
                    <InputGroup className="shadow-sm">
                        <InputGroup.Text className="bg-primary text-white">
                            🔍
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Search courses by name or code..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="rounded-end"
                        />
                    </InputGroup>
                </Col>
                <Col md={4}>
                    <Form.Select
                        value={selectedDept}
                        onChange={(e) => handleFilter(e.target.value)}
                        className="shadow-sm"
                    >
                        <option value="">🎓 Filter by Department</option>
                        {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>


            {/* Display Selected Filter */}
            {selectedDept && (
                <p className="text-left fw-bold" style={{ fontSize: "1.2rem", color: "black" }}>
                    📌 Filtered by {selectedDept}
                </p>
            )}




            {/* Course Cards */}
            <Row>
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                        <Col key={course.code} md={4} className="mb-4">
                            <Card
                                className="shadow-lg border-0 course-card"
                                onClick={() =>
                                    navigate(`/course/${course.code}`, {
                                        state: {
                                            user: user,
                                            courseInfo: {
                                                id: course.code,
                                                name: course.name,
                                                weeks: course.no_of_weeks,
                                                credits: course.credits_count,
                                            },
                                        },
                                    })
                                }
                            >
                                <Card.Img
                                    variant="top"
                                    src={require("../../Asserts/nptel_image_course.jpg")}
                                    className="course-img"
                                />
                                <Card.Body className="text-left">
                                    <Card.Title className="fw-bold text-primary course-title">
                                        {course.name}
                                    </Card.Title>
                                    <Card.Text className="course-details">
                                        <span>📘 <strong>Course Code:</strong> {course.code}</span> <br />
                                        <span>📆 <strong>No.of.Weeks:</strong> {course.no_of_weeks}</span> <br />
                                        <span>🎓 <strong>Credits Offered:</strong> {course.credits_count}</span>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col className="text-center">
                        <p className="text-danger fs-5 fw-bold">No courses found!</p>
                    </Col>
                )}
            </Row>


            {/* Custom CSS for Styling */}
            <style>
                {`
                /* Course Card Styling */
                .course-card {
                    transition: transform 0.3s, box-shadow 0.3s;
                    cursor: pointer;
                    border-radius: 15px;
                    overflow: hidden;
                    background: #ffffff;
                    border: 1px solid #e3e3e3;
                }
                .course-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.15);
                }
               
                /* Course Image */
                .course-img {
                    height: 200px;
                    object-fit: cover;
                    border-bottom: 4px solid #007bff;
                }


                /* Course Title */
                .course-title {
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: #0056b3;
                }


                /* Course Details */
                .course-details {
                    background: linear-gradient(135deg, #f5f7fa, #e1e5ea);
                    padding: 10px;
                    border-radius: 8px;
                    margin-top: 10px;
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: #333;
                }


                /* Search Input & Dropdown */
                .form-control {
                    border-radius: 8px;
                    border: 2px solid #007bff;
                    transition: 0.3s;
                }
                .form-control:focus {
                    border-color: #0056b3;
                    box-shadow: 0 0 5px rgba(0, 91, 187, 0.5);
                }


                /* Select Dropdown */
                .form-select {
                    border-radius: 8px;
                    border: 2px solid #007bff;
                    transition: 0.3s;
                }
                .form-select:focus {
                    border-color: #0056b3;
                    box-shadow: 0 0 5px rgba(0, 91, 187, 0.5);
                }
                `}
            </style>
        </Container>
        </>
    );
};


export default CourseList;








