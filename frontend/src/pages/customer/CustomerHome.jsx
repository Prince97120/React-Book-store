import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import axios from "axios";
import { getImageUrl } from "../../utils/imageUtils";
import { FiSearch, FiShoppingCart, FiUser, FiLogOut, FiBookOpen, FiStar } from "react-icons/fi";
import Footer from "../../components/Footer";

const CustomerHome = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const { enqueueSnackbar } = useSnackbar();

    const loadBooks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:3000/api/books");
            setBooks(response.data.data);

            // Extract unique categories
            const uniqueCategories = [
                ...new Set(response.data.data.map((book) => book.category)),
            ];
            setCategories(uniqueCategories);
        } catch (error) {
            enqueueSnackbar("Error loading books", { variant: "error" });
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    const loadCartCount = useCallback(async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            setCartCount(0);
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:3000/api/cart/${userId}`
            );
            if (response.data && response.data.items) {
                const totalItems = response.data.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                );
                setCartCount(totalItems);
            } else {
                setCartCount(0);
            }
        } catch (error) {
            setCartCount(0);
        }
    }, []);

    useEffect(() => {
        loadBooks();
        loadCartCount();
    }, [loadBooks, loadCartCount]);

    // Refresh cart count when window gains focus (user returns to tab)
    useEffect(() => {
        const handleFocus = () => {
            loadCartCount();
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [loadCartCount]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append("q", searchTerm);
            if (selectedCategory) params.append("category", selectedCategory);

            const response = await axios.get(
                `http://localhost:3000/api/search?${params}`
            );
            setBooks(response.data.data);
        } catch (error) {
            enqueueSnackbar("Error searching books", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (bookId) => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            enqueueSnackbar("Please login to add items to cart", {
                variant: "warning",
            });
            return;
        }

        try {
            await axios.post("http://localhost:3000/api/cart/add", {
                userId,
                bookId,
                quantity: 1,
            });
            enqueueSnackbar("Added to cart successfully!", {
                variant: "success",
            });
            // Update cart count
            loadCartCount();
        } catch (error) {
            enqueueSnackbar(
                error.response?.data?.message || "Error adding to cart",
                { variant: "error" }
            );
        }
    };


    return (
        <div className="min-h-screen bg-white">
            {/* Modern Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <FiBookOpen className="text-3xl text-amber-600" />
                            <span className="text-2xl font-bold text-gray-900">BookStore</span>
                        </Link>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-lg mx-8">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for books, authors, or ISBN"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center space-x-6">
                            <Link
                                to="/cart"
                                className="flex items-center space-x-1 text-gray-700 hover:text-amber-600 transition-colors relative"
                            >
                                <FiShoppingCart className="text-xl" />
                                <span className="hidden sm:block">Cart</span>
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>
                            
                            {localStorage.getItem("userId") ? (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        to="/orders"
                                        className="text-gray-700 hover:text-amber-600 transition-colors"
                                    >
                                        Orders
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-1 text-gray-700 hover:text-amber-600 transition-colors"
                                    >
                                        <FiUser className="text-xl" />
                                        <span className="hidden sm:block">Profile</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem("userId");
                                            window.location.reload();
                                        }}
                                        className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                                    >
                                        <FiLogOut className="text-xl" />
                                        <span className="hidden sm:block">Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        to="/login"
                                        className="text-gray-700 hover:text-amber-600 transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-amber-600 text-white px-4 py-2 rounded-full hover:bg-amber-700 transition-colors font-medium"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-amber-50 to-orange-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            Discover Your Next Great Read
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Find books you'll love, get personalized recommendations, and connect with fellow book lovers in our community.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleSearch}
                                className="bg-amber-600 text-white px-8 py-3 rounded-full hover:bg-amber-700 transition-colors font-medium text-lg"
                            >
                                Browse Books
                            </button>
                            <Link
                                to="/register"
                                className="border-2 border-amber-600 text-amber-600 px-8 py-3 rounded-full hover:bg-amber-600 hover:text-white transition-colors font-medium text-lg"
                            >
                                Join Our Community
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* All Books Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">All Books</h2>
                        <div className="flex items-center space-x-4">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {books.map((book) => (
                                <div
                                    key={book._id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group"
                                >
                                    <div className="aspect-[2/3] bg-gray-200 flex items-center justify-center">
                                        {book.image ? (
                                            <img
                                                src={getImageUrl(book.image)}
                                                alt={book.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.style.display = "none";
                                                    e.target.nextSibling.style.display = "block";
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="text-gray-400 text-6xl"
                                            style={{
                                                display: book.image ? "none" : "block",
                                            }}
                                        >
                                            📚
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                                            {book.title}
                                        </h3>
                                        <p className="text-gray-600 mb-2 line-clamp-1">
                                            by {book.author}
                                        </p>
                                        <p className="text-sm text-gray-500 mb-2">
                                            {book.category}
                                        </p>
                                        <p className="text-lg font-bold text-amber-600 mb-3">
                                            ${book.price}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {book.description}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <Link
                                                to={`/book/${book._id}`}
                                                className="text-amber-600 hover:text-amber-800 text-sm font-medium transition-colors"
                                            >
                                                View Details
                                            </Link>
                                            <button
                                                onClick={() => addToCart(book._id)}
                                                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 text-sm transition-colors"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {books.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No books found</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default CustomerHome;
