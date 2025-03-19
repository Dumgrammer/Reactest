import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProductDetail from "./views/ProductDetails";
import Home from "./views/Home";
import Login from "./views/Auth/Login";
import Register from "./views/Auth/Register";
import Admin from "./views/Admin";
import ProductsList from "./views/ProductsList";
import { useState, useEffect } from "react";
import Payment from "./views/Payment";
import PaymentSuccess from './views/PaymentSuccess';
import OrdersList from "./views/OrdersList";
import Searched from "./views/Searched";
import VerifyCode from "./views/VerifyCode";
interface UserInfo {
  id: string;
  name: string;
  email: string;
}

function App() {

  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    try {
      const storedUser = localStorage.getItem("userInfo");
      return storedUser ? (JSON.parse(storedUser) as UserInfo) : null;
    } catch (error) {
      console.error("Error parsing userInfo:", error);
      return null;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("userInfo");
      setUserInfo(storedUser ? (JSON.parse(storedUser) as UserInfo) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);


  return (
    <Router>
      <Routes>
        
        <Route path="/login" element={userInfo ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={userInfo ? <Navigate to="/" /> : <Register />} />
        
        <Route path="/" element={<Home/>}></Route>
        <Route path="/products/:id" element={<ProductDetail/>}></Route>
        <Route path="/search" element={<Searched/>}></Route>
        <Route path="/payment" element={<Payment/>}></Route>
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/verifycode" element={<VerifyCode/>} />
        
        <Route path="/admin" element={<Admin/>}></Route>
        <Route path="/admin/products" element={<ProductsList/>}></Route>
        <Route path="/admin/orders" element={<OrdersList/>}></Route>
      </Routes>
  </Router>
  );
}

export default App;
