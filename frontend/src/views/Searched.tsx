import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  fetchProducts,
  searchProducts,
  getCategories,
  getTypes,
  getSizes,
} from "../Actions/Product";
import Layout from "../Layout/Layouts";

function Searched() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTrigger, setSearchTrigger] = useState(0);

  const query = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(query);
  const [submittedQuery, setSubmittedQuery] = useState(query);
  const [categories, setCategories] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedType, setSelectedType] = useState("");
  const [priceSort, setPriceSort] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [appliedMinPrice, setAppliedMinPrice] = useState<string>("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<string>("");

  // Update q param as user types
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    const newParams = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      newParams.set("q", value);
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams, { replace: true });
  };

  // Fetch categories, types and sizes
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesResponse, typesResponse] = await Promise.all([
          getCategories(),
          getTypes(),
        ]);

        if (categoriesResponse.success) {
          setCategories(categoriesResponse.categories as string[]);
        }

        if (typesResponse.success) {
          setTypes(typesResponse.types as string[]);
        }
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };

    fetchFilters();
  }, []);

  // Handle search submission
  // const handleSearchSubmit = (e: React.FormEvent) => {
  //     e.preventDefault();
  //     if (searchQuery.trim()) {
  //         navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`);
  //     }
  // };

  // Only trigger search/filtering when submit is clicked
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery);
    // This will trigger the useEffect below
    setSearchTrigger((prev) => prev + 1);
  };

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateSearchParams(category);
  };

  // Handle type selection
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    // TODO: Add type filter to search
  };

  // Apply price filter
  const handlePriceFilter = () => {
    // Set the applied price values that will be used for filtering
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
  };

  // Update URL search params
  const updateSearchParams = (category: string) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (category) {
      newParams.set("category", category);
    } else {
      newParams.delete("category");
    }

    setSearchParams(newParams);
  };

  // Sort products by price
  const sortProductsByPrice = (products: any[], direction: string) => {
    if (!direction) return products;

    return [...products].sort((a, b) => {
      if (direction === "low-to-high") {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
  };

  // Handle price sort change
  const handlePriceSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortDirection = e.target.value;
    setPriceSort(sortDirection);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      console.log("Searching for:", query, "Category:", selectedCategory);

      try {
        let response;
        if (query || selectedCategory) {
          response = await searchProducts(query, selectedCategory);
        } else {
          response = await fetchProducts();
        }

        if (!response.success) {
          setError(response.message);
        } else {
          let filteredProducts = response.products.data || [];

          // Filter by price range if set - using applied values instead of input values
          if (appliedMinPrice && !isNaN(Number(appliedMinPrice))) {
            filteredProducts = filteredProducts.filter(
              (product: any) => product.price >= Number(appliedMinPrice),
            );
          }

          if (appliedMaxPrice && !isNaN(Number(appliedMaxPrice))) {
            filteredProducts = filteredProducts.filter(
              (product: any) => product.price <= Number(appliedMaxPrice),
            );
          }

          // Filter by type if selected
          if (selectedType) {
            filteredProducts = filteredProducts.filter(
              (product: any) =>
                product.type && product.type.includes(selectedType),
            );
          }

          // Sort by price if needed
          if (priceSort) {
            filteredProducts = sortProductsByPrice(filteredProducts, priceSort);
          }

          setProducts(filteredProducts);
        }
      } catch (err) {
        setError("Failed to fetch products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [
    searchTrigger,
    selectedCategory,
    priceSort,
    appliedMinPrice,
    appliedMaxPrice,
    selectedType,
  ]);

  return (
    <Layout>
      <div>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="py-10 text-center">
            <h1 className="text-xl text-red-500">{error}</h1>
          </div>
        ) : (
          <section className="body-font text-gray-600">
            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="mx-auto mb-4 max-w-xl lg:max-w-4xl"
            >
              <label
                htmlFor="search-input"
                className="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Search
              </label>
              <div className="relative">
                <input
                  type="search"
                  id="search-input"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="search-btn block w-full rounded-md bg-gray-50 p-4 pr-[60px] ps-7 text-sm text-gray-900 focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-500 dark:focus:ring-green-500"
                  placeholder="Search Products..."
                  required
                />
                <button
                  type="submit"
                  className="absolute bottom-2.5 end-2.5 rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-green-300"
                >
                  <i className="fa fa-search"></i>
                </button>
              </div>
            </form>
            <div className="4xl:mx-72 md:mx-auto">
              <div className="w-full p-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {/* Filters 1 */}
                  <div className="space-y-4 rounded-md bg-white p-4 shadow-sm">
                    {/* by Category */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700">
                        Category
                      </label>
                      <div className="mt-2 space-y-1">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            className="rounded border-gray-300"
                            value=""
                            checked={selectedCategory === ""}
                            onChange={() => handleCategoryChange("")}
                          />
                          <span>All Categories</span>
                        </label>
                        {categories.map((category, index) => (
                          <label
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="radio"
                              className="rounded border-gray-300"
                              value={category}
                              checked={selectedCategory === category}
                              onChange={() => handleCategoryChange(category)}
                            />
                            <span>{category}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700">
                        Price Range
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="Min"
                          className="w-1/2 rounded-md border border-gray-300 p-2"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                        />
                        <span>-</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Max"
                          className="w-1/2 rounded-md border border-gray-300 p-2"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={handlePriceFilter}
                        className="mt-2 w-full rounded-md bg-green-500 p-2 text-white hover:bg-green-600"
                      >
                        Apply
                      </button>
                    </div>

                    {/* by Type */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700">
                        Type
                      </label>
                      <select
                        className="mt-1 w-full rounded-md border border-gray-300 p-2"
                        value={selectedType}
                        onChange={(e) => handleTypeChange(e.target.value)}
                      >
                        <option value="">All Types</option>
                        {types.map((type, index) => (
                          <option key={index} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col lg:col-span-2">
                    <div>
                      <h2 className="mb-4 text-xl font-bold">
                        {submittedQuery || selectedCategory
                          ? `${submittedQuery ? `Search results for '${submittedQuery}'` : "Products"} ${selectedCategory ? `in ${selectedCategory}` : ""}`
                          : "All Products"}
                      </h2>
                      {/* Filters 2 */}
                      <div className="flex w-full flex-col space-y-2 lg:flex-row lg:justify-between">
                        {/* Price Range Summary */}
                        {(appliedMinPrice || appliedMaxPrice) && (
                          <div className="flex items-center text-sm text-gray-600">
                            <span>
                              Price:{" "}
                              {appliedMinPrice ? `$${appliedMinPrice}` : "$0"} -{" "}
                              {appliedMaxPrice ? `$${appliedMaxPrice}` : "Any"}
                            </span>
                          </div>
                        )}

                        {/* Sort Price */}
                        <div className="flex flex-col lg:flex-row lg:items-center">
                          <label className="block text-sm font-bold text-gray-700 lg:mr-2">
                            Sort by Price
                          </label>
                          <select
                            className="rounded-md border border-gray-300 p-2"
                            value={priceSort}
                            onChange={handlePriceSortChange}
                          >
                            <option value="">Select</option>
                            <option value="low-to-high">Low to High</option>
                            <option value="high-to-low">High to Low</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    {/* Products */}
                    <div className="-m-4 flex flex-wrap">
                      {products.length > 0 ? (
                        products.map((product: any) => (
                          <div
                            className="p-4 md:w-1/2 lg:w-1/4"
                            key={product._id}
                          >
                            <div className="bg-white">
                              <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                                <div className="mt-6 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                                  <div className="group relative">
                                    <img
                                      src={
                                        Array.isArray(product.image)
                                          ? product.image[0]
                                          : product.image
                                      }
                                      alt={product.name}
                                      className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto"
                                    />
                                    <div className="mt-4 flex justify-between">
                                      <div>
                                        <h3 className="text-sm text-gray-700">
                                          <Link to={`/products/${product._id}`}>
                                            <span
                                              aria-hidden="true"
                                              className="absolute inset-0"
                                            ></span>
                                            {product.name}
                                          </Link>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                          {product.description}
                                        </p>
                                      </div>
                                      <p className="text-sm font-medium text-gray-900">
                                        ₱{product.price}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="w-full p-8 text-center">
                          <h2 className="text-xl text-gray-600">
                            No products found for your search criteria.
                          </h2>
                          <p className="mt-2 text-gray-500">
                            Try a different search term or browse our
                            categories.
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Products End */}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

export default Searched;
