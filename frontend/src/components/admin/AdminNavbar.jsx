import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiBarChart2, FiBookOpen, FiHome, FiPlusCircle, FiLogOut, FiShoppingBag } from "react-icons/fi";
import axios from "axios";

const NavLink = ({ to, icon: Icon, label, badge }) => {
    const location = useLocation();
    const active = location.pathname === to;
    return (
        <Link
            to={to}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium relative ${
                active
                    ? "bg-amber-100 text-amber-700"
                    : "text-gray-700 hover:bg-gray-100"
            }`}
        >
            <Icon className="text-lg" />
            <span className="hidden sm:block">{label}</span>
            {badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </Link>
    );
};

const AdminNavbar = () => {
    const navigate = useNavigate();
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

    const loadPendingOrdersCount = useCallback(async () => {
        try {
            const response = await axios.get(
                "http://localhost:3000/admin/orders/pending",
                {
                    headers: {
                        password: "admin123",
                    },
                }
            );
            setPendingOrdersCount(response.data.length || 0);
        } catch (error) {
            setPendingOrdersCount(0);
        }
    }, []);

    useEffect(() => {
        loadPendingOrdersCount();
        // Refresh count every 10 seconds
        const interval = setInterval(loadPendingOrdersCount, 10000);
        return () => clearInterval(interval);
    }, [loadPendingOrdersCount]);

    const logout = () => {
        localStorage.removeItem("adminLoggedIn");
        navigate("/admin");
    };

    const handlePendingOrdersClick = () => {
        navigate("/admin/dashboard");
        // Trigger tab switch in AdminHome
        window.dispatchEvent(new CustomEvent('switchToOrdersTab'));
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-4">
                    <Link to="/admin/dashboard" className="flex items-center gap-2">
                        <FiBookOpen className="text-2xl text-amber-600" />
                        <span className="text-xl font-bold text-gray-900">Admin</span>
                    </Link>
                    <nav className="flex items-center gap-2">
                        <NavLink to="/admin/dashboard" icon={FiHome} label="Dashboard" />
                        <button
                            onClick={handlePendingOrdersClick}
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 relative"
                        >
                            <FiShoppingBag className="text-lg" />
                            <span className="hidden sm:block">Pending Orders</span>
                            {pendingOrdersCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                                </span>
                            )}
                        </button>
                        <NavLink to="/admin/reports" icon={FiBarChart2} label="Reports" />
                        <NavLink to="/admin/books/create" icon={FiPlusCircle} label="Add Book" />
                    </nav>
                    <button onClick={logout} className="flex items-center gap-2 text-gray-700 hover:text-red-600">
                        <FiLogOut />
                        <span className="hidden sm:block">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AdminNavbar;


