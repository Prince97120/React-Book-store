import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { getImageUrl } from "../../utils/imageUtils";

const Billing = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/order/${orderId}`);
                setOrder(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
                    <Link to="/" className="text-amber-600 hover:text-amber-800">Go Home</Link>
                </div>
            </div>
        );
    }

    // Only show bill for delivered orders
    if (order.status !== "delivered") {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center bg-white p-8 rounded-lg shadow">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Bill Not Available
                    </h1>
                    <p className="text-gray-600 mb-4">
                        {order.status === "pending" 
                            ? "Your order is pending approval. The bill will be available after the admin approves your order."
                            : order.status === "rejected"
                            ? "This order was rejected. Bill is not available for rejected orders."
                            : `Your order status is: ${order.status}. Bill is only available for delivered orders.`}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link 
                            to="/orders" 
                            className="px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700"
                        >
                            View Orders
                        </Link>
                        <Link 
                            to="/" 
                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const orderNumber = order?._id ? String(order._id).slice(-8).toUpperCase() : "";
    const date = order?.createdAt ? new Date(order.createdAt).toLocaleString() : "";

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-4xl mx-auto bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
                        <p className="text-sm text-gray-600">Order #{orderNumber}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="text-sm font-medium text-gray-900">{date}</p>
                    </div>
                </div>

                <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Billed To</h2>
                        <p className="text-sm text-gray-700 mt-1">{order.user?.name || "Customer"}</p>
                        <p className="text-sm text-gray-700">{order.user?.email}</p>
                        {order.shippingAddress && (
                            <p className="text-sm text-gray-700 mt-1">
                                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                            </p>
                        )}
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Payment</h2>
                        <p className="text-sm text-gray-700 mt-1 capitalize">Method: {order.paymentMethod || "cod"}</p>
                        <p className="text-sm text-gray-700">Status: {order.paymentStatus || "paid"}</p>
                        <p className="text-sm text-gray-700">Order Status: {order.status}</p>
                    </div>
                </div>

                <div className="px-6 py-4">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(order.items || []).map((it, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-12 w-9 bg-gray-200 flex items-center justify-center">
                                                    {it.book?.image ? (
                                                        <img src={getImageUrl(it.book.image)} alt={it.book.title} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span>📚</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{it.book?.title || "Book"}</p>
                                                    <p className="text-xs text-gray-500">{it.book?.author}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700">${Number(it.price).toFixed(2)}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{it.quantity}</td>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">${(Number(it.price) * Number(it.quantity)).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-end">
                        <div className="w-full md:w-1/2">
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-900 font-medium">${Number(order.totalAmount || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-gray-900 font-medium">$0.00</span>
                            </div>
                            <div className="flex justify-between text-base py-2 border-t mt-2">
                                <span className="font-semibold">Grand Total</span>
                                <span className="font-semibold">${Number(order.totalAmount || 0).toFixed(2)}</span>
                            </div>
                            <div className="mt-4 flex gap-3">
                                <button onClick={() => window.print()} className="px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700">Print Invoice</button>
                                <Link to="/orders" className="px-4 py-2 rounded-md border border-amber-600 text-amber-600 hover:bg-amber-50">View Orders</Link>
                                <Link to="/" className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Continue Shopping</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Billing;


