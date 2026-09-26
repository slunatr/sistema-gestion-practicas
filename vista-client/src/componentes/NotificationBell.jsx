import React from "react";
import { FaBell } from "react-icons/fa";

const NotificationBell = () => {
  const handleClick = () => {
    alert("Aquí van las notificaciones reales del sistema.");
  };

  return (
    <div style={{ position: "relative", cursor: "pointer" }} onClick={handleClick}>
      <FaBell size={20} color="#007bff" />
      <span
        style={{
          position: "absolute",
          top: "-5px",
          right: "-5px",
          background: "red",
          color: "white",
          borderRadius: "50%",
          fontSize: "10px",
          padding: "2px 5px",
        }}
      >
        3
      </span>
    </div>
  );
};

export default NotificationBell;