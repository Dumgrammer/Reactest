import React, { useState, KeyboardEvent, useEffect } from "react";
import { addProductAction } from "../Actions/Product";
import InventoryManager from "./InventoryManager";

interface InventoryItem {
  size: string;
  type: string;
  quantity: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

const AddProductModal: React.FC<ModalProps> = ({ isOpen, onClose, onProductAdded }) => {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [category, setCategory] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [newType, setNewType] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSize, setNewSize] = useState("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [rating] = useState("5");
  const [numReview] = useState("0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Create default inventory items when sizes or types change
  useEffect(() => {
    if (sizes.length > 0 && types.length > 0) {
      const newInventory: InventoryItem[] = [];
      sizes.forEach(size => {
        types.forEach(type => {
          // Check if this combination already exists
          const existingItem = inventory.find(item => item.size === size && item.type === type);
          if (existingItem) {
            newInventory.push(existingItem);
          } else {
            newInventory.push({ size, type, quantity: 0 });
          }
        });
      });
      setInventory(newInventory);
    }
  }, [sizes, types]);

  const resetForm = () => {
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setCategory("");
    setTypes([]);
    setNewType("");
    setSizes([]);
    setNewSize("");
    setInventory([]);
    setImages([]);
    setImagePreviews([]);
    setError("");
  };

  // For Image Preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: File[] = [];
      const newPreviews: string[] = [];
      
      Array.from(files).forEach(file => {
        newImages.push(file);
        newPreviews.push(URL.createObjectURL(file));
      });

      setImages(prevImages => [...prevImages, ...newImages]);
      setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  // Handle types
  const handleAddType = () => {
    if (newType.trim() && !types.includes(newType.trim())) {
      setTypes([...types, newType.trim()]);
      setNewType("");
    }
  };

  const handleTypeKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddType();
    }
  };

  const removeType = (typeToRemove: string) => {
    setTypes(types.filter(type => type !== typeToRemove));
    // Remove inventory items with this type
    setInventory(inventory.filter(item => item.type !== typeToRemove));
  };

  // Handle sizes
  const handleAddSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      setSizes([...sizes, newSize.trim()]);
      setNewSize("");
    }
  };

  const handleSizeKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSize();
    }
  };

  const removeSize = (sizeToRemove: string) => {
    setSizes(sizes.filter(size => size !== sizeToRemove));
    // Remove inventory items with this size
    setInventory(inventory.filter(item => item.size !== sizeToRemove));
  };

  const handleInventoryChange = (updatedInventory: InventoryItem[]) => {
    setInventory(updatedInventory);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    // Validate required fields
    if (!productName.trim()) {
        setError("Product name is required");
        setLoading(false);
        return;
    }

    if (!productDescription.trim()) {
        setError("Product description is required");
        setLoading(false);
        return;
    }

    if (!category) {
        setError("Category is required");
        setLoading(false);
        return;
    }

    if (types.length === 0) {
        setError("At least one type is required");
        setLoading(false);
        return;
    }

    if (sizes.length === 0) {
        setError("At least one size is required");
        setLoading(false);
        return;
    }

    if (!productPrice || Number(productPrice) <= 0) {
        setError("Valid price is required");
        setLoading(false);
        return;
    }

    if (images.length === 0) {
        setError("At least one image is required");
        setLoading(false);
        return;
    }

    // Check if any inventory items exist
    if (inventory.length === 0) {
        setError("Inventory information is required");
        setLoading(false);
        return;
    }

    // Calculate total stock
    const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0);

    const formData = new FormData();
    formData.append("name", productName.trim());
    formData.append("description", productDescription.trim());
    formData.append("price", productPrice);
    formData.append("category", category);
    types.forEach(type => formData.append("type", type.trim()));
    sizes.forEach(size => formData.append("size", size.trim()));
    
    // Add inventory data as JSON
    formData.append("inventory", JSON.stringify(inventory));
    
    // Keep countInStock for backward compatibility
    formData.append("countInStock", totalStock.toString());
    
    formData.append("rating", rating);
    formData.append("numReview", numReview);
    
    // Append each image with the correct field name 'images'
    images.forEach((image) => {
        formData.append("images", image);
    });

    try {
        const response = await addProductAction(formData);
        
        if (response.success) {
            // First reset the form so the user sees it reset
            resetForm();
            // Then call onProductAdded to refresh the product list
            try {
                await onProductAdded();
                // The modal will be closed by ProductsList component
            } catch (error) {
                console.error("Error in onProductAdded:", error);
                setError("Product added successfully but couldn't refresh the list. Please reload the page.");
                setLoading(false);
            }

            onClose();

        } else {
            setError(response.message || "Failed to add product");
            setLoading(false);
        }
    } catch (error: any) {
        console.error("Error adding product:", error);
        setError(error.message || "Failed to add product");
        setLoading(false);
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
        <div className="bg-white rounded-lg shadow-lg p-8 z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Add Product</h2>

            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Images */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Images</label>
                <div className="grid grid-cols-3 gap-4">
                  {/* Add Image Button */}
                  <label className="cursor-pointer relative block w-full h-32 bg-gray-50 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-100 transition-colors">
                    <input
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      multiple
                      required={images.length === 0}
                      className="hidden"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <svg 
                          className="mx-auto h-12 w-12 text-gray-400" 
                          stroke="currentColor" 
                          fill="none" 
                          viewBox="0 0 48 48" 
                          aria-hidden="true"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M24 12v24m12-12H12" 
                          />
                        </svg>
                        <span className="mt-2 block text-sm font-medium text-gray-500">
                          Add Images
                        </span>
                      </div>
                    </div>
                  </label>

                  {/* Image Previews */}
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-full h-32">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Books">Books</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Types</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {types.map((type, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                      >
                        {type}
                        <button
                          type="button"
                          onClick={() => removeType(type)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex mt-2">
                    <input
                      type="text"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      onKeyPress={handleTypeKeyPress}
                      className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Add type"
                    />
                    <button
                      type="button"
                      onClick={handleAddType}
                      className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sizes</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sizes.map((size, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex mt-2">
                    <input
                      type="text"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      onKeyPress={handleSizeKeyPress}
                      className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Add size"
                    />
                    <button
                      type="button"
                      onClick={handleAddSize}
                      className="bg-green-500 text-white px-4 rounded-r-md hover:bg-green-600"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Manager */}
            {sizes.length > 0 && types.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <InventoryManager 
                  sizes={sizes}
                  types={types}
                  inventory={inventory}
                  onChange={handleInventoryChange}
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>  
    </>
  );
};

export default AddProductModal;
