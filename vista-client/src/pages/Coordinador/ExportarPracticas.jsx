import React from "react";
import { Button } from "react-bootstrap";

export default function ExportarPracticas() {
  const handleExport = () => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8000/api/exportar-practicas/", {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al exportar prácticas");
      }
      return response.blob();
    })
    .then((blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "practicas.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    })
    .catch((error) => {
      console.error("Error al exportar:", error);
      alert("Error al exportar prácticas");
    });
  };

  return (
    <div className="mt-4">
      <h3>Exportar Prácticas</h3>
      <p>Presiona el botón para descargar un archivo Excel con todas las prácticas.</p>
      <Button onClick={handleExport} variant="success">Exportar a Excel</Button>
    </div>
  );
}