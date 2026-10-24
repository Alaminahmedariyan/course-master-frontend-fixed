import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { logout } from "../../store/slices/authSlice";

export default function Navbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { token, user: me } = useSelector((state) => state.auth);

    const dashboardPath = me?.role === "admin" ? "/admin" : "/student";

    const navLinkClass = ({ isActive }) =>
        isActive
            ? "text-primary font-semibold"
            : "text-base-content/80 hover:text-primary";

    // Close a DaisyUI dropdown after a click
    const closeDropdown = () => document.activeElement?.blur();

    const handleLogout = () => {
        closeDropdown();
        dispatch(logout());
        navigate("/", { replace: true });
    };

    const initials = me?.name
        ? me.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
        : "U";

    return (
        <header className="sticky top-0 z-50 bg-base-100/90 backdrop-blur border-b border-base-300">
            <div className="navbar max-w-6xl mx-auto px-2">
                <div className="navbar-start">
                    <Logo />
                </div>

                <div className="navbar-center hidden md:flex">
                    <ul className="menu menu-horizontal gap-1">
                        <li><NavLink end className={navLinkClass} to="/">Home</NavLink></li>
                        <li><NavLink className={navLinkClass} to="/courses">Courses</NavLink></li>
                        {token && me && (
                            <li><NavLink className={navLinkClass} to={dashboardPath}>Dashboard</NavLink></li>
                        )}
                    </ul>
                </div>

                <div className="navbar-end gap-2">
                    <ThemeToggle />

                    {!token && (
                        <div className="hidden md:flex gap-2">
                            <Link to="/login" className="btn btn-sm btn-ghost">Login</Link>
                            <Link to="/register" className="btn btn-sm btn-primary">Enroll Now</Link>
                        </div>
                    )}

                    {token && me && (
                        <div className="hidden md:block dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                                <div className="w-9 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold">
                                    {initials}
                                </div>
                            </label>

                            <ul
                                tabIndex={0}
                                className="dropdown-content menu mt-3 p-3 shadow bg-base-100 rounded-box w-60 border border-base-300"
                            >
                                <li className="px-2 pb-2 pointer-events-none">
                                    <div className="flex flex-col items-start gap-0.5 p-0">
                                        <p className="font-semibold">{me.name}</p>
                                        <p className="text-sm text-base-content/70">{me.email}</p>
                                        <span className="text-xs badge badge-outline mt-2">{me.role}</span>
                                    </div>
                                </li>
                                <li>
                                    <Link to={dashboardPath} onClick={closeDropdown}>Dashboard</Link>
                                </li>
                                <li>
                                    <button onClick={handleLogout} className="text-red-500">Logout</button>
                                </li>
                            </ul>
                        </div>
                    )}

                    {/* Mobile hamburger */}
                    <div className="dropdown dropdown-end md:hidden">
                        <label tabIndex={0} className="btn btn-ghost btn-circle" aria-label="Open menu">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </label>

                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content mt-3 p-3 shadow bg-base-100 rounded-box w-56 border border-base-300"
                        >
                            <li><NavLink end className={navLinkClass} to="/" onClick={closeDropdown}>Home</NavLink></li>
                            <li><NavLink className={navLinkClass} to="/courses" onClick={closeDropdown}>Courses</NavLink></li>

                            {token && me && (
                                <li>
                                    <NavLink className={navLinkClass} to={dashboardPath} onClick={closeDropdown}>
                                        Dashboard
                                    </NavLink>
                                </li>
                            )}

                            <li className="my-1 border-t border-base-300 pointer-events-none"></li>

                            {!token ? (
                                <>
                                    <li><Link to="/login" onClick={closeDropdown}>Login</Link></li>
                                    <li><Link to="/register" onClick={closeDropdown}>Enroll Now</Link></li>
                                </>
                            ) : (
                                <>
                                    {me && (
                                        <li className="pointer-events-none">
                                            <div className="flex flex-col items-start gap-0.5">
                                                <p className="font-semibold">{me.name}</p>
                                                <p className="text-xs text-base-content/70">{me.email}</p>
                                            </div>
                                        </li>
                                    )}
                                    <li>
                                        <button onClick={handleLogout} className="text-red-500">Logout</button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    );
}