import { Redis } from '@upstash/redis';

// Inicializa el cliente tomando las variables del entorno de Vercel
const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    // GET: Obtener historial de visitas
    if (req.method === 'GET') {
      const historial = await redis.lrange('visitas_historial', 0, 49) || [];
      return res.status(200).json({ ok: true, historial });
    }

    // POST: Guardar nueva visita
    if (req.method === 'POST') {
      const userAgent = req.headers['user-agent'] || 'Desconocido';
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      const nuevaVisita = {
        fecha: new Date().toLocaleString('es-AR'),
        ip: ip,
        navegador: userAgent,
        pantalla: req.body?.pantalla || 'Desconocida'
      };

      // Guardar en la lista
      await redis.lpush('visitas_historial', JSON.stringify(nuevaVisita));

      // Obtener el historial actualizado
      const historial = await redis.lrange('visitas_historial', 0, 49);

      return res.status(200).json({
        ok: true,
        actual: nuevaVisita,
        historial
      });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en Redis:', error);
    return res.status(500).json({ error: 'Error interno al consultar la base de datos' });
  }
}
