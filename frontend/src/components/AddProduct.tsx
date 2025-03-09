import React, { useState } from "react";
import { addProductAction } from "../Actions/Product";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

const AddProductModal: React.FC<ModalProps> = ({ isOpen, onClose, onProductAdded }) => {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [countInStock, setCountInStock] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rating] = useState("5");
  const [numReview] = useState("0");

  // For Image Preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setImage(file);

    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("description", productDescription);
    formData.append("price", productPrice);
    formData.append("countInStock", countInStock);
    formData.append("rating", rating);
    formData.append("numReview", numReview);
    if (image) {
      formData.append("image", image);
    }

    try {
      await addProductAction(formData);
      onProductAdded();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg p-8 z-10 w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-row w-full"> 
        {/* Left */}
        <div className="flex flex-col-reverse px-4 w-1/2">
        <input type="file" onChange={handleImageChange} accept="image/*" required />
          {imagePreview && (
            <img src={imagePreview} alt="Image Preview" className="m-auto h-[30vmin]"/>
          )}
        </div>
        {/* Right */}
        <div className="grid gap-4 w-full">
        <h2 className="text-2xl font-bold mb-2 text-start">Add Product</h2>
          <input className="rounded-lg border-none bg-neutral-100 text-sm/6 focus:border-gray-800 focus:ring-gray-500" type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} required />
          <textarea className="resize-none rounded-lg border-none bg-neutral-100 text-sm/6 focus:border-gray-800 focus:ring-gray-500" placeholder="Description" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required />
          <input className="rounded-lg border-none bg-neutral-100 text-sm/6 focus:border-gray-800 focus:ring-gray-500" type="number" placeholder="Price" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} required />
          <input className="rounded-lg border-none bg-neutral-100 text-sm/6 focus:border-gray-800 focus:ring-gray-500" type="number" placeholder="Stock" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required />
          <div className="flex justify-end">
          <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md w-1/2">Add Product</button>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
