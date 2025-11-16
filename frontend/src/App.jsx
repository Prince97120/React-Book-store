import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { SnackbarProvider } from "notistack";

// Customer pages
import CustomerHome from "./pages/customer/CustomerHome";
import Login from "./pages/customer/Login";
import Register from "./pages/customer/Register";
import BookDetails from "./pages/customer/BookDetails";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import Orders from "./pages/customer/Orders";
import Billing from "./pages/customer/Billing";
import Profile from "./pages/customer/Profile";

// Admin pages
import AdminHome from "./pages/admin/AdminHome";
import AdminReports from "./pages/admin/AdminReports";
import AdminLogin from "./pages/admin/AdminLogin";
import CreateBook from "./pages/admin/CreateBook";
import EditBook from "./pages/admin/EditBook";
import DeleteBook from "./pages/admin/DeleteBook";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
    const location = useLocation();

    // Clear admin login when navigating away from admin routes
    useEffect(() => {
        const handleRouteChange = () => {
            if (!location.pathname.startsWith("/admin")) {
                // If user navigates away from admin routes, clear admin login
                if (location.pathname !== "/admin" && localStorage.getItem("adminLoggedIn")) {
                    localStorage.removeItem("adminLoggedIn");
                }
            }
        };
        handleRouteChange();
    }, [location.pathname]);

    return (
        <SnackbarProvider maxSnack={3}>
            <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<CustomerHome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/book/:id" element={<BookDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/billing/:orderId" element={<Billing />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/profile" element={<Profile />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute isAdmin={true}>
                            <AdminHome />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/reports"
                    element={
                        <ProtectedRoute isAdmin={true}>
                            <AdminReports />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/books/create"
                    element={
                        <ProtectedRoute isAdmin={true}>
                            <CreateBook />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/books/edit/:id"
                    element={
                        <ProtectedRoute isAdmin={true}>
                            <EditBook />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/books/delete/:id"
                    element={
                        <ProtectedRoute isAdmin={true}>
                            <DeleteBook />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </SnackbarProvider>
    );
};

export default App;
