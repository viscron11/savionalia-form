import { HashRouter, Routes, Route } from "react-router-dom";
import RegistrationForm from "./components/RegistrationForm";
import AdminDashboard from "./components/AdminDashboard";
import AdminConfig from "./components/AdminConfig";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<RegistrationForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/config" element={<AdminConfig />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
