import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QrImage({ value, size = 200 }) {
  const [src, setSrc] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setSrc('');
    setError('');
    QRCode.toDataURL(value, { width: size, margin: 1 })
      .then((url) => {
        if (active) setSrc(url);
      })
      .catch(() => {
        if (active) setError('No se pudo generar el QR.');
      });

    return () => {
      active = false;
    };
  }, [value, size]);

  if (error) {
    return <p className="error small">{error}</p>;
  }

  if (!src) {
    return <p className="muted small">Generando QR...</p>;
  }

  return <img className="qr-img" src={src} alt={`QR ${value}`} />;
}
