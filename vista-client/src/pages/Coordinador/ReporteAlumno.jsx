import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Table, Spinner, Alert } from "react-bootstrap";

export default function ReporteAlumno() {
  const { id } = useParams();
  const [practicas, setPracticas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const obtenerPracticas = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/practicas-por-alumno/${id}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setPracticas(response.data);
      } catch (error) {
        console.error("Error al obtener prácticas del alumno", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerPracticas();
  }, [id, token]);

  if (cargando) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (practicas.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="info">Este estudiante aún no tiene prácticas registradas.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h3>🧾 Reporte detallado del Alumno</h3>
      <Table striped bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>Título</th>
            <th>Empresa</th>
            <th>Estado</th>
            <th>Nota</th>
            <th>Fecha Inicio</th>
            <th>Fecha Término</th>
            <th>Documentos</th>
          </tr>
        </thead>
        <tbody>
          {practicas.map((p) => (
            <tr key={p.id}>
              <td>{p.titulo}</td>
              <td>{p.empresa_nombre || "No registrada"}</td>
              <td>{p.estado}</td>
              <td>{p.nota || "N/A"}</td>
              <td>{p.fecha_inicio}</td>
              <td>{p.fecha_termino}</td>
              <td>{p.documentos ? <a href={p.documentos}>Ver</a> : "No disponibles"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}