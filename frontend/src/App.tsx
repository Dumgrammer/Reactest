import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProductDetail from "./views/ProductDetails";
import Home from "./views/Home";
import Login from "./views/Auth/Login";
import Register from "./views/Auth/Register";
import PlaceOrder from "./views/PlaceOrder";
import { useSelector } from "react-redux";
import Sidenav from "./Layout/Sidenav";
import Card from "./components/Card";
import Admin from "./views/Admin";



function App() {

const userLoginReducer = useSelector((state: any)=>state.userLoginReducer);
const { userInfo } = userLoginReducer;

  return (
    <Router>
    <Routes>
      <Route path="/" element={<Home/>}></Route>
      <Route path="/products/:id" element={<ProductDetail/>}></Route>
      <Route path="/login" element={userInfo ? <Navigate to="/"></Navigate> : <Login/>} ></Route>
      <Route path="/register" element={userInfo ? <Navigate to="/"></Navigate> : <Register/>}></Route>
      <Route path="/placeorder" element={<PlaceOrder/>}></Route>
      <Route path="/admin" element={<Admin/>}></Route>
    </Routes>
  </Router>
  );
}

export default App;
