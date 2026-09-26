export function getUsuario() {
  const usuario = localStorage.getItem("user");
  return usuario ? JSON.parse(usuario) : null;
}

export function getRol() {
  const usuario = getUsuario();
  return usuario?.perfil?.rol || null;
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}