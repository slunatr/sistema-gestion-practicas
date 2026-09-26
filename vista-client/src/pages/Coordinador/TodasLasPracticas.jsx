import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Table, Button, Spinner, Alert, Form, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ESTADOS = [
  { value: "", label: "Todas" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "PUBLICADA", label: "Publicada" },
  { value: "POR_REVISAR", label: "Por revisar" },
  { value: "ASIGNADA", label: "Asignada" },
  { value: "EN_CURSO", label: "En curso" },
  { value: "TERMINADA", label: "Terminada" },
  { value: "EVALUADA", label: "Evaluada" },
  { value: "APROBADA", label: "Aprobada" },
  { value: "RECHAZADA", label: "Rechazada" },
];

function badgeVariant(estado) {
  switch (estado) {
    case "PENDIENTE": return "secondary";
    case "PUBLICADA": return "primary";
    case "POR_REVISAR": return "warning";
    case "ASIGNADA": return "info";
    case "EN_CURSO": return "info";
    case "TERMINADA": return "dark";
    case "EVALUADA": return "warning";
    case "APROBADA": return "success";
    case "RECHAZADA": return "danger";
    default: return "secondary";
  }
}

export default function TodasLasPracticas() {
  const navigate = useNavigate();
  const API = "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [practicas, setPracticas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [estado, setEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const cargar = async () => {
    setCargando(true);
    setError("");

    try {
      const url = estado
        ? `${API}/api/coordinador/practicas/?estado=${encodeURIComponent(estado)}`
        : `${API}/api/coordinador/practicas/`;

      const res = await fetch(url, {
        headers: { Authorization: `Token ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.detail || "No se pudieron cargar las prácticas.");

      setPracticas(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      setPracticas([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line
  }, [estado]);

  const stats = useMemo(() => {
    const total = practicas.length;
    const porEstado = practicas.reduce((acc, p) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1;
      return acc;
    }, {});
    return { total, porEstado };
  }, [practicas]);

  const practicasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return practicas;

    return practicas.filter((p) => {
      const titulo = (p.titulo || "").toLowerCase();
      const empresa = (p.empresa_nombre || "").toLowerCase();
      const practicante = (p.practicante_rut || "").toLowerCase();
      const evaluador = (p.evaluador_nombre || "").toLowerCase();
      return (
        titulo.includes(q) ||
        empresa.includes(q) ||
        practicante.includes(q) ||
        evaluador.includes(q) ||
        String(p.id).includes(q)
      );
    });
  }, [practicas, busqueda]);

  if (cargando) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Cargando prácticas...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4" style={{ maxWidth: 1200 }}>
      <Row className="align-items-center mb-3">
        <Col>
          <h3 className="mb-0">Gestión de Prácticas</h3>
          <small className="text-muted">Vista Coordinador: control de estados y seguimiento general</small>
        </Col>
        <Col className="text-end">
          <Button variant="outline-secondary" onClick={cargar}>
            Recargar
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-3 mb-3">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted">Total prácticas</div>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>{stats.total}</div>
                </div>
                <Badge bg="secondary" style={{ fontSize: 14 }}>COORD</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Row className="g-2 align-items-end">
                <Col md={4}>
                  <Form.Label className="mb-1">Filtrar por estado</Form.Label>
                  <Form.Select value={estado} onChange={(e) => setEstado(e.target.value)}>
                    {ESTADOS.map((e) => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={8}>
                  <Form.Label className="mb-1">Buscar (ID, título, empresa, rut practicante, evaluador)</Form.Label>
                  <Form.Control
                    placeholder="Ej: 9, 'prueba', 'Empresa', '19.915...'..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </Col>
              </Row>

              <div className="mt-3 d-flex flex-wrap gap-2">
                {Object.entries(stats.porEstado).map(([k, v]) => (
                  <Badge key={k} bg={badgeVariant(k)} style={{ fontSize: 12 }}>
                    {k}: {v}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          {practicasFiltradas.length === 0 ? (
            <Alert variant="info" className="mb-0">
              No hay prácticas con estos filtros.
            </Alert>
          ) : (
            <Table striped bordered hover responsive className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: 70 }}>ID</th>
                  <th>Título</th>
                  <th>Empresa</th>
                  <th>Practicante</th>
                  <th>Evaluador</th>
                  <th style={{ width: 130 }}>Estado</th>
                  <th style={{ width: 120 }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {practicasFiltradas.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.titulo}</td>
                    <td>{p.empresa_nombre || "—"}</td>
                    <td>{p.practicante_rut || (p.practicante ? `ID ${p.practicante}` : "—")}</td>
                    <td>{p.evaluador_nombre || "—"}</td>
                    <td>
                      <Badge bg={badgeVariant(p.estado)}>{p.estado}</Badge>
                    </td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/coordinador/practicas/${p.id}`)}
                      >
                        Ver detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
