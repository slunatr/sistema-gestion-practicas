import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Button, Form, Spinner, Alert } from "react-bootstrap";

export default function AsignarEvaluador() {
  const [practicas, setPracticas] = useState([]);
  const [evaluadores, setEvaluadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const practicasRes = await axios.get(
          "http://localhost:8000/api/practicas-asignar-evaluador/",
          { headers: { Authorization: `Token ${token}` } }
        );

        const evaluadoresRes = await axios.get(
          "http://localhost:8000/api/listar-evaluadores/",
          { headers: { Authorization: `Token ${token}` } }
        );

        setPracticas(practicasRes.data);
        setEvaluadores(evaluadoresRes.data);
      } catch (err) {
        setError("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [token]);

  const asignarEvaluador = async (practicaId, evaluadorId) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/asignar-evaluador/${practicaId}/`,
        { evaluador_id: evaluadorId },
        { headers: { Authorization: `Token ${token}` } }
      );

      alert("Evaluador asignado correctamente");
      setPracticas(practicas.filter(p => p.id !== practicaId));
    } catch (error) {
      alert("Error al asignar evaluador");
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return <Alert variant="danger" className="mt-4">{error}</Alert>;
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Asignar Evaluador</h2>

      {practicas.length === 0 ? (
        <Alert variant="info">No hay prácticas pendientes de asignar evaluador.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Título</th>
              <th>Practicante</th>
              <th>Asignar Evaluador</th>
            </tr>
          </thead>
          <tbody>
            {practicas.map((p) => (
              <tr key={p.id}>
                <td>{p.titulo}</td>
                <td>{p.practicante_nombre || "—"}</td>
                <td>
                  <Form.Select
                    onChange={(e) => asignarEvaluador(p.id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Seleccionar evaluador
                    </option>
                    {evaluadores.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.first_name} {e.last_name}
                      </option>
                    ))}
                  </Form.Select>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
