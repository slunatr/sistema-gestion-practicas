import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ListGroup } from "react-bootstrap";
import "../Style/Sidebar.css";




export default function Sidebar() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const rol = storedUser?.rol?.toUpperCase(); // Ahora sí existe
  const [hovered, setHovered] = useState(false);

  const renderLinksByRole = () => {
    console.log("USER EN LOCALSTORAGE:", localStorage.getItem("user"));
console.log("ROL OBTENIDO:", rol);
    switch (rol) {
      case "PRACT":
        return (
          <>
            <Link to="/dashboard" className="list-group-item list-group-item-action">Inicio</Link>
            <Link to="/mis-practicas" className="list-group-item list-group-item-action">Mis Prácticas</Link>
            <Link to="/mis-postulaciones" className="list-group-item list-group-item-action">Mis Postulaciones</Link>
            
          </>
        );
      case "COORD":
        return (
          <>
            <Link to="/dashboard" className="list-group-item list-group-item-action">Inicio</Link>
            <Link to="/asignar-roles" className="list-group-item list-group-item-action">Asignar Roles</Link>
            <Link to="/practicas-aprobar" className="list-group-item list-group-item-action">Visualizar practicas</Link>
            <Link to="/resumen-practicas" className="list-group-item list-group-item-action">Resumen de Prácticas</Link>
            <Link to="/exportar-practicas" className="list-group-item list-group-item-action">Exportar Prácticas</Link>
            <Link to="/practicas-evaluadas" className="list-group-item list-group-item-action">Evaluadas por Aprobar</Link>
            <Link to="/reporte-alumnos" className="list-group-item list-group-item-action">Reporte por Alumno</Link>
            <Link to="/aprobar-postulaciones" className="list-group-item list-group-item-action">Aprobar Postulaciones</Link>
            <Link to="/asignar-evaluador" className="list-group-item list-group-item-action">Asignar Evaluador </Link>
          
    <Link to="/coordinador/todas-las-practicas" className="list-group-item list-group-item-action">Todas las Prácticas</Link>
  </>

         
        );
      case "ADMIN":
        return (
          <>
            <Link to="/dashboard" className="list-group-item list-group-item-action">Inicio</Link>
            <Link to="/practicas-aprobar" className="list-group-item list-group-item-action">Prácticas Finalizadas por Aprobar</Link>
            <Link to="/asignar-roles" className="list-group-item list-group-item-action">Asignar Roles</Link>
            <Link to="/resumen-practicas" className="list-group-item list-group-item-action">Resumen de Prácticas</Link>
            <Link to="/exportar-practicas" className="list-group-item list-group-item-action">Exportar Prácticas</Link>
            <Link to="/practicas-evaluadas-por-aprobar"className="list-group-item list-group-item-action">Prácticas Evaluadas</Link>
            <Link to="/aprobar-postulaciones" className="list-group-item list-group-item-action">Aprobar Postulaciones</Link>
          </>
        );
      case "EVAL":
        return (
          <>
            <Link to="/dashboard" className="list-group-item list-group-item-action">Inicio</Link>
            <Link to="/mis-practicas-evaluadas" className="list-group-item list-group-item-action">Prácticas Evaluadas por Aprobar</Link>
         
           <Link to="/practicas-a-evaluar"className="list-group-item list-group-item-action">  Prácticas a Evaluar</Link>
            </>
        );
      case "EMPRESA":
        return (
          <>
            <Link to="/mis-practicas-publicadas" className="list-group-item list-group-item-action">Mis Prácticas</Link>
            <Link to="/mis-practicas-por-revisar" className="list-group-item list-group-item-action">Prácticas por Revisar</Link>
            <Link to="/publicar-practica" className="list-group-item list-group-item-action">Publicar Prácticas</Link>
            
          </>
        );
      default:
        return <div className="text-danger m-3">Rol no reconocido</div>;
    }
  };

  return (
    <div
      className={`sidebar ${hovered ? "sidebar-expanded" : "sidebar-collapsed"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <h5 className="fw-bold mb-3 text-truncate">{hovered ? "Menú" : "☰"}</h5>
      <ListGroup>{hovered && renderLinksByRole()}</ListGroup>
    </div>
  );
}