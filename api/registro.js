export default function handler(req, res) {
  if (req.method === 'POST') {
    const userAgent = req.headers['user-agent'] || 'Desconocido';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const datosVisita = {
      fecha: new Date().toLocaleString('es-AR'), // Hora local del registro
      ip: ip,
      navegador: userAgent,
      pantalla: req.body?.pantalla || 'Desconocida'
    };

    return res.status(200).json({
      ok: true,
      datos: datosVisita
    });
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
