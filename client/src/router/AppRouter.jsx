import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import Loader from '../components/Loader';
import Home from '../pages/Home';
import Fabricacion from '../pages/Fabricacion';
import Reparacion from '../pages/Reparacion';
import Obras from '../pages/Obras';
import Servicios from '../pages/Servicios';

// Lazy: el configurador 3D (three.js) va en su propio chunk y solo se descarga en /planificacion.
const Planificacion = lazy(() => import('../pages/Planificacion'));

export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={ <Layout /> }>
          <Route index element={ <Home /> } />
          <Route  path="fabricacion" element={ <Fabricacion /> } />
          <Route  path="reparacion" element={ <Reparacion /> } />
          {/* <Route  path="obras" element={ <Obras /> } /> */}
          <Route  path="servicios" element={ <Servicios /> } />
          <Route  path="planificacion" element={
            <Suspense fallback={ <Loader /> }>
              <Planificacion />
            </Suspense>
          } />
          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}
// Header es un componente para navegar por las diferentes url dentro de la pagina. Ruta <Header/>: contiene a las otras rutas, porque él se mantiene en toda la pagina. 

// export default AppRouter;
