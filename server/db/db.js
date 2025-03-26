require('dotenv').config(); // Cargar variables de entorno
const mysql = require('mysql2/promise'); // version con promesas

const database = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true, // Esperar en vez de fallar
  connectionLimit: 5,  // Límite de conexiones simultáneas
  queueLimit: 0
});

// database.connect((error) => {
//   if (error) {
//     console.log("Error al conectar con la base de datos: " + error);
//     return;
//   }
//   console.log("Conectado a la base de datos");
// })

module.exports = database; // Exporta el pool con Promises