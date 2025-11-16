import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import axios from "axios";

const Checkout = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        street: "",
        city: "",
        state: "",
        zipCode: "",
    });
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            navigate("/login");
            return;
        }
        loadCart();
        loadUserAddress();
    }, [navigate]);

    const loadCart = async () => {
        const userId = localStorage.getItem("userId");
        try {
            const response = await axios.get(
                `http://localhost:3000/api/cart/${userId}`
            );
            setCart(response.data);
        } catch (error) {
            enqueueSnackbar("Error loading cart", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const loadUserAddress = async () => {
        const userId = localStorage.getItem("userId");
        try {
            const response = await axios.get(
                `http://localhost:3000/api/user/${userId}`
            );
            if (response.data.address) {
                setShippingAddress(response.data.address);
            }
        } catch (error) {
            // User might not have saved address yet, that's okay
            console.log("No saved address found");
        }
    };

    const handleAddressChange = (e) => {
        setShippingAddress({
            ...shippingAddress,
            [e.target.name]: e.target.value,
        });
    };

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => {
            return total + item.book.price * item.quantity;
        }, 0);
    };

    const placeOrder = async () => {
        if (
            !shippingAddress.street ||
            !shippingAddress.city ||
            !shippingAddress.state ||
            !shippingAddress.zipCode
        ) {
            enqueueSnackbar("Please fill in all shipping address fields", {
                variant: "warning",
            });
            return;
        }

        setPlacingOrder(true);
        const userId = localStorage.getItem("userId");

        try {
            // Save address for future use
            await axios.put(
                `http://localhost:3000/api/user/${userId}/address`,
                {
                    address: shippingAddress,
                }
            );

            // Place the order
            const orderRes = await axios.post("http://localhost:3000/api/order", {
                userId,
                shippingAddress,
            });

            enqueueSnackbar("Order placed successfully! Waiting for admin approval.", {
                variant: "success",
            });
            
            // Always redirect to orders page - billing will be available after admin approval
            navigate("/orders");
        } catch (error) {
            enqueueSnackbar(
                error.response?.data?.message || "Error placing order",
                { variant: "error" }
            );
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Your cart is empty
                    </h1>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
                    >
                        Continue Shopping
                    </button>
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
                        <h1 className="text-3xl font-bold text-gray-900">
                            Checkout
                        </h1>
                        <div className="flex items-center space-x-4">
                            <span className="text-lg text-gray-700">
                                🛒 Checkout
                            </span>
                            {localStorage.getItem("userId") ? (
                                <div className="flex items-center space-x-2">
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
                                    <button
                                        onClick={() => navigate("/login")}
                                        className="text-gray-700 hover:text-gray-900"
                                    >
                                        Login
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shipping Address */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Shipping Address
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="street"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Street Address *
                                    </label>
                                    <input
                                        type="text"
                                        id="street"
                                        name="street"
                                        required
                                        value={shippingAddress.street}
                                        onChange={handleAddressChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="city"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        required
                                        value={shippingAddress.city}
                                        onChange={handleAddressChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="state"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state"
                                        required
                                        value={shippingAddress.state}
                                        onChange={handleAddressChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="zipCode"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        ZIP Code *
                                    </label>
                                    <input
                                        type="text"
                                        id="zipCode"
                                        name="zipCode"
                                        required
                                        value={shippingAddress.zipCode}
                                        onChange={handleAddressChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Order Items
                            </h2>
                            <div className="space-y-4">
                                {cart.items.map((item) => (
                                    <div
                                        key={item.book._id}
                                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                                    >
                                        <div className="flex-shrink-0">
                                            <div className="h-16 w-12 bg-gray-200 rounded flex items-center justify-center">
                                                {item.book.image ? (
                                                    <img
                                                        src={item.book.image}
                                                        alt={item.book.title}
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
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {item.book.title}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                by {item.book.author}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-semibold text-gray-900">
                                                $
                                                {(
                                                    item.book.price *
                                                    item.quantity
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Order Summary
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Subtotal
                                    </span>
                                    <span className="font-medium">
                                        ${calculateTotal().toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Shipping
                                    </span>
                                    <span className="font-medium">Free</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-semibold">
                                            Total
                                        </span>
                                        <span className="text-lg font-semibold">
                                            ${calculateTotal().toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                                <h3 className="text-sm font-medium text-blue-800 mb-2">
                                    Payment Method
                                </h3>
                                <p className="text-sm text-blue-700">
                                    Cash on Delivery (COD)
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    Payment will be collected when your order is
                                    delivered.
                                </p>
                            </div>

                            <button
                                onClick={placeOrder}
                                disabled={placingOrder}
                                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                            >
                                {placingOrder
                                    ? "Placing Order..."
                                    : "Place Order"}
                            </button>

                            <button
                                onClick={() => navigate("/cart")}
                                className="w-full mt-3 text-center text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Back to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
