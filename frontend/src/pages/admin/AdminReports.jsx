import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

const currency = (n) => `$${Number(n || 0).toFixed(2)}`;

const AdminReports = () => {
    const [summary, setSummary] = useState(null);
    const [revenue, setRevenue] = useState({ labels: [], data: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const headers = { password: "admin123" };
                const [s, r] = await Promise.all([
                    axios.get("http://localhost:3000/admin/analytics/summary", { headers }),
                    axios.get("http://localhost:3000/admin/analytics/revenue", { headers }),
                ]);
                setSummary(s.data);
                setRevenue(r.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Sales Reports & Analytics</h1>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
                        <FiArrowLeft />
                        Back
                    </button>
                </div>

                {/* KPI Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-sm text-gray-500">Total Orders</p>
                            <p className="text-3xl font-bold text-gray-900">{summary.totalOrders}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <p className="text-3xl font-bold text-gray-900">{currency(summary.totalRevenue)}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-sm text-gray-500">Avg. Order Value</p>
                            <p className="text-3xl font-bold text-gray-900">{currency(summary.averageOrderValue)}</p>
                        </div>
                    </div>
                )}

                {/* Revenue Chart (simple bars without chart lib) */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue - Last 30 Days</h2>
                    <div className="h-48 flex items-end gap-1">
                        {revenue.data.map((v, i) => {
                            const max = Math.max(...revenue.data, 1);
                            const height = Math.round((v / max) * 100);
                            return (
                                <div key={i} className="flex-1 bg-amber-200" style={{ height: `${height}%` }} title={`${revenue.labels[i]}: ${currency(v)}`}></div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>{revenue.labels[0]}</span>
                        <span>{revenue.labels[revenue.labels.length - 1]}</span>
                    </div>
                </div>

                {/* Top Books */}
                {summary && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Books</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {summary.topBooks.map((t, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-2 text-sm text-gray-900">{t.book?.title || "Book"}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">{t.book?.author}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">{t.quantity}</td>
                                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{currency(t.revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReports;



