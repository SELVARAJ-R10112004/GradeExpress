import 'bootstrap/dist/css/bootstrap.min.css';
import Home from "./Components/Common_pages/Home";
import {Routes,Route, useNavigate} from "react-router-dom"
import { useState,useEffect } from 'react';
import StudentHomePage from './Components/Student/StudentHomePage';
import AboutUs from './Components/Common_pages/AboutUs';
import Contact from './Components/Common_pages/Contact';
import Features from './Components/Common_pages/Features';
import axios from 'axios';
import * as XLSX from "xlsx";
import Login from './Components/Common_pages/Login';
import Header from './Components/Common_pages/Header';
import { Toaster, toast } from "react-hot-toast";
import InchargeHomePage from './Components/Incharge/InchargeHomePage';
import AddCourse from './Components/Incharge/AddCourse';
import AdminPage from './Components/Admin/AdminPage';
import Enroll from './Components/Student/EnrollPage';
import { Navigate } from 'react-router-dom';
function App() {
   const [user,setUser]=useState({});
   const navigae=useNavigate();
  async function get() {
    const fileInput = document.querySelector("#file");
    const file = fileInput.files[0];
  
    if (!file) {
      alert("Please select a spreadsheet file!");
      return;
    }
  
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
  
      const sheetName = workbook.SheetNames[0]; // First sheet
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
  
      if (sheetData.length === 0) return;
  
      const headers = sheetData[0]; // First row as headers
      const requiredIndexes = {
        RegNo: headers.indexOf("RegNo"),
        Name: headers.indexOf("Name"),
        Email: headers.indexOf("Email"),
        Department: headers.indexOf("Department"),
        Tutor_name:headers.indexOf("Tutor_name"),
        Phone_no:headers.indexOf("Phone_number")
      };
  
      if (Object.values(requiredIndexes).includes(-1)) {
        console.error("Missing required columns");
        return;
      }
  
      const extractedData = sheetData.slice(1).map((row) => ({
        RegNo: row[requiredIndexes.RegNo],
        Name: row[requiredIndexes.Name],
        Password:"123",
        Email: row[requiredIndexes.Email],
        Department: row[requiredIndexes.Department],
        Tutor_name:row[requiredIndexes.Tutor_name],
        Phone_no:row[requiredIndexes.Phone_no],
        year_of_joining:2022
      }));
  
      console.log("Extracted Data:", extractedData);
      return;
      // Send data to backend using Axios
      try {
        const response = await axios.post("http://localhost:5000/upload", extractedData, {
          headers: { "Content-Type": "application/json" },
        });
  
        console.log(response.data.message);
      } catch (error) {
        console.error("Error uploading data:", error);
      }
    };
  
    reader.readAsBinaryString(file);
  }

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      console.log(token);
      if (token) {
        
        try {
          const response = await axios.post("http://localhost:5000/checkToken", { token });
          setUser(response.data.user);
          console.log(response.data.user.role);
            navigae(`/${response.data.user.role}HomePage`);
        } catch (error) {
          console.error("Error verifying token:", error);
        }
      }
    };

    checkToken();
  }, []);

  
  function logout() {
    localStorage.removeItem("token");
    navigae("/");
}

  
   return (
    <div className="App">
     <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path='/aboutUs' element={<AboutUs/>}></Route>
        <Route path='/contact' element={<Contact/>}></Route>
        <Route path='/login' element={<Login user={user} setUser={setUser}/>}></Route>
        <Route path='/features' element={<Features/>}></Route>
        <Route path='/header' element={<Header/>}></Route>
        <Route path='/StudentHomePage' element={<StudentHomePage user={user} setUser={setUser} logout={logout}/>}></Route>
        <Route path='/StaffHomePage' element={<InchargeHomePage user={user} setUser={setUser} logout={logout}/>}></Route>
        <Route path='/addCourse' element={<AddCourse user={user} setUser={setUser} logout={logout}/>}></Route>
        <Route path='/AdminHomePage' element={<AdminPage get={get} logout={logout}/>}></Route>
        <Route path='/enroll' element={<Enroll user={user} setUser={setUser}/>}></Route>
     </Routes>
     <Toaster/>
    </div>
  );
}

export default App;
