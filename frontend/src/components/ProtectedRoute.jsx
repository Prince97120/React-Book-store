import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, isAdmin = false }) => {
    if (isAdmin) {
        const isAdminLoggedIn = localStorage.getItem("adminLoggedIn");
        if (!isAdminLoggedIn) {
            return <Navigate to="/admin" replace />;
        }
    } else {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            return <Navigate to="/login" replace />;
        }
    }
    return children;
};

export default ProtectedRoute;

