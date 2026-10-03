// Error boundary del visor 3D: si la escena falla (p. ej. el navegador dice tener WebGL pero no puede
// crear el contexto), avisa para pasar a las imágenes de referencia en lugar de romper la página.
import { Component } from 'react';

/**
 * @typedef {object} PropsLimite
 * @property {() => void} alFallar
 * @property {import('react').ReactNode} children
 */

/** @extends {Component<PropsLimite, { fallo: boolean }>} */
class LimiteError3D extends Component {
  /** @param {PropsLimite} props */
  constructor(props) {
    super(props);
    this.state = { fallo: false };
  }

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  /** @param {unknown} error */
  componentDidCatch(error) {
    console.warn('No se pudo mostrar el 3D; se muestran imágenes de referencia.', error);
    this.props.alFallar();
  }

  render() {
    return this.state.fallo ? null : this.props.children;
  }
}

export default LimiteError3D;
