import { DarkThemeToggle } from "flowbite-react";
import Layout from "./Layout/Layouts";
import Product from "./components/Product";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductDetail from "./views/ProductDetails";
import Home from "./views/Home";
import Login from "./views/Auth/Login";
import Register from "./views/Auth/Register";

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<Home/>}></Route>
      <Route path="/products/:id" element={<ProductDetail/>}></Route>
      <Route path="/login" element={<Login/>} ></Route>
      <Route path="/register" element={<Register/>}></Route>
    </Routes>
  </Router>
  );
}

export default App;
