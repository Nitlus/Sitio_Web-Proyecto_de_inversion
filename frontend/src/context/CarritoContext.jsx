import { createContext, useContext, useState, useEffect } from 'react';

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  // Inicializamos el carrito leyendo el localStorage
  const [carrito, setCarrito] = useState(() => {
    const copiaLocal = localStorage.getItem('carrito_items');
    return copiaLocal ? JSON.parse(copiaLocal) : [];
  });

  // Guardamos en localStorage automáticamente cada vez que el carrito cambie
  useEffect(() => {
    localStorage.setItem('carrito_items', JSON.stringify(carrito));
  }, [carrito]);

  // Agregar producto o incrementar cantidad si ya existe
  const agregarAlCarrito = (producto, cantidadElegida) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: Math.min(item.cantidad + cantidadElegida, producto.stock) }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: cantidadElegida }];
    });
  };

  // Cambiar cantidad directamente desde los botones +/- del carrito
  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setCarrito((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, cantidad: Math.min(nuevaCantidad, item.stock) }
          : item
      )
    );
  };

  // Eliminar un producto por completo
  const removerDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  // Vaciar carrito al finalizar la orden
  const limpiarCarrito = () => setCarrito([]);

  // Cantidad total de ítems individuales para el globito de la Navbar
  const totalItemsCount = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CarritoContext.Provider value={{ carrito, agregarAlCarrito, actualizarCantidad, removerDelCarrito, limpiarCarrito, totalItemsCount }}>
      {children}
    </CarritoContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCarrito = () => useContext(CarritoContext);