import { kv } from '@vercel/kv';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const userAgent = req.headers['user-agent'] || 'Desconocido';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const datosVisita = {
      fecha: new Date().toISOString(),
      ip: ip,
      navegador: userAgent,
      pantalla: req.body?.pantalla || 'Desconocida'
    };

    // Imprime en los Runtime Logs de Vercel los datos capturados
    console.log('--- Nueva visita registrada ---', datosVisita);

    return res.status(200).json({
      ok: true,
      mensaje: 'Visita registrada con éxito',
      datos: datosVisita
    });
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
