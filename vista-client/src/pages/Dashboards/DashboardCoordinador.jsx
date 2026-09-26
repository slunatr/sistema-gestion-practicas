import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table } from "react-bootstrap";

const DashboardCoordinador = () => {
  const [resumen, setResumen] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/resumen-practicas/", {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      })
      .then((res) => setResumen(res.data))
      .catch((err) => console.error("Error al cargar resumen", err));
  }, []);

  return (
    <Container className="mt-4">
      <h2>Panel del Coordinador</h2>
      <p>Resumen general de las prácticas publicadas y su estado.</p>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Título</th>
            <th>Empresa</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {resumen.map((p) => (
            <tr key={p.id}>
              <td>{p.titulo}</td>
              <td>{p.empresa_nombre}</td>
              <td>{p.estado}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default DashboardCoordinador;