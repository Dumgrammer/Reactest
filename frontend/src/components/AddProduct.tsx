import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../Redux/Store";
import { productListAction } from "../Redux/Actions/Product";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddProductModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {

  const dispatch = useDispatch<AppDispatch>();
  const productListReducer = useSelector((state: any) => state.productListReducer);
  const { loading, error, products = [], page, totalPages } = productListReducer;

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [countInStock, setCountInStock] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [rating, setRating] = useState("5");
  const [numReview, setNumReview] = useState("0");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Submit button clicked");

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
      const { data } = await axios.post("http://localhost:8080/api/products/createproduct", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });      
      dispatch(productListAction())
      console.log("Product created:", data);
      onClose();
    } catch (error) {
      console.error("Failed to add product:", error);
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
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add Product</button>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
