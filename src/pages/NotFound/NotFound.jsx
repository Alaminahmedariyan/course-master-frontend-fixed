import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="text-center py-20 space-y-4">
            <h1 className="page-heading">404 - Page Not Found</h1>
            <p className="text-base-content/70">
                The page you are looking for does not exist.
            </p>
            <Link to="/" className="btn btn-primary">
                Back to Home
            </Link>
        </div>
    );
}