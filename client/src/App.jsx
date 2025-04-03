import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Report from "./Report";
import StudentReport from "./StudentReport";
import StudentReportDetails from "./StudentReportDetails";
import DepartmentReport from "./DepartmenReport";
import ViewData from "./ViewData";
import ViewDataReport from "./ViewDataReport";
import ImportIndividual from './ImportIndividual';
import ImportBatch from './ImportBatch';
import EditStudents from './EditStudents';
import DeleteIndividual from './DeleteIndividual';
import DeleteBatch from "./DeleteBatch";
import ScannerPage from "./ScannerPage";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="*" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/reports" element={<Report />} />
      <Route path="/reports/student" element={<StudentReport />} />
      <Route path="/reports/student/details" element={<StudentReportDetails />} />
      <Route path="/reports/department" element={<DepartmentReport />} />
      <Route path="/reports/department/details" element={<DepartmentReport />} />      
      <Route path="/view-data" element={<ViewData />} />
      <Route path="/view-data/results" element={<ViewDataReport />} />
      <Route path="/data-tools/import/individual" element={<ImportIndividual />} />
      <Route path="/data-tools/import/batch" element={<ImportBatch />} />
      <Route path="/data-tools/edit" element={<EditStudents />} />
      <Route path="/data-tools/delete/individual" element={<DeleteIndividual />} />
      <Route path="/data-tools/delete/batch" element={<DeleteBatch />} />
      <Route path="/scanner" element={<ScannerPage />} />
    
    </Routes>
  );
}

export default App;
