import React, { useEffect, useState } from "react";
import { Navbar, Container, NavDropdown, Image } from "react-bootstrap";
import NotificationBell from "../componentes/NotificationBell";
import logoUCEN from "../assets/img/Logo_nuevo_ucen.png";
import avatarPorDefecto from "../assets/img/avatar.jpg";
import { Link } from "react-router-dom";

const Header = () => {
  const [perfil, setPerfil] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/api/mi-perfil/", {
          headers: { Authorization: `Token ${token}` },
        });
        const data = await response.json();
        setPerfil(data.perfil);
        setUsuario(data.usuario);
      } catch (error) {
        console.error("Error al cargar datos del perfil", error);
      }
    };

    fetchPerfil();
  }, []);

  const nombreCompleto =
    usuario?.first_name && usuario?.last_name
      ? `${usuario.first_name} ${usuario.last_name}`
      : "Usuario";

  const fotoPerfil = perfil?.foto
    ? `http://localhost:8000${perfil.foto}`
    : avatarPorDefecto;

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/api/logout/", {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      });
    } catch (e) {
      console.error("Error al cerrar sesión", e);
    }
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm py-2">
      <Container fluid className="d-flex justify-content-between align-items-center">
        {/* Logo a la izquierda */}
        <div className="d-flex align-items-center gap-2">
          <Image src={logoUCEN} height="40" />
        </div>

        {/* Centro: Título */}
        <div className="mx-auto fw-bold fs-5 text-center">
          Universidad Central de Chile
        </div>

        {/* Derecha: Notificaciones + Usuario */}
        <div className="d-flex align-items-center gap-3">
          <NotificationBell />
          <NavDropdown
            title={
              <span className="d-flex align-items-center">
                <Image
                  src={fotoPerfil}
                  roundedCircle
                  width="40"
                  height="40"
                  className="me-2"
                />
                <span>{nombreCompleto}</span>
              </span>
            }
            id="basic-nav-dropdown"
            align="end"
          >
            <NavDropdown.Item as={Link} to="/perfil">Mi perfil</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleLogout}>Cerrar sesión</NavDropdown.Item>
          </NavDropdown>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;