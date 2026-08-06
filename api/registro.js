import Redis from 'ioredis';

// Toma la variable de entorno de Vercel o usa la cadena de conexión de Redis
const connectionString = process.env.REDIS_URL || 'redis://default:oFcCtzW4uJpH1RfpHngI0rjRMgiRdJiS@navy-spontaneous-sunray-66431.db.redis.io:12221';

const redis = new Redis(connectionString);

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const rawHistorial = await redis.lrange('visitas_historial', 0, 49) || [];
      const historial = rawHistorial.map(item => JSON.parse(item));
      return res.status(200).json({ ok: true, historial });
    }

    if (req.method === 'POST') {
      const userAgent = req.headers['user-agent'] || 'Desconocido';
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      const nuevaVisita = {
        fecha: new Date().toLocaleString('es-AR'),
        ip: ip,
        navegador: userAgent,
        pantalla: req.body?.pantalla || 'Desconocida'
      };

      // Guardar el registro en la lista de Redis
      await redis.lpush('visitas_historial', JSON.stringify(nuevaVisita));

      // Obtener el historial de las últimas 50 visitas
      const rawHistorial = await redis.lrange('visitas_historial', 0, 49);
      const historial = rawHistorial.map(item => JSON.parse(item));

      return res.status(200).json({
        ok: true,
        actual: nuevaVisita,
        historial
      });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en ioredis:', error);
    return res.status(500).json({ 
      error: 'Error interno al consultar la base de datos',
      detalle: error.message 
    });
  }
}
