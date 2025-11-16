import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import axios from "axios";
import { getImageUrl } from "../../utils/imageUtils";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            enqueueSnackbar("Please login to view orders", {
                variant: "warning",
            });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:3000/api/orders/${userId}`
            );
            setOrders(response.data);
        } catch (error) {
            enqueueSnackbar("Error loading orders", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "confirmed":
                return "bg-blue-100 text-blue-800";
            case "shipped":
                return "bg-purple-100 text-purple-800";
            case "delivered":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!localStorage.getItem("userId")) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Please login to view orders
                    </h1>
                    <Link
                        to="/login"
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <Link
                            to="/"
                            className="text-3xl font-bold text-gray-900"
                        >
                            BookStore
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/cart"
                                className="text-gray-700 hover:text-gray-900"
                            >
                                <span className="text-lg">🛒 Cart</span>
                            </Link>
                            <span className="text-lg text-gray-700">
                                📋 Orders
                            </span>
                            {localStorage.getItem("userId") ? (
                                <div className="flex items-center space-x-2">
                                    <Link
                                        to="/profile"
                                        className="text-gray-700 hover:text-gray-900"
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem("userId");
                                            window.location.reload();
                                        }}
                                        className="text-gray-700 hover:text-gray-900"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Link
                                        to="/login"
                                        className="text-gray-700 hover:text-gray-900"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Order History
                </h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            No orders found
                        </h2>
                        <p className="text-gray-600 mb-6">
                            You haven't placed any orders yet.
                        </p>
                        <Link
                            to="/"
                            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white rounded-lg shadow overflow-hidden"
                            >
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Order #
                                                {order._id
                                                    .slice(-8)
                                                    .toUpperCase()}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Placed on{" "}
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    order.status.slice(1)}
                                            </span>
                                            <span className="text-lg font-semibold text-gray-900">
                                                ${order.totalAmount.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4">
                                    <div className="space-y-4">
                                        {order.items.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-4"
                                            >
                                                <div className="flex-shrink-0">
                                                    <div className="h-16 w-12 bg-gray-200 rounded flex items-center justify-center">
                                                        {item.book &&
                                                        item.book.image ? (
                                                            <img
                                                                src={getImageUrl(
                                                                    item.book
                                                                        .image
                                                                )}
                                                                alt={
                                                                    item.book
                                                                        .title ||
                                                                    "Book"
                                                                }
                                                                className="h-full w-full object-cover rounded"
                                                                onError={(
                                                                    e
                                                                ) => {
                                                                    e.target.style.display =
                                                                        "none";
                                                                    e.target.nextSibling.style.display =
                                                                        "block";
                                                                }}
                                                            />
                                                        ) : null}
                                                        <span
                                                            className="text-gray-500 text-xl"
                                                            style={{
                                                                display:
                                                                    item.book &&
                                                                    item.book
                                                                        .image
                                                                        ? "none"
                                                                        : "block",
                                                            }}
                                                        >
                                                            📚
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900">
                                                        {item.book
                                                            ? item.book.title
                                                            : "Unknown Book"}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        by{" "}
                                                        {item.book
                                                            ? item.book.author
                                                            : "Unknown Author"}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-900">
                                                        Qty: {item.quantity}
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        $
                                                        {(
                                                            item.price *
                                                            item.quantity
                                                        ).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {order.shippingAddress && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                                                Shipping Address
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {order.shippingAddress.street}
                                                <br />
                                                {
                                                    order.shippingAddress.city
                                                }, {order.shippingAddress.state}{" "}
                                                {order.shippingAddress.zipCode}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                                        {order.status === "delivered" ? (
                                            <Link
                                                to={`/billing/${order._id}`}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
                                            >
                                                View Bill / Receipt
                                            </Link>
                                        ) : order.status === "rejected" ? (
                                            <p className="text-red-600 text-sm font-medium">
                                                This order was rejected
                                            </p>
                                        ) : (
                                            <p className="text-gray-600 text-sm">
                                                Order is {order.status}. Bill will be available after delivery.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
