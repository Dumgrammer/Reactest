import React, { useState, useEffect } from "react";
import { updateProductAction } from "../Actions/Product";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: () => void;
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    countInStock: number;
    image: string[];
    category: string;
    type: string[];
    size: string[];
    rating: number;
    numReview: number;
  };
}

const EditProductModal: React.FC<EditModalProps> = ({ isOpen, onClose, onProductUpdated, product }) => {
  const [productName, setProductName] = useState(product.name);
  const [productDescription, setProductDescription] = useState(product.description);
  const [productPrice, setProductPrice] = useState(product.price.toString());
  const [countInStock, setCountInStock] = useState(product.countInStock.toString());
  const [category, setCategory] = useState(product.category);
  const [types, setTypes] = useState<string[]>(Array.isArray(product.type) ? product.type : []);
  const [newType, setNewType] = useState("");
  const [sizes, setSizes] = useState<string[]>(Array.isArray(product.size) ? product.size : []);
  const [newSize, setNewSize] = useState("");
  const [images, setImages] = useState<string[]>(Array.isArray(product.image) ? product.image : []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [rating, setRating] = useState(product.rating.toString());
  const [numReview, setNumReview] = useState(product.numReview.toString());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProductName(product.name);
    setProductDescription(product.description);
    setProductPrice(product.price.toString());
    setCountInStock(product.countInStock.toString());
    setCategory(product.category);
    setTypes(Array.isArray(product.type) ? product.type : []);
    setSizes(Array.isArray(product.size) ? product.size : []);
    setImages(Array.isArray(product.image) ? product.image : []);
    setRating(product.rating.toString());
    setNumReview(product.numReview.toString());
    setNewImages([]);
    setError("");
  }, [product]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!category) {
      setError("Please select a category");
      setLoading(false);
      return;
    }

    if (types.length === 0) {
      setError("Please add at least one type");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("description", productDescription);
    formData.append("price", productPrice);
    formData.append("countInStock", countInStock);
    formData.append("category", category);
    types.forEach(type => formData.append("type", type));
    sizes.forEach(size => formData.append("size", size));
    formData.append("rating", rating);
    formData.append("numReview", numReview);

    // Append existing images
    images.forEach((image) => {
      const imageUrl = new URL(image);
      const imageName = imageUrl.pathname.split('/').pop();
      if (imageName) {
        formData.append("existingImages", imageName);
      }
    });

    // Append new images
    newImages.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await updateProductAction(product._id, formData);
      if (response.success) {
        onProductUpdated();
        onClose();
      } else {
        setError(response.message || "Failed to update product");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred while updating the product");
    } finally {
      setLoading(false);
    }
  };

  const handleNewImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleAddType = () => {
    if (newType.trim() && !types.includes(newType.trim())) {
      setTypes([...types, newType.trim()]);
      setNewType("");
    }
  };

  const handleRemoveType = (typeToRemove: string) => {
    setTypes(types.filter(type => type !== typeToRemove));
  };

  const handleAddSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      setSizes([...sizes, newSize.trim()]);
      setNewSize("");
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setSizes(sizes.filter(size => size !== sizeToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg p-8 z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Images */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Images</label>
              <div className="grid grid-cols-3 gap-4">
                {/* Add Image Button */}
                <label className="cursor-pointer relative block w-full h-32 bg-gray-50 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-100 transition-colors">
                  <input
                    type="file"
                    onChange={handleNewImagesChange}
                    accept="image/*"
                    multiple
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

                {/* Current Images */}
                {images.map((image, index) => (
                  <div key={index} className="relative w-full h-32">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
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
                  <option value="Food">Clothing</option>
                  <option value="Beverages">Books</option>
                  <option value="Snacks">Footwear</option>
                  <option value="Desserts">Accessories</option>
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
                        onClick={() => handleRemoveType(type)}
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

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    value={countInStock}
                    onChange={(e) => setCountInStock(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
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
                        onClick={() => handleRemoveSize(size)}
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
