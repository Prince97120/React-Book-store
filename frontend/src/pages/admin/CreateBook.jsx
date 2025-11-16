import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { FiArrowLeft } from "react-icons/fi";
import { useSnackbar } from "notistack";
import axios from "axios";

const CreateBook = () => {
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        publishYear: "",
        price: "",
        description: "",
        category: "",
        stock: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!localStorage.getItem("adminLoggedIn")) {
            window.location.href = "/admin";
            return;
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("title", formData.title);
            formDataToSend.append("author", formData.author);
            formDataToSend.append("publishYear", formData.publishYear);
            formDataToSend.append("price", formData.price);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("category", formData.category);
            formDataToSend.append("stock", formData.stock);

            if (imageFile) {
                formDataToSend.append("image", imageFile);
            }

            await axios.post(
                "http://localhost:3000/admin/books",
                formDataToSend,
                {
                    headers: {
                        password: "admin123",
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            enqueueSnackbar("Book created successfully!", {
                variant: "success",
            });
            navigate("/admin/dashboard");
        } catch (error) {
            enqueueSnackbar(
                error.response?.data?.message || "Error creating book",
                { variant: "error" }
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNavbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-4">
                    <button onClick={() => window.history.back()} className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
                        <FiArrowLeft />
                        Back
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Book Information
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label
                                    htmlFor="title"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="author"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Author *
                                </label>
                                <input
                                    type="text"
                                    id="author"
                                    name="author"
                                    required
                                    value={formData.author}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="publishYear"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Publish Year *
                                </label>
                                <input
                                    type="number"
                                    id="publishYear"
                                    name="publishYear"
                                    required
                                    min="1000"
                                    max="2024"
                                    value={formData.publishYear}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="price"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Price *
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="category"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Category *
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select a category</option>
                                    <option value="Fiction">Fiction</option>
                                    <option value="Non-Fiction">
                                        Non-Fiction
                                    </option>
                                    <option value="Science">Science</option>
                                    <option value="History">History</option>
                                    <option value="Biography">Biography</option>
                                    <option value="Technology">
                                        Technology
                                    </option>
                                    <option value="Business">Business</option>
                                    <option value="Health">Health</option>
                                    <option value="Education">Education</option>
                                    <option value="Children">Children</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="stock"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Stock Quantity
                                </label>
                                <input
                                    type="number"
                                    id="stock"
                                    name="stock"
                                    min="0"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label
                                    htmlFor="image"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Book Image
                                </label>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                                {imagePreview && (
                                    <div className="mt-4">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-32 h-32 object-cover rounded-md border"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Description *
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-4">
                            <Link
                                to="/admin/dashboard"
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                            >
                                {loading ? "Creating..." : "Create Book"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateBook;
