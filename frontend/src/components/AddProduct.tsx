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
  const [rating] = useState("5");
  const [numReview] = useState("0");

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
      <div className="bg-white rounded-lg shadow-lg p-8 z-10 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Add Product</h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <input type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} required />
          <textarea placeholder="Description" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required />
          <input type="number" placeholder="Price" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} required />
          <input type="number" placeholder="Stock" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required />
          <input type="file" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} accept="image/*" required />
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Add Product</button>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
