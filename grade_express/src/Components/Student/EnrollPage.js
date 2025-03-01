import React, { useState, useEffect, use } from 'react';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';
import "./EnrollPage.css";
import { Toaster, toast } from "react-hot-toast";
const Enroll = ({ user }) => {
  console.log(user);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const[activeSection,setActiveSection]=useState("payment");
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [newEnrollment, setNewEnrollment] = useState({
    register_number: user.regno,
    course_code: '',
    course_name: '',
    enroll_proof: '',
  });

  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [editData, setEditData] = useState({
    payment_proof: '',
    exam_venue: '',
    exam_date: '',
    exam_time:'',
    certificate:'',
    consolidated_score:0,
    assessment_score:0,
    proctored_score:0,
    certificate_link: '',
  });

  // Fetch available courses
  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/getCoursesToEnroll');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Fetch enrolled courses
  const fetchEnrollments = async () => {
    console.log(user.regno);
    try {
      const response = await axios.post('http://localhost:5000/fetchEnrollments', { register_number: user.regno });
      setEnrollments(response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, []);

  // Handle selection of a course
  const handleCourseSelect = (e) => {
    const selected = courses.find(course => course.code === e.target.value);
    setSelectedCourse(e.target.value);
    setNewEnrollment({
      register_number: user.regno,
      course_code: selected?.code || '',
      course_name: selected?.name || '',
      enroll_proof: '',
    });
  };

  // Handle enrollment submission (Step 1)
  const handleConfirmEnrollment = async () => {
    try {
      await axios.post('http://localhost:5000/enrollments', newEnrollment);
      console.log(newEnrollment);
      toast.success("Enrolled successfully!", {
        position: "top-center",
        duration: 5000,
      });
      
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error("Alreadt Enrolled!", {
        position: "top-center",
        duration: 5000,
      });
    }
    fetchEnrollments();
      setShowEnrollModal(false);
      setSelectedCourse('');
      setNewEnrollment({
        register_number: user.regno,
        course_code: '',
        course_name: '',
        enroll_proof: '',
      });
  };

  // Open modal for adding additional details
  const handleAddDetails = (enrollment) => {
    setEditingEnrollment(enrollment);
    setEditData({
      payment_proof: '',
      exam_venue: '',
      exam_date: '',
      exam_time:'',
      certificate:'',
      consolidated_score:0,
      assessment_score:0,
      proctored_score:0,
      certificate_link: '',
    });
    setShowDetailsModal(true);
  };

  // Handle change in additional details form
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // Save additional details to the server
  const handleSaveDetails = async () => {
     console.log(editData);
    try {
      await axios.put( `http://localhost:5000/updateEnrollment`, {
        ...editData,
        section:activeSection,
        register_number: user?.regno,
        course_code: editingEnrollment.code,
      });
      fetchEnrollments();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error updating details:', error);
    }
  };
  async function deleteEnrollment(code){
    console.log(code,user.regno);
    try {
      await axios.post('http://localhost:5000/deleteEnrollment', {regno:user.regno,code});
      fetchEnrollments();
    } catch (error) {
      console.error('Error deleting details:', error);
    }
  }

  const handleFileEditChange = (file) => {
    if (file) {
      console.log(22);
      const formData = new FormData();
      formData.append("certificate", file);
      setEditData({...editData,certificate:formData});
  
      // Store formData or send it to backend
      console.log("File selected:", file);
    }
    else  console.log("no")
  };
  
  return (
    <div className="student-outer-container">
         <nav className="navbar navbar-expand-lg shadow py-3">
            <div className="container">
            <h1 style={{ color: "##F7DBA7", fontSize: "23px" }}>WELCOME {user.name}!</h1>
            <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                <ul className="navbar-nav gap-4">
                <Link to={`/${user.role}HomePage`} className="text-decoration-none"><li className="nav-item">Home</li></Link>
                <Link to="/enroll" className="text-decoration-none"><li className="nav-item">Enroll</li></Link>
                <Link to="/contact" className="text-decoration-none"><li className="nav-item">Result</li></Link>
                <Link to="/" className="text-decoration-none"><li className="nav-item">Logout</li></Link>
                </ul>
            </div>
            </div>
        </nav>
      <h1 className="enrollPage-header">Course Enrollment</h1>
      
      <div className="enrollPage-tableContainer">
        <Button variant="primary" onClick={() => setShowEnrollModal(true)}>
          Enroll in a Course
        </Button>
        <Table bordered  hover>
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Credit Type</th>
              <th>Enroll Proof</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment, index) => (
              <tr key={index}>
                <td>{enrollment.code}</td>
                <td>{enrollment.name}</td>
                <td>{enrollment.iscredit ?"Yes":"No"}</td>
                <td>{enrollment.enroll_proof}</td>
                <td>
                  <Button variant="info" onClick={() => handleAddDetails(enrollment)}>
                    Add Details
                  </Button>
                  <Button variant="danger" onClick={() =>deleteEnrollment(enrollment.code)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Modal for Step 1: Selecting Course & Enroll Proof */}
      <Modal show={showEnrollModal}   className='enroll-modal ' onHide={() => setShowEnrollModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enroll in a Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Select Course</Form.Label>
              <Form.Control as="select" value={selectedCourse} onChange={handleCourseSelect}>
                <option value="">-- Select a Course --</option>
                {courses.map((course) => (
                  <option key={course.code} value={course.code}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Enrollment Proof</Form.Label>
              <Form.Control type="text" name="enroll_proof" value={newEnrollment.enroll_proof} onChange={(e) => setNewEnrollment({ ...newEnrollment, enroll_proof: e.target.value })} required />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEnrollModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmEnrollment}>
            Confirm Enrollment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Step 2: Adding Additional Details */}
      <Modal show={showDetailsModal} className='enroll-modal'  onHide={() => setShowDetailsModal(false)}>
      <Modal.Header closeButton >
        <div className="form-header">
          <Button  onClick={() => setActiveSection("payment")}>Payment Proof</Button>
          <Button onClick={() => setActiveSection("hallticket")}>Exam Details</Button>
          <Button onClick={() => setActiveSection("certificate")}>Certificate Proof</Button>
        </div>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* Payment Proof Section */}
          {activeSection === "payment" && (
            <Form.Group>
              <Form.Label>Payment Proof</Form.Label>
              <Form.Control type="text" name="payment_proof" value={editData.payment_proof} onChange={handleEditChange} />
            </Form.Group>
          )}

          {/* Hallticket Proof Section */}
          {activeSection === "hallticket" && (
              <>
                <Form.Group>
                  <Form.Label>Exam Venue</Form.Label>
                  <Form.Control type="text" name="exam_venue" value={editData.exam_venue} onChange={handleEditChange} />
                </Form.Group>

                <Form.Group> {/* Missing closing tag fixed */}
                  <Form.Label>Exam Date</Form.Label>
                  <Form.Control type="date" name="exam_date" value={editData.exam_date} onChange={handleEditChange} />
                </Form.Group> 
                <Form.Group>
                  <Form.Label>Exam Time</Form.Label>
                  <Form.Control type="text" name="exam_time" value={editData.exam_time} onChange={handleEditChange} />
                </Form.Group>

                
              </>
            )}


          {/* Certificate Proof Section */}
          {activeSection === "certificate" && (
            <>
              <Form.Group>
                <Form.Label>Certificate Link</Form.Label>
                <Form.Control type="text" name="certificate_link" value={editData.certificate_link} onChange={handleEditChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Upload Certificate</Form.Label>
                <Form.Control type="file" name="certificate"  onChange={(e) => handleFileEditChange(e.target.files[0])} />
              </Form.Group>
              
              <Form.Group>
                <Form.Label>Consolidated Score</Form.Label>
                <Form.Control type="text" name="consolidated_score" value={editData.consolidated_score} onChange={handleEditChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Proctored Score</Form.Label>
                <Form.Control type="text" name="proctored_score" value={editData.proctored_score} onChange={handleEditChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Online Assessment Score</Form.Label>
                <Form.Control type="text" name="assessment_score" value={editData.assessment_score} onChange={handleEditChange} />
              </Form.Group>
              
            </>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveDetails}>
          Save Details
        </Button>
      </Modal.Footer>

      </Modal>
    </div>
  );
};

export default Enroll;
