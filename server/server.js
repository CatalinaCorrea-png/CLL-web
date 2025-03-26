const app = require('./src/app.js');
require('dotenv').config(); // Cargar variables de entorno


// Configuracion del puerto y ejecucion del servidor
app.listen(process.env.PORT, (error) => {
  if(!error)
    console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
  else
    console.log(`Problema al iniciar server. ERROR: ${error}`);
});