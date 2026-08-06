import Redis from 'ioredis';

const connectionString = process.env.REDIS_URL || 'redis://default:oFcCtzW4uJpH1RfpHngI0rjRMgiRdJiS@navy-spontaneous-sunray-66431.db.redis.io:12221';

const redis = new Redis(connectionString);

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const userAgent = req.headers['user-agent'] || 'Desconocido';
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      const nuevaVisita = {
        fecha: new Date().toLocaleString('es-AR'),
        ip: ip,
        pantalla: req.body?.pantalla || 'Desconocida'
      };

      // Guardar en Redis
      await redis.lpush('visitas_historial', JSON.stringify(nuevaVisita));

      // Leer historial
      const rawHistorial = await redis.lrange('visitas_historial', 0, 49);
      const historial = rawHistorial.map(item => {
        try {
          return typeof item === 'string' ? JSON.parse(item) : item;
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      return res.status(200).json({
        ok: true,
        actual: nuevaVisita,
        historial: historial
      });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en Redis:', error);
    return res.status(500).json({ error: 'Error interno en la base de datos', detalle: error.message });
  }
}
