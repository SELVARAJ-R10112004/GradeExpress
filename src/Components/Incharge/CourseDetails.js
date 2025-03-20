import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Container, Button, Table, Nav, Tab, Card, Spinner, Alert } from "react-bootstrap";
import { BsGraphUp, BsPeople, BsJournalBookmark } from "react-icons/bs";

import BellCurveChart from "./BellCurveChart";
import axios from "axios";
import "./CourseDetails.css"; // Custom Styles
import { Toaster, toast } from "react-hot-toast";
import { Link } from "react-router-dom";


const CourseDetails = ({logout}) => {
  const { courseCode } = useParams();
  const location = useLocation();
  const { user, courseInfo } = location.state;


  const isStaff = user?.regno.includes("@"); // ✅ STAFF CHECK


  const [students, setStudents] = useState([]);
  const [chartOptions, setChartOptions] = useState({});
  const [chartSeries, setChartSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingApplied, setGradingApplied] = useState(false);


  const loggedInStudent = students.find((s) => s.student_regno === user.regno);


  useEffect(() => {
    fetchCourseStudents();
  }, []);


  const fetchCourseStudents = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/courses/${courseCode}/students`);
      setStudents(response.data);
      setLoading(false);


      if (response.data.some((s) => s.grade)) {
        setGradingApplied(true);
        prepareChartData(response.data);
      }
    } catch (error) {
      console.error("Error fetching students", error);
      setLoading(false);
    }
  };


  const prepareChartData = (students) => {
    const marks = students.map((s) => parseFloat(s.score)).sort((a, b) => a - b);
    if (marks.length === 0) return;


    const bins = Array(10).fill(0);
    const minMark = Math.min(...marks);
    const maxMark = Math.max(...marks);
    const range = (maxMark - minMark) / 10;


    marks.forEach((mark) => {
      const index = Math.min(9, Math.floor((mark - minMark) / range));
      bins[index]++;
    });


    setChartOptions({
      chart: { type: "line", toolbar: { show: false } },
      title: { text: "Grade Distribution (Bell Curve)", align: "center", style: { fontSize: "16px" } },
      xaxis: { categories: bins.map((_, i) => (minMark + i * range).toFixed(2)), title: { text: "Marks" } },
      yaxis: { title: { text: "Frequency" } },
      stroke: { curve: "smooth" },
    });


    setChartSeries([{ name: "Students", data: bins }]);
  };


  const handleGrading = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/courses/${courseCode}/grade`);
      toast.success("Graded Successfully!", {
                position: "top-center",
                duration: 5000,
              });
      fetchCourseStudents();
    } catch (error) {
      toast.error("Grading Unsuccessful!", {
                position: "top-center",
                duration: 5000,
              });
    }
  };


  return (
    <>


    <nav className="navbar navbar-expand-lg shadow py-3">
        <div className="container">
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarNav"
          >
            <ul className="navbar-nav gap-4">
              <Link to={`/${user.role}HomePage`}className="text-decoration-none">
                <li className="nav-item">Home</li>
              </Link>
              {user.designation != "Incharge" && (
                <>
                  <Link to="/addCourse" className="text-decoration-none">
                    <li className="nav-item">Add Course</li>
                  </Link>
                  <Link to="/" className="text-decoration-none">
                    <li className="nav-item">Assignment Upload</li>
                  </Link>
                </>
              )}
              <Link to="/courses" state={{ user }} className="text-decoration-none">
                <li className="nav-item">Courses</li>
              </Link>








              {user.designation != "Tutor" && (
                <>
                  <Link to={`/verifyCertificate/${user?.regno}`}className="text-decoration-none">
                    <li className="nav-item">Verify</li>
                  </Link>
                </>
              )}
              <Link to="/"  onClick={()=>logout()} className="text-decoration-none">
                <li className="nav-item">Logout</li>
              </Link>
            </ul>
          </div>
        </div>
      </nav>
    <Container className="course-container mt-4">
     
      {/* 🔹 COURSE HEADER */}
      {courseInfo && (
        <Card className="course-header-card shadow-lg p-4">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="course-title text-primary">
                {courseInfo.name} ({courseInfo.id})
              </h2>
              <p>
                <strong>Duration:</strong> {courseInfo.weeks} weeks | <strong>Credits:</strong> {courseInfo.credits}
              </p>
              {isStaff && (
                <Button variant="success" onClick={handleGrading} className="proceed-button">
                  Proceed Grade
                </Button>
              )}
            </div>


            {isStaff && (
              <div className="text-end">
                <h5 className="text-info">{user.name}</h5>
                <p>
                  <strong>Dept:</strong> {user.dept} <br />
                  <strong>Staff Code:</strong> {user.regno}
                </p>
              </div>
            )}
          </Card.Body>
        </Card>
      )}


      {/* 🔹 NAVIGATION TABS */}
      <Tab.Container defaultActiveKey="instructions">
        <Nav variant="tabs" className="nav-tabs bg-light p-2 rounded">
          <Nav.Item>
            <Nav.Link eventKey="instructions">
              <BsJournalBookmark className="me-2" /> Instructions
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="participants">
              <BsPeople className="me-2" /> Participants
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="gradeCurve">
              <BsGraphUp className="me-2" /> Grade Curve
            </Nav.Link>
          </Nav.Item>
        </Nav>


        <Tab.Content className="mt-3">
          {/* 📖 INSTRUCTIONS SECTION */}
          <Tab.Pane eventKey="instructions">
          <Card className="info-card shadow-sm">
            <Card.Body>
              <h4 className="text-primary">📚 Grading Instructions</h4>


             




              {/* 🟢 Absolute Grading (If students < 25) */}
              {students.length < 25 && (
                <>
                  <h5 className="text-dark">📌 Absolute Grading (Strength &lt; 25)</h5>
                  <p>Grades are assigned based on the highest secured marks (X) and class interval (k).</p>


                  <Table striped bordered hover responsive className="grade-table">
                    <thead>
                      <tr><th>Grade</th><th>Marks Range</th><th>Grade Point</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>O</td><td>M &gt; (X - k)</td><td>10</td></tr>
                      <tr><td>A+</td><td>(X - k) ≥ M &gt; (X - 2k)</td><td>9</td></tr>
                      <tr><td>A</td><td>(X - 2k) ≥ M &gt; (X - 3k)</td><td>8</td></tr>
                      <tr><td>B+</td><td>(X - 3k) ≥ M &gt; (X - 4k)</td><td>7</td></tr>
                      <tr><td>B</td><td>(X - 4k) ≥ M ≥ (X - 5k)</td><td>6</td></tr>
                      <tr><td>RA</td><td>M &lt; 50</td><td>0</td></tr>
                    </tbody>
                  </Table>


                  <Alert variant="warning">
                    <strong>Class Interval Calculation (k):</strong><br />
                    k = (X - 50) / 5 (If k &lt; 7, take k = 7)
                  </Alert>
                </>
              )}


              {/* 🔵 Relative Grading (If students ≥ 25) */}
              {students.length >= 25 && (
                <>
                  <h5 className="text-dark">📌 Relative Grading (Strength ≥ 25)</h5>
                  <p>Grades are assigned using the mean (μ) and standard deviation (σ).</p>


                  <Table striped bordered hover responsive className="grade-table">
                    <thead>
                      <tr><th>Grade</th><th>Marks Range</th><th>Grade Point</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>O</td><td>M ≥ (μ + 1.65σ)</td><td>10</td></tr>
                      <tr><td>A+</td><td>(μ + 1.65σ) &gt; M ≥ (μ + 0.85σ)</td><td>9</td></tr>
                      <tr><td>A</td><td>(μ + 0.85σ) &gt; M ≥ μ</td><td>8</td></tr>
                      <tr><td>B+</td><td>μ &gt; M ≥ (μ - 0.9σ)</td><td>7</td></tr>
                      <tr><td>B</td><td>(μ - 0.9σ) &gt; M ≥ (μ - 1.8σ)</td><td>6</td></tr>
                      <tr><td>RA</td><td>M &lt; (μ - 1.8σ) OR M &lt; 50</td><td>0</td></tr>
                    </tbody>
                  </Table>


                  <Alert variant="info">
                    <strong>Mean (μ) Calculation:</strong><br />
                    μ = (ΣM) / n (Average of total marks)<br /><br />
                    <strong>Standard Deviation (σ) Calculation:</strong><br />
                    σ = sqrt( (Σ(M - μ)²) / n ) (Spread of marks)
                  </Alert>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab.Pane>


          {/* 👥 PARTICIPANTS SECTION */}
          <Tab.Pane eventKey="participants">
            {loading ? (
              <Spinner animation="border" variant="primary" />
            ) : (
              <Table striped bordered hover responsive className="student-table shadow-sm">
                <thead>
                  <tr className="bg-dark text-white">
                    <th>Reg No</th>
                    <th>Name</th>
                    <th>Marks</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {loggedInStudent && (
                    <tr className="table-success">
                      <td><strong>{loggedInStudent.student_regno}</strong></td>
                      <td><strong>{loggedInStudent.name} (You)</strong></td>
                      <td><strong>{loggedInStudent.score}</strong></td>
                      <td><strong>{loggedInStudent.grade || "N/A"}</strong></td>
                    </tr>
                  )}
                  {students.map((s) => (
                    <tr key={s.student_regno}>
                      <td>{s.student_regno}</td>
                      <td>{s.name}</td>
                      <td>{s.score}</td>
                      <td>{s.grade || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab.Pane>
          <Tab.Pane eventKey="gradeCurve">
            <Card className="shadow-sm p-3">
              <h4 className="text-primary">📈 Grade Distribution Curve</h4>
             
              <p>
                {students.length < 25
                  ? "This chart represents the distribution of grades based on Absolute Grading."
                  : "This chart represents the distribution of grades based on Relative Grading."
                }
              </p>


              {/* Send actual students data to BellCurveChart */}
              <BellCurveChart students={students} />
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
    </>
  );
};


export default CourseDetails;




