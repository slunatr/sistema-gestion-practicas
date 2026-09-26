import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Button } from "react-bootstrap";

const DashboardAdministrador = () => {
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
      <h2>Panel del Administrador</h2>
      <p>Control de todas las prácticas para aprobación y gestión.</p>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Título</th>
            <th>Empresa</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {resumen.map((p) => (
            <tr key={p.id}>
              <td>{p.titulo}</td>
              <td>{p.empresa_nombre}</td>
              <td>{p.estado}</td>
              <td>
                <Button variant="outline-primary" size="sm">
                  Revisar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default DashboardAdministrador;