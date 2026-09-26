import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import fondo from "../assets/img/Imagen-fondo.jpg";

const DashboardLayout = () => {
  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column" style={{ backgroundColor: "rgba(255,255,255,0.92)" }}>
        <Header />
        <main className="flex-grow-1 px-4 py-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;