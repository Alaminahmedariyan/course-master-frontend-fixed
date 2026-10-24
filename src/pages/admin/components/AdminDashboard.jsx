import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminDashboard() {
    return (
        <div className="w-full max-w-none flex flex-col lg:flex-row min-h-[80vh]">
            <AdminSidebar />

            {/* Spacer for the fixed mobile menu bar */}
            <div className="h-12 lg:hidden" />

            <main className="flex-1 p-2 sm:p-4 lg:p-5 bg-base-100 w-full">
                <Outlet />
            </main>
        </div>
    );
}