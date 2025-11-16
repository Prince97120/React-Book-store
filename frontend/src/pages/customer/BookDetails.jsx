import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import axios from "axios";
import { getImageUrl } from "../../utils/imageUtils";
import { FiShoppingCart } from "react-icons/fi";

const BookDetails = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [cartCount, setCartCount] = useState(0);
    const { enqueueSnackbar } = useSnackbar();

    const loadBook = useCallback(async () => {
        try {
            const response = await axios.get(
                `http://localhost:3000/api/books/${id}`
            );
            setBook(response.data);
        } catch (error) {
            enqueueSnackbar("Error loading book details", { variant: "error" });
        } finally {
            setLoading(false);
        }
    }, [id, enqueueSnackbar]);

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
        loadBook();
        loadCartCount();
    }, [loadBook, loadCartCount]);

    // Refresh cart count when window gains focus (user returns to tab)
    useEffect(() => {
        const handleFocus = () => {
            loadCartCount();
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [loadCartCount]);

    const addToCart = async () => {
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
                bookId: id,
                quantity,
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Book not found
                    </h1>
                    <Link to="/" className="text-blue-600 hover:text-blue-800">
                        Go back to home
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
                                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 relative"
                            >
                                <FiShoppingCart className="text-xl" />
                                <span className="text-lg">Cart</span>
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>
                            {localStorage.getItem("userId") ? (
                                <div className="flex items-center space-x-2">
                                    <Link
                                        to="/orders"
                                        className="text-gray-700 hover:text-gray-900"
                                    >
                                        Orders
                                    </Link>
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
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="md:flex">
                        <div className="md:w-1/2">
                            <div className="h-96 bg-gray-200 flex items-center justify-center">
                                {book.image ? (
                                    <img
                                        src={getImageUrl(book.image)}
                                        alt={book.title}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display =
                                                "block";
                                        }}
                                    />
                                ) : null}
                                <span
                                    className="text-gray-500 text-8xl"
                                    style={{
                                        display: book.image ? "none" : "block",
                                    }}
                                >
                                    📚
                                </span>
                            </div>
                        </div>
                        <div className="md:w-1/2 p-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {book.title}
                            </h1>
                            <p className="text-xl text-gray-600 mb-4">
                                by {book.author}
                            </p>
                            <div className="flex items-center mb-4">
                                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                    {book.category}
                                </span>
                                <span className="ml-4 text-sm text-gray-500">
                                    Published: {book.publishYear}
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-blue-600 mb-6">
                                ${book.price}
                            </p>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Description
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {book.description}
                                </p>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Stock
                                </h3>
                                <p className="text-gray-700">
                                    {book.stock > 0 ? (
                                        <span className="text-green-600 font-medium">
                                            {book.stock} available
                                        </span>
                                    ) : (
                                        <span className="text-red-600 font-medium">
                                            Out of stock
                                        </span>
                                    )}
                                </p>
                            </div>

                            {book.stock > 0 && (
                                <div className="mb-6">
                                    <label
                                        htmlFor="quantity"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Quantity
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() =>
                                                setQuantity(
                                                    Math.max(1, quantity - 1)
                                                )
                                            }
                                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
                                        >
                                            -
                                        </button>
                                        <span className="text-lg font-medium">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                setQuantity(
                                                    Math.min(
                                                        book.stock,
                                                        quantity + 1
                                                    )
                                                )
                                            }
                                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex space-x-4">
                                <button
                                    onClick={addToCart}
                                    disabled={book.stock === 0}
                                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                                >
                                    {book.stock === 0
                                        ? "Out of Stock"
                                        : "Add to Cart"}
                                </button>
                                <Link
                                    to="/"
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;
