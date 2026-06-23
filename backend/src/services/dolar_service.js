// src/services/dolar_service.js

let cotizacionCache = null;
let ultimaActualizacion = null;

async function obtenerCotizacionBlue() {
	const ahora = new Date();

	// Si ya tenemos el dólar guardado y pasó menos de 1 hora (3600000 ms), usamos el caché
	if (cotizacionCache && ultimaActualizacion && (ahora - ultimaActualizacion < 3600000)) {
		return cotizacionCache;
	}

	try {
		// Petición a la API gratuita
		const response = await fetch('https://dolarapi.com/v1/dolares/blue');
		const data = await response.json();
		
		cotizacionCache = data.venta; // Usamos el precio de "Venta" del Blue
		ultimaActualizacion = ahora;
		
		console.log(`Dólar actualizado a: $${cotizacionCache}`);
		return cotizacionCache;
	} catch (error) {
		console.error("Error obteniendo DolarAPI. Usando fallback:", error);
		// Si se cae el internet o la API, devolvemos un Dólar de emergencia/histórico
		return cotizacionCache || 1200; 
	}
}

module.exports = { obtenerCotizacionBlue };