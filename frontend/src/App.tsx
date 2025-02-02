import { DarkThemeToggle } from "flowbite-react";
import Layout from "./Layout/Layouts";
import Product from "./components/Product";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductDetail from "./views/ProductDetails";
import Home from "./views/Home";

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<Home/>}></Route>
      <Route path="/products/:id" element={<ProductDetail/>}></Route>
    </Routes>
  </Router>
  );
}

export default App;
