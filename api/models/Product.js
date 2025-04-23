const mongoose = require("mongoose");

// const reviewSchema = mongoose.Schema({
//     name: { type: String, required: true },
//     rating: { type: String, required: true },
//     comment: { type: String, required: true },
//     user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }
// })

// Define inventory schema for size/type combinations
const inventoryItemSchema = mongoose.Schema({
    size: { type: String, required: true },
    type: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 }
});

const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    image: [{ type: String, required: true }],
    description: { type: String, required: true },
    category: { type: String, required: true },
    size: [{ type: String, required: true }],
    type: [{ type: String, required: true }],
    rating: { type: Number, required: true, default: 0 },
    numReview: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    inventory: [inventoryItemSchema],
    countInStock: { type: Number, required: true, default: 0 },
    isNotArchived: {type: Boolean, default: 1} 
    //0 means archived
    // Keep for backward compatibility
}, { timestamps: true });

// Add a virtual to calculate total stock across all inventory items
productSchema.virtual('totalStock').get(function() {
    if (!this.inventory || this.inventory.length === 0) {
        return this.countInStock;
    }
    return this.inventory.reduce((total, item) => total + item.quantity, 0);
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model("Product", productSchema);
// const Review = mongoose.model("Review", reviewSchema);

module.exports = Product;