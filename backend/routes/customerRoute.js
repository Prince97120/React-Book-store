import express from "express";
import { Book } from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import { Cart } from "../models/cartModel.js";
import { Order } from "../models/orderModel.js";

const router = express.Router();

// Get all active books for customers
router.get("/books", async (request, response) => {
    try {
        const books = await Book.find({ isActive: true });
        return response.status(200).json({
            count: books.length,
            data: books,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Get book by id for customers
router.get("/books/:id", async (request, response) => {
    try {
        const { id } = request.params;
        const book = await Book.findById(id);

        if (!book || !book.isActive) {
            return response.status(404).json({ message: "Book not found!" });
        }

        return response.status(200).json(book);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Search books
router.get("/search", async (request, response) => {
    try {
        const { q, category } = request.query;
        let query = { isActive: true };

        if (q) {
            query.$or = [
                { title: { $regex: q, $options: "i" } },
                { author: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
            ];
        }

        if (category) {
            query.category = category;
        }

        const books = await Book.find(query);
        return response.status(200).json({
            count: books.length,
            data: books,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// User registration
router.post("/register", async (request, response) => {
    try {
        const { name, email, password, phone } = request.body;

        if (!name || !email || !password || !phone) {
            return response.status(400).json({
                message: "All fields are required!",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return response.status(400).json({
                message: "User already exists!",
            });
        }

        const newUser = await User.create({
            name,
            email,
            password, // In production, hash this password
            phone,
        });

        return response.status(201).json({
            message: "User created successfully!",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
            },
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// User login
router.post("/login", async (request, response) => {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({
                message: "Email and password are required!",
            });
        }

        const user = await User.findOne({ email, password }); // In production, compare hashed password
        if (!user) {
            return response.status(401).json({
                message: "Invalid credentials!",
            });
        }

        return response.status(200).json({
            message: "Login successful!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Add to cart
router.post("/cart/add", async (request, response) => {
    try {
        const { userId, bookId, quantity } = request.body;

        if (!userId || !bookId || !quantity) {
            return response.status(400).json({
                message: "All fields are required!",
            });
        }

        // Check if book exists and is active
        const book = await Book.findById(bookId);
        if (!book || !book.isActive) {
            return response.status(404).json({ message: "Book not found!" });
        }

        // Check stock availability
        if (book.stock < quantity) {
            return response
                .status(400)
                .json({ message: "Insufficient stock!" });
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        // Check if book already in cart
        const existingItem = cart.items.find(
            (item) => item.book.toString() === bookId
        );
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ book: bookId, quantity });
        }

        await cart.save();

        return response.status(200).json({
            message: "Item added to cart successfully!",
            cart,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Get cart
router.get("/cart/:userId", async (request, response) => {
    try {
        const { userId } = request.params;
        const cart = await Cart.findOne({ user: userId }).populate(
            "items.book"
        );

        if (!cart) {
            return response.status(200).json({ items: [] });
        }

        return response.status(200).json(cart);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Update cart item quantity
router.put("/cart/update", async (request, response) => {
    try {
        const { userId, bookId, quantity } = request.body;

        const cart = await Cart.findOne({ user: userId }).populate(
            "items.book"
        );
        if (!cart) {
            return response.status(404).json({ message: "Cart not found!" });
        }

        const item = cart.items.find(
            (item) => item.book._id.toString() === bookId
        );
        if (!item) {
            return response
                .status(404)
                .json({ message: "Item not found in cart!" });
        }

        // Check stock availability
        if (quantity > item.book.stock) {
            return response.status(400).json({
                message: `Only ${item.book.stock} items available in stock!`,
            });
        }

        if (quantity <= 0) {
            cart.items = cart.items.filter(
                (item) => item.book._id.toString() !== bookId
            );
        } else {
            item.quantity = quantity;
        }

        await cart.save();

        return response.status(200).json({
            message: "Cart updated successfully!",
            cart,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Remove from cart
router.delete("/cart/remove", async (request, response) => {
    try {
        const { userId, bookId } = request.body;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return response.status(404).json({ message: "Cart not found!" });
        }

        cart.items = cart.items.filter(
            (item) => item.book.toString() !== bookId
        );
        await cart.save();

        return response.status(200).json({
            message: "Item removed from cart successfully!",
            cart,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Place order
router.post("/order", async (request, response) => {
    try {
        const { userId, shippingAddress } = request.body;

        if (!userId || !shippingAddress) {
            return response.status(400).json({
                message: "User ID and shipping address are required!",
            });
        }

        // Get cart
        const cart = await Cart.findOne({ user: userId }).populate(
            "items.book"
        );
        if (!cart || cart.items.length === 0) {
            return response.status(400).json({ message: "Cart is empty!" });
        }

        // Calculate total and check stock
        let totalAmount = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const book = item.book;
            if (book.stock < item.quantity) {
                return response.status(400).json({
                    message: `Insufficient stock for ${book.title}!`,
                });
            }

            totalAmount += book.price * item.quantity;
            orderItems.push({
                book: book._id,
                quantity: item.quantity,
                price: book.price,
            });
        }

        // Create order with pending status - use new Order() to ensure explicit status
        const newOrder = new Order({
            user: userId,
            items: orderItems,
            totalAmount,
            shippingAddress: shippingAddress,
            status: "pending", // CRITICAL: Order starts as pending, admin will approve/reject
            paymentMethod: "cod",
            paymentStatus: "pending", // Payment pending until order is approved
        });

        // Explicitly ensure status is pending before saving
        newOrder.status = "pending";
        newOrder.paymentStatus = "pending";

        // Save the order
        const savedOrder = await newOrder.save();

        // CRITICAL: Force update status to pending directly in database
        // This ensures status is definitely "pending" regardless of any defaults or hooks
        await Order.updateOne(
            { _id: savedOrder._id },
            { 
                $set: { 
                    status: "pending",
                    paymentStatus: "pending"
                }
            }
        );

        // Verify order was saved with pending status by querying database
        const verifyOrder = await Order.findById(savedOrder._id);
        console.log("=== ORDER CREATION DEBUG ===");
        console.log("Order ID:", savedOrder._id);
        console.log("Order status after save:", savedOrder.status);
        console.log("Order status from DB (after force update):", verifyOrder.status);
        console.log("Order payment status:", verifyOrder.paymentStatus);
        console.log("============================");

        if (verifyOrder.status !== "pending") {
            console.error("CRITICAL ERROR: Order status is still not pending after force update!");
            console.error("Current status:", verifyOrder.status);
            return response.status(500).json({
                message: "Failed to create order with pending status. Please try again.",
            });
        }

        // Don't update stock yet - wait for admin approval
        // Stock will be updated when admin approves the order

        // Clear cart
        cart.items = [];
        await cart.save();

        // Return order with populated data - query fresh from DB
        const createdOrder = await Order.findById(savedOrder._id)
            .populate("items.book")
            .populate("user", "name email");

        // Double-check status in response - if still not pending, log error
        if (createdOrder.status !== "pending") {
            console.error("CRITICAL WARNING: Order status is not pending in response!");
            console.error("Order ID:", createdOrder._id);
            console.error("Status found:", createdOrder.status);
            console.error("Expected: pending");
            // Force one more time before returning
            await Order.findByIdAndUpdate(createdOrder._id, { 
                status: "pending", 
                paymentStatus: "pending" 
            });
            // Re-fetch
            const fixedOrder = await Order.findById(createdOrder._id)
                .populate("items.book")
                .populate("user", "name email");
            createdOrder.status = fixedOrder.status;
            createdOrder.paymentStatus = fixedOrder.paymentStatus;
        }

        console.log("Final order status being returned:", createdOrder.status);

        return response.status(201).json({
            message: "Order placed successfully! Waiting for admin approval.",
            order: createdOrder,
        });
    } catch (error) {
        console.error("=== ORDER CREATION ERROR ===");
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        console.error("============================");
        response.status(500).json({ 
            message: error.message || "Error creating order"
        });
    }
});

// Get user orders
router.get("/orders/:userId", async (request, response) => {
    try {
        const { userId } = request.params;
        const orders = await Order.find({ user: userId })
            .populate("items.book")
            .sort({ createdAt: -1 });

        return response.status(200).json(orders);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Get single order by id (for billing/invoice)
router.get("/order/:orderId", async (request, response) => {
    try {
        const { orderId } = request.params;
        const order = await Order.findById(orderId)
            .populate("items.book")
            .populate("user");

        if (!order) {
            return response.status(404).json({ message: "Order not found" });
        }

        return response.status(200).json(order);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Save user address
router.put("/user/:userId/address", async (request, response) => {
    try {
        const { userId } = request.params;
        const { address } = request.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { address },
            { new: true }
        );

        if (!user) {
            return response.status(404).json({ message: "User not found!" });
        }

        return response.status(200).json({
            message: "Address saved successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
            },
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Get user profile with address
router.get("/user/:userId", async (request, response) => {
    try {
        const { userId } = request.params;
        const user = await User.findById(userId);

        if (!user) {
            return response.status(404).json({ message: "User not found!" });
        }

        return response.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

export default router;
