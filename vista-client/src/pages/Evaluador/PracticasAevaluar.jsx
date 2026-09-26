import React, { useEffect, useState } from "react";
import { Container, Table, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function PracticasAevaluar() {
  const [practicas, setPracticas] = useState([]); // ✅ siempre array
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("http://localhost:8000/api/practicas-a-evaluar/", {
          headers: { Authorization: `Token ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.detail || data?.error || "Error al cargar prácticas");
        }

        // ✅ backend debe devolver lista; si devuelve objeto, lo dejamos vacío para no romper
        setPracticas(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
        setPracticas([]);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const mostrarPracticante = (p) => {
    // ✅ si agregaste practicante_nombre en serializer, lo muestra
    if (p?.practicante_nombre) return p.practicante_nombre;

    // ✅ si no, intenta con rut
    if (p?.practicante_rut) return `RUT: ${p.practicante_rut}`;

    // ✅ si viene solo el id del practicante
    if (p?.practicante) return `ID: ${p.practicante}`;

    return "Sin asignar";
  };

  const mostrarEmpresa = (p) => {
    if (p?.empresa_nombre) return p.empresa_nombre;
    if (p?.empresa) return `ID: ${p.empresa}`;
    return "Empresa";
  };

  const badgeEstado = (estado) => {
    if (!estado) return <Badge bg="secondary">SIN ESTADO</Badge>;

    const e = String(estado).toUpperCase();
    if (e === "ASIGNADA") return <Badge bg="info">ASIGNADA</Badge>;
    if (e === "EN_CURSO") return <Badge bg="primary">EN CURSO</Badge>;
    if (e === "EVALUADA") return <Badge bg="success">EVALUADA</Badge>;
    if (e === "PUBLICADA") return <Badge bg="secondary">PUBLICADA</Badge>;

    return <Badge bg="dark">{e}</Badge>;
  };

  if (cargando) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Cargando prácticas...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h3>Prácticas a Evaluar</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {practicas.length === 0 ? (
        <Alert variant="info">No hay prácticas asignadas para evaluar.</Alert>
      ) : (
        <Table striped bordered hover responsive className="mt-3">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Empresa</th>
              <th>Practicante</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {practicas.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.titulo}</td>
                <td>{mostrarEmpresa(p)}</td>
                <td>{mostrarPracticante(p)}</td>
                <td>{badgeEstado(p.estado)}</td>
                <td>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate(`/evaluar-practica/${p.id}`)}
                  >
                    Evaluar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
