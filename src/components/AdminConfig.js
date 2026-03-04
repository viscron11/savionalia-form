import AdminLayout from "./AdminLayout";
import FormConfigEditor from "./FormConfigEditor";
import OptionsEditor from "./OptionsEditor";
import "./AdminDashboard.css";

export default function AdminConfig() {
    return (
        <AdminLayout activeTab="config">
            <FormConfigEditor />
            <OptionsEditor />
        </AdminLayout>
    );
}
