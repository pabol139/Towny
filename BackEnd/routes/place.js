/*
@Authors: Alejandro Alcaraz Sanchez, Ismael Caceres Bernabeu, Pablo Garcia Muñoz, Aitor Medina Amat,
Alvaro Jose Moreno Carreras, Juan Vicente Iborra.

Fecha de creacion de fichero: 18-10-2021

Creacion de fichero de rutas de la aplicacion, se anyaden las rutas para obtener, crear, modificar
y eliminar una provincia.

*/

const { Router } = require('express');
const { getPlacesByFiltersBar, getPlaces, getAllPlaces, getPlacesByCommerce, createPlace, updatePlace, deletePlace, acceptPlace, searchPlace, denyPlace, activatePlace, deactivatePlace, payLugar, getPlacesByTown } = require('../controllers/place');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');
const { validateJWT } = require('../middleware/validate_jwt');
const { validate_type_place } = require('../middleware/validate_typeofplace');

const router = Router();

router.get('/', [
    //validateJWT,
    // Campos opcionales, si vienen los validamos
    check('id', 'El id del lugar debe ser válido').optional().isMongoId(),
    check('since', 'El desde debe ser un número').optional().isNumeric(),
    validarCampos
], getPlaces);

router.get('/filterBar', [
    //validateJWT,
    // Campos opcionales, si vienen los validamos
    check('id', 'El id del lugar debe ser válido').optional().isMongoId(),
    check('since', 'El desde debe ser un número').optional().isNumeric(),
    validarCampos
], getPlacesByFiltersBar);

router.get('/bycommerce', [
    validateJWT,
    check('since', 'El desde debe ser un número').optional().isNumeric(),
    validarCampos
], getPlacesByCommerce);

router.get('/bytown', [
    //validateJWT,
    check('since', 'El desde debe ser un número').optional().isNumeric(),
    validarCampos
], getPlacesByTown);

router.get('/all', [
    //validateJWT,
    // Campos opcionales, si vienen los validamos
    //check('id', 'El id del lugar debe ser válido').optional().isMongoId(),
    //check('desde', 'El desde debe ser un número').optional().isNumeric(),
], getAllPlaces);

router.get('/search/:name', [
    validateJWT,
    // Campos opcionales, si vienen los validamos
    //check('id', 'El id del lugar debe ser válido').optional().isMongoId(),
    //check('desde', 'El desde debe ser un número').optional().isNumeric(),

], searchPlace);

router.post('/', [
    // validateJWT,
    check('name', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('location', 'El argumento localización es obligatorio').not().isEmpty().trim(),
    check('mobile_number', 'El número de teléfono debe ser un valor númerico').isNumeric(),
    validarCampos,
    validate_type_place
], createPlace);


router.put('/:id', [
    //  validateJWT,
    check('name', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('province', 'El argumento provincia debe ser un id valido').isMongoId(),
    check('id', 'El identificador no es válido').isMongoId(),
    validate_type_place
    //validarCampos
], updatePlace);

router.put('/accept/:id', [
    check('id', 'El identificador no es válido').isMongoId()

], acceptPlace);

router.put('/activate/:id', [
    check('id', 'El identificador no es válido').isMongoId()

], activatePlace);

router.put('/deactivate/:id', [
    check('id', 'El identificador no es válido').isMongoId()

], deactivatePlace);

router.put('/deny/:id/:fb', [
    check('id', 'El identificador no es válido').isMongoId(),

], denyPlace);

router.delete('/:id', [
        // validateJWT,
        //check('id', 'El identificador no es válido').isMongoId()
        //validarCampos,
    ],
    deletePlace);

router.post('/pay/:id', [
        validateJWT,
        check('id', 'El identificador de usuario no es válido').isMongoId(),
        validarCampos
    ],
    payLugar);

module.exports = router;