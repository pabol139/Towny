// Generador de identificadores únicos para campos que sean unique
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
//Para generar contraseña
const bcrypt = require('bcryptjs');

// Incluir los models que necesitemos para almacenar datos

// Cargar el archivo de configuración
// dentro de config() pasamos el path (la ruta) donde está el archivo .env
require('dotenv').config({ path: '../.env' });

// Cargamos nuestra librería de conexión a la BD, con la ruta adecuada
const { dbConnection } = require('../database/configdb');
const user = require('../models/user');
const place = require('../models/place');
dbConnection();

const actualizarfechas = async() => {
    //const places = (await place.find());
    const users = (await user.find());

    const numu = (await users).length;

    for (let p = 0; p < numu; p++) {
        const usuario = users[p];
        if (usuario.rol == "ROL_COMMERCE" && usuario.bills.length != 0) {
            const ultimafact = usuario.bills[usuario.bills.length - 1];
            const desglose = ultimafact.split(" ");
            var fechafin = desglose[3];

            console.log(usuario.email);

            const popa = fechafin.split("/");

            var dia = Number(popa[0]);
            var mes = Number(popa[1]);
            var ano = Number(popa[2]);

            var pepo = ano + '-' + mes + '-' + dia;

            var kka = new Date(pepo);

            var today = new Date();

            if (kka < today) {
                const comercios = usuario.commercePlace;
                console.log(comercios);
                if (comercios.length != 0) {
                    for (let k = 0; k < comercios.length; k++) {
                        const comercio = (await place.findById(comercios[k]._id));
                        console.log(comercio);
                        if (comercio.status == "Activo") {
                            comercio.status = "Desactivado";
                            comercio.save();
                        }
                    }
                }
            }
        }
    }
    process.exit(0);
}

actualizarfechas();