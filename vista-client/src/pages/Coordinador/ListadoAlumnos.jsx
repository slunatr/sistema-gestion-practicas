import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function ListadoAlumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/lista-usuarios/", {
          headers: { Authorization: `Token ${token}` },
        });
        setAlumnos(response.data);
      } catch (error) {
        console.error("Error al cargar los alumnos:", error);
        setError("No se pudieron cargar los alumnos.");
      } finally {
        setCargando(false);
      }
    };

    fetchAlumnos();
  }, [token]);

  if (cargando) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">📚 Listado de Alumnos</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map((alumno) => (
            <tr key={alumno.id}>
              <td>{alumno.first_name} {alumno.last_name}</td>
              <td>{alumno.email}</td>
              <td>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate(`/reporte-alumno/${alumno.id}`)}
                >
                  Ver Reporte
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}