import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ element }) => {
  const token = localStorage.getItem("token");
  const admin = localStorage.getItem("admin");

  // Check if user has admin token and admin data
  const isAdmin = token?.startsWith("admin-token-") && admin;

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return element;
};

export default AdminRoute;
