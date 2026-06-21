import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Inicialización Perezosa (Lazy Initialization):
  // React ejecutará esta función internamente SOLO la primera vez que cargue el componente.
  // Evitamos usar useEffect y eliminamos el doble renderizado (Cascading renders).
  const [usuario, setUsuario] = useState(() => {
    const token = localStorage.getItem('token');
    const datosUsuario = localStorage.getItem('usuario');
    
    if (token && datosUsuario) {
      return JSON.parse(datosUsuario);
    }
    return null; // Si no hay sesión, empieza como null directamente
  });

  const login = (datos, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(datos));
    setUsuario(datos);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    // Ya no chequeamos el "cargando", renderizamos los hijos directamente
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Le decimos a Vite/ESLint que ignore la advertencia de Fast Refresh solo en esta línea.
// Esta es la solución oficial y recomendada para archivos de Contexto.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);