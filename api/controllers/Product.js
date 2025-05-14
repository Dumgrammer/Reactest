const Product = require('../models/Product');
const Logs = require('../models/Logs');
const send = require('../utils/Response');

exports.getProduct = async (req, res) => {
    try {
        // Only get products that are not archived (isNotArchived=1)
        const products = await Product.find({ isNotArchived: 1 });

        const updatedProducts = products.map(product => {
            // Calculate total stock from inventory
            const totalStock = product.inventory.reduce((sum, item) => sum + item.quantity, 0);
            
            const updatedImages = product.image.map(img => {
                if (!img.startsWith("http")) {
                    return `${req.protocol}://${req.get("host")}/${img.replace(/\\/g, "/")}`;
                }
                return img;
            });
            return { 
                ...product.toObject(), 
                image: updatedImages,
                countInStock: totalStock // Update countInStock to match inventory total
            };
        });

        return send.sendResponse(res, 200, updatedProducts, "Products found!");
    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};

exports.getArchiveProduct = async (req, res) => {
    try {
        // Only get products that are not archived (isNotArchived=1)
        const products = await Product.find({ isNotArchived: 0 });

        const updatedProducts = products.map(product => {
            const updatedImages = product.image.map(img => {
                if (!img.startsWith("http")) {
                    return `${req.protocol}://${req.get("host")}/${img.replace(/\\/g, "/")}`;
                }
                return img;
            });
            return { ...product.toObject(), image: updatedImages };
        });

        return send.sendResponse(res, 200, updatedProducts, "Products found!");
    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};

exports.searchProduct = async (req, res) => {
    try {
        const { name, category } = req.query;
        
        // Build search query
        let searchQuery = { isNotArchived: 1 }; // Only non-archived products
        
        // Search by name (case insensitive)
        if (name) {
            searchQuery.name = { $regex: name, $options: 'i' };
        }
        
        // Filter by category if provided
        if (category) {
            searchQuery.category = category;
        }
        
        // Execute search
        const products = await Product.find(searchQuery);

        const updatedProducts = products.map(product => {
            const updatedImages = product.image.map(img => {
                if (!img.startsWith("http")) {
                    return `${req.protocol}://${req.get("host")}/${img.replace(/\\/g, "/")}`;
                }
                return img;
            });
            return { ...product.toObject(), image: updatedImages };
        });

        return send.sendResponse(res, 200, updatedProducts, "Products found!");
    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};

exports.getSpecificProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findOne({ _id: id, isNotArchived: 1 });

        if (!product) {
            return send.sendNotFoundResponse(res, "Product Not Found!");
        }

        // Ensure local images are formatted correctly
        const updatedImages = product.image.map(img => {
            if (!img.startsWith("http")) {
                return `${req.protocol}://${req.get("host")}/${img.replace(/\\/g, "/")}`;
            }
            return img;
        });

        const updatedProduct = { ...product.toObject(), image: updatedImages };
        return send.sendResponse(res, 200, updatedProduct, "Product found!");
    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, description, type, rating, numReview, price, category, inventory, userId, userInfo } = req.body;

        if (!userId) {
            console.error("Authentication error: No userId provided");
            return send.sendResponse(res, 401, null, "Authentication required");
        }

        // Check for images
        if (!req.files || req.files.length === 0) {
            return send.sendResponse(res, 400, null, "At least one image is required!");
        }

        // Handle arrays for type and size
        const types = Array.isArray(type) ? type : [type];
        const sizes = Array.isArray(req.body.size) ? req.body.size : [req.body.size];

        if (!types || types.length === 0) {
            return send.sendResponse(res, 400, null, "At least one type is required!");
        }

        if (!sizes || sizes.length === 0) {
            return send.sendResponse(res, 400, null, "At least one size is required!");
        }

        if (!category) {
            return send.sendResponse(res, 400, null, "Category is required!");
        }

        // Process image paths
        const imagePaths = req.files.map(file => file.path.replace(/\\/g, "/"));

        // Parse inventory data if provided
        let inventoryItems = [];
        if (inventory) {
            try {
                inventoryItems = JSON.parse(inventory);
            } catch (error) {
                console.error("Error parsing inventory data:", error);
                return send.sendResponse(res, 400, null, "Invalid inventory data format");
            }
        } else {
            // Create default inventory with quantity 0 for each size/type combination
            sizes.forEach(size => {
                types.forEach(type => {
                    inventoryItems.push({ size, type, quantity: 0 });
                });
            });
        }

        // Calculate total stock
        const totalStock = inventoryItems.reduce((sum, item) => sum + parseInt(item.quantity), 0);

        const product = new Product({
            name,
            image: imagePaths,
            description,
            category,
            size: sizes,
            type: types,
            rating: Number(rating) || 0,
            numReview: Number(numReview) || 0,
            price: Number(price) || 0,
            inventory: inventoryItems,
            countInStock: totalStock, // Set countInStock to total for backward compatibility
            isNotArchived: 1 // Set as active by default
        });

        const newProduct = await product.save();
        
        // Create log entry for product creation
        try {
            const userData = JSON.parse(userInfo || '{}').data || {};

            const logData = {
                user: userId,
                action: 'create',
                reason: 'New product created',
                productId: newProduct._id,  
                userDetails: {
                    fullName: userData.name,
                    email: userData.email
                }
            };

            console.log("Creating log with data:", logData);
            const log = new Logs(logData);
            const savedLog = await log.save();
            console.log("Log created successfully:", savedLog);
        } catch (logError) {
            console.error("Error creating product log:", logError);
        }
        
        // Format the response to include full image URLs
        const formattedProduct = {
            ...newProduct.toObject(),
            image: newProduct.image.map(img => 
                `${req.protocol}://${req.get("host")}/${img}`
            )
        };

        return send.sendResponse(res, 201, formattedProduct, "Product created successfully!");

    } catch (error) {
        console.error("Product creation error:", error);
        return send.sendISEResponse(res, error);
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const existingProduct = await Product.findById(id);
        
        if (!existingProduct) {
            return send.sendNotFoundResponse(res, "Product not found!");
        }

        // Get the basic fields
        const { name, description, type, rating, numReview, price, category, inventory, userId } = req.body;
        
        // Handle arrays for type and size
        const types = Array.isArray(type) ? type : [type];
        const sizes = Array.isArray(req.body.size) ? req.body.size : [req.body.size];

        // Handle existing images
        let updatedImages = [];
        if (req.body.existingImages) {
            const existingImages = Array.isArray(req.body.existingImages) 
                ? req.body.existingImages 
                : [req.body.existingImages];
            updatedImages = existingImages.map(img => `uploads/${img}`);
        }

        // Add new uploaded images if any
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            updatedImages = [...updatedImages, ...newImages];
        }

        // If no images were provided, keep the existing ones
        if (updatedImages.length === 0) {
            updatedImages = existingProduct.image;
        }

        // Parse inventory data if provided
        let inventoryItems = existingProduct.inventory || [];
        if (inventory) {
            try {
                inventoryItems = JSON.parse(inventory);
            } catch (error) {
                console.error("Error parsing inventory data:", error);
                return send.sendResponse(res, 400, null, "Invalid inventory data format");
            }
        } else {
            // Create default inventory with quantity 0 for each size/type combination
            inventoryItems = [];
            sizes.forEach(size => {
                types.forEach(type => {
                    // Try to find existing inventory for this size/type
                    const existingInventory = existingProduct.inventory?.find(
                        item => item.size === size && item.type === type
                    );
                    
                    inventoryItems.push({ 
                        size, 
                        type, 
                        quantity: existingInventory ? existingInventory.quantity : 0 
                    });
                });
            });
        }

        // Calculate total stock from inventory
        const totalStock = inventoryItems.reduce((sum, item) => sum + parseInt(item.quantity), 0);

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                name,
                description,
                type: types,
                rating: Number(rating) || 5,
                numReview: Number(numReview) || 50,
                price: Number(price),
                category,
                size: sizes,
                image: updatedImages,
                inventory: inventoryItems,
                countInStock: totalStock // Update countInStock to match inventory total
            },
            { new: true }
        );

        // Create log entry for update
        try {
            const userInfo = JSON.parse(req.body.userInfo || '{}');
            const userData = userInfo.data || {};

            const logData = {
                user: userId,
                action: 'update',
                reason: 'Product updated',
                productId: id,
                userDetails: {
                    fullName: userData.name,
                    email: userData.email
                }
            };

            const log = new Logs(logData);
            await log.save();
        } catch (logError) {
            console.error("Error creating update log:", logError);
        }

        // Format image URLs in the response
        const formattedProduct = {
            ...updatedProduct.toObject(),
            image: updatedProduct.image.map(img => 
                `${req.protocol}://${req.get("host")}/${img.replace(/\\/g, "/")}`
            )
        };

        return send.sendResponse(res, 200, formattedProduct, "Product has been updated successfully!");

    } catch (error) {
        console.error("Product update error:", error);
        return send.sendISEResponse(res, error);
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const { reason, userId } = req.body;

        if (!reason) {
            return send.sendResponse(res, 400, null, "Reason is required for archiving a product");
        }

        if (!userId) {
            console.error("Authentication error: No userId provided");
            return send.sendResponse(res, 401, null, "Authentication required");
        }

        const existingProduct = await Product.findById(id);
        
        if (!existingProduct) {
            return send.sendNotFoundResponse(res, "Product not found!");
        }

        // Update isNotArchived to 0 instead of deleting
        const archivedProduct = await Product.findByIdAndUpdate(
            id,
            { isNotArchived: 0 },
            { new: true }
        );

        if (!archivedProduct) {
            return send.sendResponse(res, 500, null, "Failed to archive product");
        }

        try {
            // Get user details from the request body
            const userInfo = JSON.parse(req.body.userInfo || '{}');
            const userData = userInfo.data || {};

            console.log("This is the user data", userData);

            // Create log entry with user details
            const logData = {
                user: userId,
                action: 'archive',
                reason: reason,
                productId: id,
                userDetails: {
                    fullName: userData.name,
                    email: userData.email
                }
            };

            console.log("Creating log with data:", logData);

            const log = new Logs(logData);
            const savedLog = await log.save();
            console.log("Log created successfully:", savedLog);
        } catch (logError) {
            console.error("Error creating log:", logError);
            // Continue with the response even if logging fails
        }

        return send.sendResponse(res, 200, archivedProduct, "Product archived successfully!");

    } catch (error) {
        console.error("Error in deleteProduct:", error);
        return send.sendISEResponse(res, error);
    }
};

exports.restoreProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const { userId, reason } = req.body;

        if (!userId) {
            console.error("Authentication error: No userId provided");
            return send.sendResponse(res, 401, null, "Authentication required");
        }

        if (!reason) {
            return send.sendResponse(res, 400, null, "Reason is required for restoring a product");
        }

        const existingProduct = await Product.findById(id);
        
        if (!existingProduct) {
            return send.sendNotFoundResponse(res, "Product not found!");
        }

        // Update isNotArchived to 1
        const restoredProduct = await Product.findByIdAndUpdate(
            id,
            { isNotArchived: 1 },
            { new: true }
        );

        // Create log entry for restore
        try {
            const userInfo = JSON.parse(req.body.userInfo || '{}');
            const userData = userInfo.data || {};

            const logData = {
                user: userId,
                action: 'restore',
                reason: reason,
                productId: id,
                userDetails: {
                    fullName: userData.name,
                    email: userData.email
                }
            };

            const log = new Logs(logData);
            await log.save();
        } catch (logError) {
            console.error("Error creating restore log:", logError);
        }

        return send.sendResponse(res, 200, restoredProduct, "Product restored successfully!");

    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};

exports.getStocksTotal = async (req, res) => {
    try {
        const stocks = await Product.find({});
        const totalStocks = stocks.reduce((sum, product) => sum + (product.countInStock || 0), 0);
        return send.sendResponse(res, 200, { totalStocks }, "Total number of stocks retrieved successfully");
    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};