/*
Importación de módulos
*/

/*
@Authors: Alejandro Alcaraz Sanchez, Ismael Caceres Bernabeu, Pablo Garcia Muñoz, Aitor Medina Amat,
Alvaro Jose Moreno Carreras, Juan Vicente Rico Iborra.

Fecha de creacion de fichero: 18-10-2021

Creacion de fichero de apertura de aplicacion, llamada al metodo que crea la conexion de la base 
de datos y llamada a las rutas.

*/
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { dbConnection } = require('./database/configdb');
const bodyParser = require('body-parser');
const { generarJWT } = require('./helpers/jwt');
const fileUpload = require('express-fileupload');
const configMensajeRecu = require('./helpers/configMensajeRecu');
const MensajeSoli = require('./helpers/MensajeSoli');
const stripe = require('stripe')('sk_test_51KnQqBKAkxXLbj4AOAQc48hfM89E5c4DT31jG81omFKZRTUSA1x20o5Ocy3WiZeGfpbRSGaYNJjmRU8FMk8tXXJL001gqveOPs');
// Crear una aplicación de express
const app = express();

dbConnection();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(fileUpload({
    limits: { fileSize: process.env.MAXSIZEUPLOAD * 1024 * 1024 },
    createParentPath: true,
}));

app.use('/api/login', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/provinces', require('./routes/province'));
app.use('/api/towns', require('./routes/town'));
app.use('/api/travels', require('./routes/travel'));
app.use('/api/reviews', require('./routes/review'));
app.use('/api/places', require('./routes/place'));
app.use('/api/events', require('./routes/event'));
app.use('/api/upload', require('./routes/uploads'));


//generar datos sinteticos
app.use('/api/datos', require('./routes/datos'));

//Mensajes de correo recuperación contraseña
app.post('/api/recu', async (req, res) => {
        const tok = await generarJWT(req.body.uid, req.body.rol);
        configMensajeRecu(req.body, tok);
        res.status(200).send();
    })
    //Mensaje correo solicitud rechazada
app.post('/api/requestReject', (req, res) => {
    MensajeSoli(req.body);
    res.status(200).send();
})

app.post('/api/stripe_checkout', async(req, res) => {
    const stripeToken = req.body.stripeToken;
    const cantidad = req.body.cantidad;

    const cantidadInEur = Math.round(cantidad * 100);
    const chargeObject = await stripe.charges.create({
        amount: cantidad,
        currency: 'eur',
        source: stripeToken,
        capture: false,
        description: 'Descripcion del stripe',
        receipt_email: 'studiohalfy@gmail.com'
    });
    try {
        await stripe.charges.capture(chargeObject.id);
        res.json(chargeObject);
    } catch (error) {
        await stripe.refunds.create({ charge: chargeObject.id });
        res.json(chargeObject);
    }
});


// Abrir la aplicacíon en el puerto 3000
app.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en el puerto ', process.env.PORT);
});