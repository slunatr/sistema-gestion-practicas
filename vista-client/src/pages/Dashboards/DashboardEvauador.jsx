import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Button } from "react-bootstrap";

const DashboardEvaluador = () => {
  const [practicas, setPracticas] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/mis-practicas/", {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      })
      .then((res) => setPracticas(res.data))
      .catch((err) => console.error("Error al cargar prácticas evaluador", err));
  }, []);

  return (
    <Container className="mt-4">
      <h2>Panel del Evaluador</h2>
      <p>Prácticas que debes evaluar.</p>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Título</th>
            <th>Estudiante</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {practicas.map((p) => (
            <tr key={p.id}>
              <td>{p.titulo}</td>
              <td>{p.practicante_rut || "No asignado"}</td>
              <td>{p.estado}</td>
              <td>
                <Button variant="success" size="sm">
                  Evaluar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default DashboardEvaluador;