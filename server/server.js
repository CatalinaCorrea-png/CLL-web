const app = require('./src/app.js');
const PORT = 3001;


// Configuracion del puerto y ejecucion del servidor
app.listen(PORT, (error) => {
  if(!error)
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  else
    console.log(`Problema al iniciar server. ERROR: ${error}`);
});