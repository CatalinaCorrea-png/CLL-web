require('dotenv').config(); // Cargar variables de entorno
const app = require('./src/app.js');
const { revisarConfiguracion } = require('./src/presupuestos/transportes');

revisarConfiguracion(); // avisa si faltan variables de los mails

const PORT = process.env.PORT || 3001;

// Configuracion del puerto y ejecucion del servidor
app.listen(PORT, (error) => {
  if(!error)
    console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
  else
    console.log(`Problema al iniciar server. ERROR: ${error}`);
});