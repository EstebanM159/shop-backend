import { CorsOptions } from 'cors';

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {
    // 1. Permite la solicitud si el encabezado 'Origin' está ausente (undefined).
    // Esto es NECESARIO para UptimeRobot y otras herramientas de servidor/backend.
    if (origin === undefined) {
      callback(null, true);
      return; // Permite inmediatamente
    }

    // 2. Definir la lista blanca (incluyendo la URL de tu frontend)
    const whitelist = [process.env.FRONTEND_URL];

    // 3. Permite si el origen está en la lista (para navegadores)
    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      // 4. Bloquear cualquier otro dominio de navegador
      callback(new Error(`Error de CORS: El origen ${origin} no está permitido`));
    }
  },
};
