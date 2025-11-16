import express from "express";
import { Book } from "../models/bookModel.js";
import { Order } from "../models/orderModel.js";
import { Cart } from "../models/cartModel.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname +
                "-" +
                uniqueSuffix +
                path.extname(file.originalname)
        );
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(
            path.extname(file.originalname).toLowerCase()
        );
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"));
        }
    },
});

// Admin password middleware
const adminPassword = "admin123"; // You can move this to environment variables

const verifyAdminPassword = (req, res, next) => {
    const { password } = req.headers;
    if (password !== adminPassword) {
        return res.status(401).json({ message: "Unauthorized access" });
    }
    next();
};

// Apply password verification to all admin routes
router.use(verifyAdminPassword);

// Route for save a new book with image upload
router.post("/books", upload.single("image"), async (request, response) => {
    try {
        if (
            !request.body.title ||
            !request.body.author ||
            !request.body.publishYear ||
            !request.body.price ||
            !request.body.description ||
            !request.body.category
        ) {
            return response.status(400).send({
                message: "Send all required fields!",
            });
        }

        const stock = parseInt(request.body.stock) || 0;
        const newBook = {
            title: request.body.title,
            author: request.body.author,
            publishYear: request.body.publishYear,
            price: request.body.price,
            description: request.body.description,
            image: request.file ? `/uploads/${request.file.filename}` : "",
            category: request.body.category,
            stock: stock,
            isActive: stock > 0, // Auto-set inactive if stock is 0
        };

        const book = await Book.create(newBook);
        return response.status(201).send(book);
    } catch (error) {
        if (error instanceof multer.MulterError) {
            return response.status(400).json({ message: error.message });
        }
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Route for update a book with image upload
router.put("/books/:id", upload.single("image"), async (request, response) => {
    try {
        if (
            !request.body.title ||
            !request.body.author ||
            !request.body.publishYear ||
            !request.body.price ||
            !request.body.description ||
            !request.body.category
        ) {
            return response.status(400).send({
                message: "Send all required fields!",
            });
        }

        const { id } = request.params;
        const updateData = { ...request.body };

        // Convert stock to number
        if (updateData.stock !== undefined) {
            updateData.stock = parseInt(updateData.stock) || 0;
        }

        // Auto-set inactive if stock is 0
        if (updateData.stock === 0) {
            updateData.isActive = false;
        } else {
            // Handle isActive from form data
            if (updateData.isActive !== undefined) {
                updateData.isActive = updateData.isActive === "true" || updateData.isActive === true;
            }
        }

        // If a new image is uploaded, update the image path
        if (request.file) {
            updateData.image = `/uploads/${request.file.filename}`;
        }

        const result = await Book.findByIdAndUpdate(id, updateData);

        if (!result) {
            return response.status(404).json({ message: "Book not found!" });
        }
        return response
            .status(200)
            .json({ message: "Book updated successfully!" });
    } catch (error) {
        if (error instanceof multer.MulterError) {
            return response.status(400).json({ message: error.message });
        }
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Route for get all books from db
router.get("/books", async (request, response) => {
    try {
        const books = await Book.find({});
        return response.status(200).json({
            count: books.length,
            data: books,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Sales analytics endpoints
// Summary: totals, revenue, average order value, top books
router.get("/analytics/summary", async (req, res) => {
    try {
        const orders = await Order.find({ paymentStatus: { $in: ["paid", "completed"] } });

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

        // Top selling books
        const bookSalesMap = new Map();
        orders.forEach((o) => {
            (o.items || []).forEach((it) => {
                const key = String(it.book);
                const existing = bookSalesMap.get(key) || { quantity: 0, revenue: 0 };
                existing.quantity += it.quantity || 0;
                existing.revenue += (it.price || 0) * (it.quantity || 0);
                bookSalesMap.set(key, existing);
            });
        });

        const topBookIds = Array.from(bookSalesMap.entries())
            .sort((a, b) => b[1].quantity - a[1].quantity)
            .slice(0, 10)
            .map(([bookId, stats]) => ({ bookId, ...stats }));

        const books = await Book.find({ _id: { $in: topBookIds.map((b) => b.bookId) } });
        const idToBook = new Map(books.map((b) => [String(b._id), b]));
        const topBooks = topBookIds.map((b) => ({
            book: idToBook.get(b.bookId),
            quantity: b.quantity,
            revenue: b.revenue,
        }));

        return res.status(200).json({
            totalOrders,
            totalRevenue,
            averageOrderValue,
            topBooks,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});

// Revenue over time (daily for last 30 days)
router.get("/analytics/revenue", async (req, res) => {
    try {
        const since = new Date();
        since.setDate(since.getDate() - 30);
        const orders = await Order.find({
            createdAt: { $gte: since },
            paymentStatus: { $in: ["paid", "completed"] },
        }).sort({ createdAt: 1 });

        const byDay = {};
        orders.forEach((o) => {
            const day = new Date(o.createdAt).toISOString().slice(0, 10);
            byDay[day] = (byDay[day] || 0) + (o.totalAmount || 0);
        });

        const labels = [];
        const data = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            labels.push(key);
            data.push(byDay[key] || 0);
        }

        return res.status(200).json({ labels, data });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});

// Route for get books from db by id
router.get("/books/:id", async (request, response) => {
    try {
        const { id } = request.params;
        const book = await Book.findById(id);
        return response.status(200).json(book);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Route for delete a book
router.delete("/books/:id", async (request, response) => {
    try {
        const { id } = request.params;

        // First, remove this book from all user orders
        await Order.updateMany(
            { "items.book": id },
            { $pull: { items: { book: id } } }
        );

        // Also remove from all carts
        await Cart.updateMany(
            { "items.book": id },
            { $pull: { items: { book: id } } }
        );

        const result = await Book.findByIdAndDelete(id);

        if (!result) {
            return response.status(404).json({ message: "Book not found!" });
        }
        return response
            .status(200)
            .json({ message: "Book deleted successfully!" });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Get all pending orders
router.get("/orders/pending", async (request, response) => {
    try {
        const orders = await Order.find({ status: "pending" })
            .populate("user", "name email phone")
            .populate("items.book")
            .sort({ createdAt: -1 });

        console.log(`Found ${orders.length} pending orders`);
        return response.status(200).json(orders);
    } catch (error) {
        console.log("Error fetching pending orders:", error.message);
        response.status(500).send({ message: error.message });
    }
});

// Approve order (set to delivered)
router.put("/orders/:orderId/approve", async (request, response) => {
    try {
        const { orderId } = request.params;
        const order = await Order.findById(orderId).populate("items.book");

        if (!order) {
            return response.status(404).json({ message: "Order not found!" });
        }

        if (order.status !== "pending") {
            return response.status(400).json({
                message: "Only pending orders can be approved!",
            });
        }

        // Check stock availability before approving
        for (const item of order.items) {
            const book = item.book;
            if (book.stock < item.quantity) {
                return response.status(400).json({
                    message: `Insufficient stock for ${book.title}! Only ${book.stock} available.`,
                });
            }
        }

        // Update stock and auto-set inactive if stock becomes 0
        for (const item of order.items) {
            const book = await Book.findById(item.book._id);
            const newStock = book.stock - item.quantity;
            await Book.findByIdAndUpdate(item.book._id, {
                $inc: { stock: -item.quantity },
                isActive: newStock > 0 ? book.isActive : false, // Auto-set inactive if stock becomes 0
            });
        }

        // Update order status
        order.status = "delivered";
        order.paymentStatus = "paid";
        await order.save();

        return response.status(200).json({
            message: "Order approved successfully!",
            order,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Reject order
router.put("/orders/:orderId/reject", async (request, response) => {
    try {
        const { orderId } = request.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return response.status(404).json({ message: "Order not found!" });
        }

        if (order.status !== "pending") {
            return response.status(400).json({
                message: "Only pending orders can be rejected!",
            });
        }

        // Update order status to rejected
        order.status = "rejected";
        await order.save();

        return response.status(200).json({
            message: "Order rejected successfully!",
            order,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

export default router;
