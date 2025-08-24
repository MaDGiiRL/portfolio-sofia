import { Routes, Route, Outlet } from "react-router";
import Layout from "../layout/Layout";
import Home from "../pages/Home";
import ErrorPage from "../pages/error/ErrorPage";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import AccountPage from "../pages/AccountPage";
import CvPage from "../pages/CvPage";
import AdminGate from "../components/admin/AdminGate";
import AdminPanel from "../pages/admin/AdminPanel";
import BlogList from "../pages/BlogList";
import BlogDetail from "../pages/BlogDetail";
import ProjectList from "../pages/ProjectList";
import ProjectDetail from "../pages/ProjectDetail";
import SearchResults from "../pages/SearchResults";
import ReviewsPage from "../pages/ReviewsPage";


function AdminProtectedLayout() {
  return (
    <AdminGate>
      <Outlet />
    </AdminGate>
  );
}

export function Routing() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/tag/:tag" element={<BlogList />} />
        <Route path="/progetti" element={<ProjectList />} />
        <Route path="/progetti/:id" element={<ProjectDetail />} />
        {/* <Route path="/admin" element={<AdminPanel />} /> */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cv" element={<CvPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/reviews" element={<ReviewsPage />} />

        {/* 🔒 Area Admin protetta */}
        <Route path="/admin" element={<AdminProtectedLayout />}>
          <Route index element={<AdminPanel />} />
        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Route>
    </Routes>
  );
}
