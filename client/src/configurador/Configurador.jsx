import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Escena from './Escena';
import './configurador.css';

// Límites del largo en mm (docs/especificacion-batea.md).
const LARGO_MIN = 1200;
const LARGO_MAX = 3600;

// Prototipo: el estado vive acá hasta que se arme el store de zustand.
const Configurador = () => {
  const [largo, setLargo] = useState(2000);

  return (
    <div className="cfg-layout">
      <aside className="cfg-panel ice-card">
        <span className="eyebrow">Opciones</span>
        <h2 className="cfg-panel-title">Tu equipo</h2>

        <Form.Group controlId="cfg-largo">
          <Form.Label className="cfg-label">
            Largo
            <span className="cfg-valor">
              {largo} mm · {(largo / 1000).toFixed(2).replace('.', ',')} m
            </span>
          </Form.Label>
          <Form.Range
            min={LARGO_MIN}
            max={LARGO_MAX}
            step={100}
            value={largo}
            onChange={(e) => setLargo(Number(e.target.value))}
          />
          <div className="cfg-rango">
            <span>{LARGO_MIN} mm</span>
            <span>{LARGO_MAX} mm</span>
          </div>
        </Form.Group>

        <p className="cfg-ayuda">
          <i className="fa-solid fa-person"></i> La silueta mide 1,75 m, como referencia de escala.
        </p>
      </aside>

      <div className="cfg-visor">
        <Escena largo={largo} />
      </div>
    </div>
  );
};

export default Configurador;
