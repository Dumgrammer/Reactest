import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../Actions/Product";
import Carousel from "./Carousel";

interface InventoryItem {
  size: string;
  type: string;
  quantity: number;
}

interface ProductItem {
  _id: string;
  name: string;
  image: string[] | string;
  description: string;
  price: number;
  countInStock: number;
  size: string[];
  type: string[];
  inventory: InventoryItem[];
}

function Product() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProductsData = async () => {
    setLoading(true);
    const response = await fetchProducts();
    setLoading(false);

    if (!response.success) {
      setError(response.message);
    } else {
      setProducts(response.products.data);
    }
  };

  useEffect(() => {
    fetchProductsData();
  }, []);

  // Listen for cart updates to refresh products
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchProductsData();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Function to determine stock status display
  const getStockStatusDisplay = (product: ProductItem) => {
    const totalStock = product.inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    
    if (totalStock > 10) {
      return <span className="text-xs text-green-600">In Stock</span>;
    } else if (totalStock > 0) {
      return <span className="text-xs text-yellow-600">Low Stock</span>;
    } else {
      return <span className="text-xs text-red-600">Out of Stock</span>;
    }
  };

  // Function to get inventory quantity for a specific size
  const getSizeQuantity = (product: ProductItem, size: string): number => {
    if (!product.inventory) return 0;

    // Sum quantity across all types for this size
    return product.inventory
      .filter((item) => item.size === size)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div>
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : (
        <section className="body-font text-gray-600">
          <div className="product-cont container mx-auto">
            {/* <Carousel /> */}
            <div className="w-full p-4">
              <h2 className="mb-4 text-xl font-bold">Products</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.length > 0 ? (
                  products.map((product) => (
                    <div
                      key={product._id}
                      className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
                    >
                      <Link to={`/products/${product._id}`}>
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={
                              Array.isArray(product.image)
                                ? product.image[0]
                                : product.image
                            }
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      </Link>
                      <div className="flex h-full flex-col p-4">
                        <Link to={`/products/${product._id}`} className="block">
                          <h3 className="mb-1 text-lg font-semibold text-gray-800 hover:text-green-600">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                          {product.description}
                        </p>
                        <div className="flex items-baseline justify-between">
                          <span className="font-bold text-green-600">
                            ₱{product.price.toFixed(2)}
                          </span>
                          {getStockStatusDisplay(product)}
                        </div>

                        {/* Size Availability */}
                        {product.size && product.size.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">
                              Available sizes:
                            </span>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {product.size.map((size, index) => {
                                const quantity = getSizeQuantity(product, size);
                                const isAvailable = quantity > 0;

                                return (
                                  <span
                                    key={index}
                                    className={`relative mb-3 inline-block rounded px-2 py-1 text-xs
                                                                            ${
                                                                              isAvailable
                                                                                ? "bg-green-100 text-green-800"
                                                                                : "bg-gray-100 text-gray-500"
                                                                            }`}
                                  >
                                    {size}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <Link
                          to={`/products/${product._id}`}
                          className="mt-auto block"
                        >
                          <button className="w-full rounded-md bg-green-500 px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-green-600">
                            View Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-lg text-gray-500">
                      No products available.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Product;
