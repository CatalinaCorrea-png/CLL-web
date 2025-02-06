const mysql = require('mysql');
const database = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "",
});

database.connect((error) => {
  if (error) {
    console.log("Error al conectar con la base de datos: " + error);
    return;
  }
  console.log("Conectado a la base de datos");
})

module.exports = database;