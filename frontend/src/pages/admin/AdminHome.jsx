import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { useSnackbar } from "notistack";
import axios from "axios";
import { getImageUrl } from "../../utils/imageUtils";

const AdminHome = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [activeTab, setActiveTab] = useState("books"); // Default to "books", switch to "orders" when navbar button clicked
    const { enqueueSnackbar } = useSnackbar();

    const loadBooks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                "http://localhost:3000/admin/books",
                {
                    headers: {
                        password: "admin123",
                    },
                }
            );
            setBooks(response.data.data);
        } catch (error) {
            enqueueSnackbar("Error loading books", { variant: "error" });
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    const loadPendingOrders = useCallback(async () => {
        setLoadingOrders(true);
        try {
            const response = await axios.get(
                "http://localhost:3000/admin/orders/pending",
                {
                    headers: {
                        password: "admin123",
                    },
                }
            );
            // Ensure we're getting an array
            const orders = Array.isArray(response.data) ? response.data : [];
            setPendingOrders(orders);
            console.log("Pending orders loaded:", orders.length);
        } catch (error) {
            console.error("Error loading pending orders:", error);
            enqueueSnackbar("Error loading pending orders", { variant: "error" });
            setPendingOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        loadBooks();
        loadPendingOrders();
    }, [loadBooks, loadPendingOrders]);

    // Listen for tab switch event from navbar
    useEffect(() => {
        const handleTabSwitch = () => {
            setActiveTab("orders");
        };
        window.addEventListener('switchToOrdersTab', handleTabSwitch);
        return () => window.removeEventListener('switchToOrdersTab', handleTabSwitch);
    }, []);

    const deleteBook = async (id) => {
        if (!window.confirm("Are you sure you want to delete this book?")) {
            return;
        }

        try {
            await axios.delete(`http://localhost:3000/admin/books/${id}`, {
                headers: {
                    password: "admin123",
                },
            });
            enqueueSnackbar("Book deleted successfully!", {
                variant: "success",
            });
            loadBooks();
        } catch (error) {
            enqueueSnackbar("Error deleting book", { variant: "error" });
        }
    };

    const approveOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to approve this order?")) {
            return;
        }

        try {
            await axios.put(
                `http://localhost:3000/admin/orders/${orderId}/approve`,
                {},
                {
                    headers: {
                        password: "admin123",
                    },
                }
            );
            enqueueSnackbar("Order approved successfully!", {
                variant: "success",
            });
            // Refresh both orders and books
            await loadPendingOrders();
            await loadBooks(); // Reload books to update stock
        } catch (error) {
            enqueueSnackbar(
                error.response?.data?.message || "Error approving order",
                { variant: "error" }
            );
        }
    };

    const rejectOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to reject this order?")) {
            return;
        }

        try {
            await axios.put(
                `http://localhost:3000/admin/orders/${orderId}/reject`,
                {},
                {
                    headers: {
                        password: "admin123",
                    },
                }
            );
            enqueueSnackbar("Order rejected successfully!", {
                variant: "success",
            });
            await loadPendingOrders();
        } catch (error) {
            enqueueSnackbar(
                error.response?.data?.message || "Error rejecting order",
                { variant: "error" }
            );
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

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">
                        {activeTab === "books" 
                            ? "Manage your book inventory"
                            : "Review and manage pending customer orders"}
                    </p>
                </div>

                {/* Books Tab */}
                {activeTab === "books" && (
                    <>
                        <div className="mb-8 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Books Management
                            </h2>
                            <Link
                                to="/admin/books/create"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Add New Book
                            </Link>
                        </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {books.map((book) => (
                                <li key={book._id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-16 w-12 bg-gray-200 rounded flex items-center justify-center">
                                                    {book.image ? (
                                                        <img
                                                            src={getImageUrl(
                                                                book.image
                                                            )}
                                                            alt={book.title}
                                                            className="h-full w-full object-cover rounded"
                                                            onError={(e) => {
                                                                e.target.style.display =
                                                                    "none";
                                                                e.target.nextSibling.style.display =
                                                                    "block";
                                                            }}
                                                        />
                                                    ) : null}
                                                    <span
                                                        className="text-gray-500 text-2xl"
                                                        style={{
                                                            display: book.image
                                                                ? "none"
                                                                : "block",
                                                        }}
                                                    >
                                                        📚
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="flex items-center">
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            {book.title}
                                                        </h3>
                                                        <span
                                                            className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                                                                book.isActive
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-red-100 text-red-800"
                                                            }`}
                                                        >
                                                            {book.isActive
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        by {book.author}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {book.category} •
                                                        Published:{" "}
                                                        {book.publishYear}
                                                    </p>
                                                    <p className="text-sm font-medium text-blue-600">
                                                        ${book.price} • Stock:{" "}
                                                        {book.stock}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    to={`/admin/books/edit/${book._id}`}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        deleteBook(book._id)
                                                    }
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {books.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No books found</p>
                        <Link
                            to="/admin/books/create"
                            className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
                        >
                            Add Your First Book
                        </Link>
                    </div>
                )}
                </>)}

                {/* Pending Orders Tab */}
                {activeTab === "orders" && (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Pending Orders
                            </h2>
                            <p className="text-gray-600">
                                Review and approve or reject customer orders
                            </p>
                        </div>

                        {loadingOrders ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : pendingOrders.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-8 text-center">
                                <p className="text-gray-500 text-lg">
                                    No pending orders
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {pendingOrders.map((order) => (
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
                                                        {formatDate(
                                                            order.createdAt
                                                        )}
                                                    </p>
                                                    {order.user && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Customer:{" "}
                                                            {order.user.name} (
                                                            {order.user.email})
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-lg font-semibold text-gray-900">
                                                        $
                                                        {order.totalAmount.toFixed(
                                                            2
                                                        )}
                                                    </span>
                                                    <span className="ml-3 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                                        Pending
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-6 py-4">
                                            <div className="space-y-4 mb-4">
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
                                                                            item
                                                                                .book
                                                                                .image
                                                                        )}
                                                                        alt={
                                                                            item
                                                                                .book
                                                                                .title ||
                                                                            "Book"
                                                                        }
                                                                        className="h-full w-full object-cover rounded"
                                                                    />
                                                                ) : (
                                                                    <span className="text-gray-500 text-xl">
                                                                        📚
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-medium text-gray-900">
                                                                {item.book
                                                                    ? item.book
                                                                          .title
                                                                    : "Unknown Book"}
                                                            </h4>
                                                            <p className="text-sm text-gray-600">
                                                                Qty: {item.quantity} × $
                                                                {item.price.toFixed(
                                                                    2
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
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
                                                        {order.shippingAddress
                                                            .street}
                                                        <br />
                                                        {
                                                            order
                                                                .shippingAddress
                                                                .city
                                                        }
                                                        ,{" "}
                                                        {
                                                            order
                                                                .shippingAddress
                                                                .state
                                                        }{" "}
                                                        {
                                                            order
                                                                .shippingAddress
                                                                .zipCode
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-6 flex justify-end space-x-3">
                                                <button
                                                    onClick={() =>
                                                        rejectOrder(order._id)
                                                    }
                                                    className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 font-medium"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        approveOrder(order._id)
                                                    }
                                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                                                >
                                                    Approve
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminHome;
