import React, { useState, KeyboardEvent, useEffect } from "react";
import { updateProductAction } from "../Actions/Product";
import InventoryManager from "./InventoryManager";

interface InventoryItem {
  size: string;
  type: string;
  quantity: number;
}

interface ProductType {
  _id: string;
  name: string;
  description: string;
  price: number;
  countInStock: number;
  category: string;
  type: string[];
  size: string[];
  image: string[];
  inventory: InventoryItem[];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: () => void;
  product: ProductType;
}

const EditProductModal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  onProductUpdated, 
  product 
}) => {
  const [productName, setProductName] = useState(product.name);
  const [productDescription, setProductDescription] = useState(product.description);
  const [productPrice, setProductPrice] = useState(product.price.toString());
  const [category, setCategory] = useState(product.category);
  const [types, setTypes] = useState<string[]>(product.type || []);
  const [newType, setNewType] = useState("");
  const [sizes, setSizes] = useState<string[]>(product.size || []);
  const [newSize, setNewSize] = useState("");
  const [inventory, setInventory] = useState<InventoryItem[]>(product.inventory || []);
  const [existingImages, setExistingImages] = useState<string[]>(product.image || []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize inventory if not provided
  useEffect(() => {
    if (!product.inventory || product.inventory.length === 0) {
      const newInventory: InventoryItem[] = [];
      
      (product.size || []).forEach(size => {
        (product.type || []).forEach(type => {
          newInventory.push({ 
            size, 
            type, 
            quantity: 0 
          });
        });
      });
      
      setInventory(newInventory);
    } else {
      setInventory(product.inventory);
    }
  }, [product]);

  // Update inventory when sizes or types change
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

  // For new image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImgs: File[] = [];
      const newPreviews: string[] = [];
      
      Array.from(files).forEach(file => {
        newImgs.push(file);
        newPreviews.push(URL.createObjectURL(file));
      });

      setNewImages(prevImages => [...prevImages, ...newImgs]);
      setNewImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(prevImages => prevImages.filter((_, i) => i !== index));
    setNewImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prevImages => prevImages.filter((_, i) => i !== index));
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

    // Check if any inventory items exist
    if (inventory.length === 0) {
        setError("Inventory information is required");
        setLoading(false);
        return;
    }

    if (existingImages.length === 0 && newImages.length === 0) {
        setError("At least one image is required");
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
    
    // Extract image filenames from existing images
    existingImages.forEach((imgUrl) => {
      const filename = imgUrl.split('/').pop();
      if (filename) formData.append("existingImages", filename);
    });
    
    // Add new images
    newImages.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await updateProductAction(product._id, formData);
      
      if (response.success) {
        // Call onProductUpdated to trigger product list refresh in parent component
        onProductUpdated();
        // Note: we don't need to set loading=false here because the component will unmount
      } else {
        setError(response.message || "Failed to update product");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Error updating product:", error);
      setError(error.message || "Failed to update product");
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
            <h2 className="text-2xl font-bold mb-4">Edit Product</h2>

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

                  {/* Existing Image Previews */}
                  {existingImages.map((imgUrl, index) => (
                    <div key={`existing-${index}`} className="relative w-full h-32">
                      <img
                        src={imgUrl}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* New Image Previews */}
                  {newImagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative w-full h-32">
                      <img
                        src={preview}
                        alt={`New preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
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
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Product"}
              </button>
            </div>
          </form>
        </div>
      </div>  
    </>
  );
};

export default EditProductModal;
