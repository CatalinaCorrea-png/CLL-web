import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import Home from '../pages/Home';
import Fabricacion from '../pages/Fabricacion';
import Reparacion from '../pages/Reparacion';
import Obras from '../pages/Obras';
import Servicios from '../pages/Servicios';

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
          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}
// Header es un componente para navegar por las diferentes url dentro de la pagina. Ruta <Header/>: contiene a las otras rutas, porque él se mantiene en toda la pagina. 

// export default AppRouter;
