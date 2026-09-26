import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from './pages/Home';
import Login from './pages/Login';
import Register from "./pages/Register";
import LoginEmpresa from './pages/LoginEmpresa';
import RegisterEmpresa from "./pages/RegisterEmpresa";
import DashboardLayout from './layouts/DashboardLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import PracticanteDashboard from "./pages/Dashboards/PracticanteDashboard";
import MisPracticas from "./pages/MisPracticas";
import PerfilUsuario from "./pages/PerfilUsuario";
import MisPracticasPorRevisarEmpresa from "./pages/Empresas/MisPracticasPorRevisarEmpresa";
import PracticasPorAprobar from "./pages/Coordinador/PracticasPorAprobar";
import AsignarRoles from "./pages/Coordinador/AsignarRoles";
import ExportarPracticas from "./pages/Coordinador/ExportarPracticas";
import ResumenPracticas from "./pages/Coordinador/ResumenPracticas";
import PracticasEvaluadasPorAprobar from "./pages/Coordinador/PracticasEvaluadasPorAprobar";
import DetalleEvaluada from "./pages/Coordinador/DetalleEvaluada";
import ListadoAlumnos from "./pages/Coordinador/ListadoAlumnos";
import ReporteAlumno from "./pages/Coordinador/ReporteAlumno";
import MisPracticasPublicadasEmpresa from './pages/Empresas/MisPracticasPublicadasEmpresa';
import DetallePracticaEMP from './pages/Empresas/DetallePracticaEMP';
import PublicarPractica from "./pages/Empresas/PublicarPractica";
import PracticasAEvaluar from "./pages/Evaluador/MisPracticasEvaluadas";
import EvaluarPractica from "./pages/Evaluador/EvaluarPractica";
import MisPostulaciones from "./pages/Practicante/MisPostulaciones";
import DetallePracticaEmpresa from "./pages/Empresas/DetallePracticaEmpresa";
import DetallePracticaCoordinador from "./pages/Coordinador/DetallePracticaCoordinador";
import AprobarPostulaciones from "./pages/Coordinador/AprobarPostulaciones";
import AsignarEvaluador from "./pages/Coordinador/AsignarEvaluador";
import PracticasAevaluar from "./pages/Evaluador/PracticasAevaluar";
import MisPracticasEvaluadas from "./pages/Evaluador/MisPracticasEvaluadas";
import DetallePracticasEvaluadasPorAprobar from "./pages/Coordinador/DetallePracticasEvaluadasPorAprobar";
import TodasLasPracticas from "./pages/Coordinador/TodasLasPracticas";
import DetallePracticaCoor from "./pages/Coordinador/DetallePracticaCoor";













export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login-empresa" element={<LoginEmpresa />} />
        <Route path="/register-empresa" element={<RegisterEmpresa />} />
        

        {/* Rutas dentro del layout del dashboard */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<PracticanteDashboard />} />
          
          <Route path="/perfil" element={<PerfilUsuario />} />
          <Route path="/mis-practicas" element={<MisPracticas />} />
          <Route path="/mis-postulaciones" element={<MisPostulaciones />} />
          

            {/* Coordinador */}
         
          <Route path="/practicas-aprobar" element={<PracticasPorAprobar />} />
          <Route path="/asignar-roles" element={<AsignarRoles />} />
          <Route path="/exportar-practicas" element={<ExportarPracticas />} />
          <Route path="/resumen-practicas" element={<ResumenPracticas />} />
          <Route path="/practicas-evaluadas" element={<PracticasEvaluadasPorAprobar />} />
          <Route path="/detalle-evaluada/:id" element={<DetalleEvaluada />} />
           <Route path="/reporte-alumnos" element={<ListadoAlumnos />} />
            <Route path="/reporte-alumno/:id" element={<ReporteAlumno />} />
            <Route path="/detalle-practica-coordinador/:id" element={<DetallePracticaCoordinador />} />
            <Route path="/aprobar-postulaciones" element={<AprobarPostulaciones />} />
            <Route path="/asignar-evaluador" element={<AsignarEvaluador />}/>
            <Route path="/mis-practicas-evaluadas" element={<MisPracticasEvaluadas />} />
        <Route path="/practicas-evaluadas-por-aprobar" element={<PracticasEvaluadasPorAprobar />} />
          <Route path="/coordinador/practicas-evaluadas/:id" element={<DetallePracticasEvaluadasPorAprobar />}/>
          <Route path="/coordinador/todas-las-practicas" element={<TodasLasPracticas />} />
          
          <Route path="/coordinador/practicas/:id" element={<DetallePracticaCoor />} />
          




             {/* Empresas */}
          <Route path="/mis-practicas-publicadas" element={<MisPracticasPublicadasEmpresa />} />
          <Route path="/detalle-practica/:id" element={<DetallePracticaEMP />} />
           <Route path="/publicar-practica" element={<PublicarPractica />} />
           <Route path="/detalle-practica-empresa/:id" element={<DetallePracticaEmpresa />} />
           

          
          
         
          
          

          {/* Empresas */}
       
          <Route path="/practicas-espera" element={<div>Prácticas en Espera</div>} />      
          <Route path="/mis-practicas-por-revisar" element={<MisPracticasPorRevisarEmpresa />} />
          <Route path="/practicas-evaluadas" element={<PracticasAEvaluar />} />
           <Route path="/evaluar-practica/:id" element={<EvaluarPractica />} />
           <Route path="/detalle-practica-empresa/:id" element={<DetallePracticaEmpresa />} />
          
            {/*evaluador  */}
          <Route path="/practicas-a-evaluar" element={<PracticasAevaluar />} />



        </Route>
      </Routes>
    </Router>
  );
}

