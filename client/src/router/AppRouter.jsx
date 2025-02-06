import { Route, Routes } from 'react-router-dom';
import Header from '../components/Header';
import Home from '../pages/Home';

export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={ <Header /> }>
          <Route index element={ <Home /> } />
          <Route  path="fabricacion" element={ <Home /> } />
          <Route  path="reparacion" element={ <Home /> } />
          <Route  path="obras" element={ <Home /> } />
          <Route  path="servicios" element={ <Home /> } />
        </Route>
      </Routes>
    </>
  )
}
// Header es un componente para navegar por las diferentes url dentro de la pagina. Ruta <Header/>: contiene a las otras rutas, porque él se mantiene en toda la pagina. 

// export default AppRouter;
