import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

export default function MisPracticas() {
  const [practicas, setPracticas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/api/mis-practicas/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setPracticas(data))
      .catch((err) => console.error("Error al obtener prácticas:", err));
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Mis Prácticas</h3>
      {practicas.length === 0 ? (
        <p>No tienes prácticas registradas.</p>
      ) : (
        <ul className="list-group">
          {practicas.map((p) => (
            <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{p.titulo}</strong><br />
                Estado: {p.estado}<br />
                Empresa: {p.empresa_nombre}
              </div>
              <Button variant="primary" onClick={() => navigate(`/detalle-practica/${p.id}`)}>
                Ver Detalle
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}