import React from 'react';

// Define the props interface
interface ModalProps {
    isOpen: boolean; // isOpen should be a boolean
    onClose: () => void; // onClose should be a function that returns void
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Handle form submission logic here
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg p-8 z-10 transform transition-transform duration-300 scale-100 w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Add Product</h2>
        <form className="grid grid-cols-2 gap-6" onSubmit={handleSubmit}>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700" htmlFor="productName">
              Product Name
            </label>
            <input
              type="text"
              id="productName"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="Enter product name"
              required
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700" htmlFor="productPrice">
              Price
            </label>
            <input
              type="number"
              id="productPrice"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="Enter product price"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700" htmlFor="productDescription">
              Description
            </label>
            <textarea
              id="productDescription"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="Enter product description"
              rows={3}
              required
            ></textarea>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700" htmlFor="productImage">
              Upload Image
            </label>
            <input
              type="file"
              id="productImage"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:ring-blue-500"
              accept="image/*"
            />
          </div>
          <div className="col-span-2 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-md"
            >
              Close
            </button>
            <button
              type="submit"
              className="text-white bg-blue-500 hover:bg-blue-700 rounded px-4 py-2"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
    );
};

export default Modal;