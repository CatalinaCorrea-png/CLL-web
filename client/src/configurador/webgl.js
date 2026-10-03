// ¿El navegador puede mostrar el 3D? Se prueba crear un contexto WebGL en un canvas suelto.
// Si no puede, el configurador muestra imágenes de referencia en lugar de la escena (VisorSinWebGL).

/** @returns {boolean} */
export const hayWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    gl?.getExtension('WEBGL_lose_context')?.loseContext(); // liberar el contexto de prueba
    return gl !== null;
  } catch {
    return false;
  }
};
