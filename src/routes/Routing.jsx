import { Routes, Route } from "react-router";
import Layout from "../layout/Layout";
import Home from "../pages/Home";
import ErrorPage from "../pages/error/ErrorPage";
import Register from "../pages/Register";
import Login from "../pages/Login";

export function Routing() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<ErrorPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
            </Route>
        </Routes>
    );
}
