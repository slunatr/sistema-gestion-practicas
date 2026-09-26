import { useEffect, useState } from "react";

export default function usePerfil() {
  const [perfil, setPerfil] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchPerfil = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/mi-perfil/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        const data = await response.json();
        setPerfil(data.perfil);
        setUsuario(data.usuario);
      } catch (error) {
        console.error("Error al obtener el perfil:", error);
      }
    };
    fetchPerfil();
  }, []);

  return { perfil, usuario };
}