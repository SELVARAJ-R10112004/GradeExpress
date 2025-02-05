import 'bootstrap/dist/css/bootstrap.min.css';
import Home from "./Components/Common_pages/Home";
import {Routes,Route} from "react-router-dom"
import StudentHomePage from './Components/Student/StudentHomePage';
import AboutUs from './Components/Common_pages/AboutUs';
import Contact from './Components/Common_pages/Contact';
import Features from './Components/Common_pages/Features';
import axios from 'axios';
import * as XLSX from "xlsx";
import Login from './Components/Common_pages/Login';
import Header from './Components/Common_pages/Header';
function App() {
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
      };
  
      if (Object.values(requiredIndexes).includes(-1)) {
        console.error("Missing required columns");
        return;
      }
  
      const extractedData = sheetData.slice(1).map((row) => ({
        RegNo: row[requiredIndexes.RegNo],
        Name: row[requiredIndexes.Name],
        Password:"123",
        Role:"Student",
        Email: row[requiredIndexes.Email],
        Department: row[requiredIndexes.Department],
      }));
  
      console.log("Extracted Data:", extractedData);
      
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
  
   return (
    <div className="App">
     <Routes>
        <Route path="/" element={<Home get={get}/>}></Route>
        <Route path='/aboutUs' element={<AboutUs/>}></Route>
        <Route path='/contact' element={<Contact/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/features' element={<Features/>}></Route>
        <Route path='/header' element={<Header/>}></Route>
        <Route path='/studentHomePage' element={<StudentHomePage/>}></Route>
     </Routes>
    </div>
  );
}

export default App;
