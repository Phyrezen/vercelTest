import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const userAgent = req.headers['user-agent'] || 'Desconocido';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    const registro = {
      fecha: new Date().toISOString(),
      ip: ip,
      navegador: userAgent,
      pantalla: req.body.pantalla || 'Desconocida'
    };

    // Incrementar el contador general de visitas
    const totalVisitas = await kv.incr('contador_visitas');

    // Guardar el evento en una lista de registros
    await kv.lpush('registros_visitas', JSON.stringify(registro));

    return res.status(200).json({ ok: true, totalVisitas });
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
