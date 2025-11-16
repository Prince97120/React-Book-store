import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { FiArrowLeft } from "react-icons/fi";
import { useSnackbar } from "notistack";
import axios from "axios";

const EditBook = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        publishYear: "",
        price: "",
        description: "",
        category: "",
        stock: "",
        isActive: true,
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [currentImage, setCurrentImage] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (!localStorage.getItem("adminLoggedIn")) {
            window.location.href = "/admin";
            return;
        }
        loadBook();
    }, [id]);

    const loadBook = async () => {
        try {
            const response = await axios.get(
                `http://localhost:3000/admin/books/${id}`,
                {
                    headers: {
                        password: "admin123",
                    },
                }
            );
            const book = response.data;
            setFormData({
                title: book.title,
                author: book.author,
                publishYear: book.publishYear.toString(),
                price: book.price.toString(),
                description: book.description,
                category: book.category,
                stock: book.stock.toString(),
                isActive: book.isActive !== undefined ? book.isActive : true,
            });
            setCurrentImage(book.image || "");
        } catch (error) {
            enqueueSnackbar("Error loading book", { variant: "error" });
            navigate("/admin/dashboard");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
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
        setSaving(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("title", formData.title);
            formDataToSend.append("author", formData.author);
            formDataToSend.append("publishYear", formData.publishYear);
            formDataToSend.append("price", formData.price);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("category", formData.category);
            formDataToSend.append("stock", formData.stock);
            // Auto-set inactive if stock is 0 or empty
            const stockValue = parseInt(formData.stock) || 0;
            const isActive = stockValue > 0 ? formData.isActive : false;
            formDataToSend.append("isActive", isActive.toString());

            if (imageFile) {
                formDataToSend.append("image", imageFile);
            }

            await axios.put(
                `http://localhost:3000/admin/books/${id}`,
                formDataToSend,
                {
                    headers: {
                        password: "admin123",
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            enqueueSnackbar("Book updated successfully!", {
                variant: "success",
            });
            navigate("/admin/dashboard");
        } catch (error) {
            enqueueSnackbar(
                error.response?.data?.message || "Error updating book",
                { variant: "error" }
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

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
                                {parseInt(formData.stock) === 0 && (
                                    <p className="mt-1 text-sm text-yellow-600">
                                        Book will be set to inactive when stock is 0
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        disabled={parseInt(formData.stock) === 0}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Active Status
                                    </span>
                                </label>
                                <p className="mt-1 text-xs text-gray-500">
                                    {parseInt(formData.stock) === 0
                                        ? "Cannot activate book with 0 stock"
                                        : "Only active books are visible to customers"}
                                </p>
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
                                {currentImage && !imagePreview && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 mb-2">
                                            Current image:
                                        </p>
                                        <img
                                            src={`http://localhost:3000${currentImage}`}
                                            alt="Current"
                                            className="w-32 h-32 object-cover rounded-md border"
                                        />
                                    </div>
                                )}
                                {imagePreview && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 mb-2">
                                            New image preview:
                                        </p>
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
                                disabled={saving}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                            >
                                {saving ? "Saving..." : "Update Book"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditBook;
