import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    PlusCircle,
    Users,
    ClipboardList,
    BarChart3,
    Video,
    Menu,
    X,
} from "lucide-react";

const menuItems = [
    { to: "/admin", label: "Overview", Icon: LayoutDashboard },
    { to: "/admin/courses/create", label: "Add Course", Icon: PlusCircle },
    { to: "/admin/video-classes", label: "Video Classes", Icon: Video },
    { to: "/admin/enrollments", label: "Enrollments", Icon: Users },
    { to: "/admin/assignments", label: "Assignments", Icon: ClipboardList },
    { to: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
    { to: "/admin/users", label: "Manage Users", Icon: Users },
];

const linkClass = ({ isActive }) => {
    const base = "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200";
    return isActive
        ? `${base} bg-primary text-primary-content font-semibold shadow-md`
        : `${base} text-base-content font-medium hover:bg-primary/20 hover:text-primary`;
};

export default function AdminSidebar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const renderItems = (onClick) =>
        menuItems.map(({ to, label}) => (
            <NavLink key={to} to={to} end onClick={onClick} className={linkClass}>
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm sm:text-base">{label}</span>
            </NavLink>
        ));

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-base-200 border-b-2 border-base-300 p-2 shadow-md">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="btn btn-sm btn-ghost text-base-content"
                >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    <span className="ml-2 font-semibold">Admin Menu</span>
                </button>
            </div>

            {/* Mobile drawer */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-50 bg-black/50"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <aside
                        className="bg-base-200 border-r-2 border-base-300 w-64 h-full p-4 space-y-2 overflow-y-auto shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg text-base-content">Admin Menu</h2>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="btn btn-sm btn-ghost"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {renderItems(() => setMobileMenuOpen(false))}
                    </aside>
                </div>
            )}

            {/* Desktop sidebar */}
            <aside className="hidden lg:block bg-base-200 border-r-2 border-base-300 min-h-screen w-64 p-4 space-y-2 transition-all duration-200 shadow-lg">
                {renderItems()}
            </aside>
        </>
    );
}