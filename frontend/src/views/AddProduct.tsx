import React, { useState } from 'react';
import { addProductAction } from '../Actions/Product';

interface AddProductProps {
  onClose: () => void;
  onProductAdded: () => void;
}

const AddProduct: React.FC<AddProductProps> = ({ onClose, onProductAdded }) => {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [type, setType] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [rating, setRating] = useState('5');
  const [numReview, setNumReview] = useState('0');
  const [categories, setCategories] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (categories.length === 0) {
      setError("Please add at least one category");
      setLoading(false);
      return;
    }

    if (sizes.length === 0) {
      setError("Please add at least one size");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("description", productDescription);
    formData.append("price", productPrice);
    formData.append("type", type);
    formData.append("countInStock", countInStock);
    formData.append("rating", rating);
    formData.append("numReview", numReview);
    
    // Correctly append categories and sizes
    categories.forEach(category => {
      formData.append("category", category);
    });
    
    sizes.forEach(size => {
      formData.append("size", size);
    });
    
    // Correctly append images
    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await addProductAction(formData);
      if (response) {
        onProductAdded();
        onClose();
      }
    } catch (error: any) {
      setError(error.message || "Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Render your form here */}
    </div>
  );
};

export default AddProduct; 