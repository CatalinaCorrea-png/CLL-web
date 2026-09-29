import { useSearchParams } from 'react-router-dom';

// Productos del planificador. Por ahora solo la batea tiene catálogo; el resto aparece como "Próximamente".
// Las fotos son las mismas del catálogo de Fabricación (public/).
const PRODUCTOS = [
  { id: 'bateas', nombre: 'Batea', foto: '/bateas/arg/batea-1.webp', activo: true,
    descripcion: 'Exhibidora horizontal. Armá tu línea con esquinas y mostradores.' },
  { id: 'murales', nombre: 'Mural', foto: '/murales/arg/mural-1.webp', activo: false },
  { id: 'exhibidoras', nombre: 'Exhibidora', foto: '/exhibidoras/arg/exhibidora-1.webp', activo: false },
  { id: 'congelados', nombre: 'Congelados', foto: '/congelados/DSCN3101.webp', activo: false },
  { id: 'camaras', nombre: 'Cámara frigorífica', foto: '/camaras/camara-1-1.webp', activo: false },
];

// Paso inicial: elegir qué producto planificar.
const SelectorProducto = () => {
  const [, setParams] = useSearchParams();

  return (
    <div className="cfg-selector">
      <h2 className="cfg-selector-titulo">¿Qué querés planificar?</h2>
      <div className="cfg-productos">
        {PRODUCTOS.map((p) =>
          p.activo ? (
            <button key={p.id} type="button" className="cfg-producto ice-card" onClick={() => setParams({ producto: p.id })}>
              <img src={p.foto} alt="" className="cfg-producto-foto" loading="lazy" />
              <span className="cfg-producto-nombre">{p.nombre}</span>
              <span className="cfg-producto-desc">{p.descripcion}</span>
              <span className="cfg-producto-ir">Empezar <i className="fa-solid fa-arrow-right"></i></span>
            </button>
          ) : (
            <div key={p.id} className="cfg-producto ice-card inactivo" aria-disabled="true">
              <img src={p.foto} alt="" className="cfg-producto-foto" loading="lazy" />
              <span className="cfg-producto-nombre">{p.nombre}</span>
              <span className="ice-chip cfg-producto-pronto">Próximamente</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SelectorProducto;
