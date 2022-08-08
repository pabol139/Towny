/*
@Authors: Alejandro Alcaraz Sanchez, Ismael Caceres Bernabeu, Pablo Garcia Muñoz, Aitor Medina Amat,
Alvaro Jose Moreno Carreras, Juan Vicente Iborra.

Fecha de creacion de fichero: 18-10-2021

Creacion del fichero donde se encuentran los controladores de Pueblo.

*/

const { response } = require('express');

const Place = require('../models/place');
const Town = require('../models/town');
const User = require('../models/user');
const Travel = require('../models/travel');
const Province = require('../models/province');
const Review = require('../models/review');
const fs = require('fs');
const { infoToken } = require('../helpers/infotoken');
const { deleteREVW } = require('../helpers/delete_info_revw');
const { deleteTRV } = require('../helpers/delete_info_travel');


const getPlacesByFiltersBar = async(req, res) => {

    //const id = req.query.id;
    const name = req.query.name;
    const town = req.query.town;


    const desde = Number(req.query.since) || 0;
    const registropp = 5;

    let text_search = '';
    const text = req.query.texto || '';
    if (text !== '') {
        text_search = new RegExp(text, 'i');
    }
    let total = 0;

    //const population = req.query.population || '';
    const review = req.query.review || '';
    const cult = req.query.cult || false;
    const mon = req.query.mon || false;
    const green = req.query.green || false;
    const enter = req.query.enter || false;
    const com = req.query.com || false;
    const art = req.query.art || false;
    const rest = req.query.rest || false;
    const prov = req.query.province || '';

    try {
        let places = [];
        let query = "{";
        let places_aux = [];

        if (review != '' && !mon && !cult && !enter && !green && !com && !rest && !art) {
            query += `"status":"Activo","media_reviews": {"$gte": ${review}}`;
        } else if (review != '' && (mon || cult || enter || green || com || rest || art)) {
            query += `"status":"Activo","media_reviews": {"$gte": ${review}}, `;
            query += `"$or": [`;
            if (mon) {
                query += `{"type": "MONUMENTS"}`;
            }
            if (cult) {
                if (mon) query += ',';
                query += `{"type": "CHURCH_PLACES"}`;
            }
            if (green) {
                if (mon || cult) query += ',';
                query += `{"type": "GREEN_ZONE"}`;
            }
            if (enter) {
                if (mon || cult || green) query += ',';
                query += `{"type": "ENTERTAINMENT"}`;
            }
            if (com) {
                if (mon || cult || green || enter) query += ',';
                query += `{"type": "COMMERCES"}`;
            }
            if (art) {
                if (mon || cult || green || enter || com) query += ',';
                query += `{"type": "ART_AND_CULTURE"}`;
            }
            if (rest) {
                if (mon || cult || green || enter || com || art) query += ',';
                query += `{"type": "RESTAURANT"}`;
            }
            query += `]`;
        } else {
            query += '"status":"Activo"';
        }
        if (prov != '') {
            let prov_id = `"${prov}"`;
            //console.log(prov_id);
            query += `,"province": ` + prov_id + ``;
        }
        query += "}";
        //console.log(query);
        const queryJSON = JSON.parse(query);

        [places, total] = await Promise.all([
            Place.find(queryJSON).skip(desde).limit(registropp).collation({ locale: 'es' }).sort({ name: 1 }).populate('town'),
            Place.countDocuments(queryJSON)
        ]);

        // miramos la poblacion
        /*if (population != '' && population != 0) {
            places_aux = places;
            places = [];
            for (let i = 0; i < places_aux.length; i++) {
                if (places_aux[i].town.population > population) {
                    await places.push(places_aux[i]);
                }
            }
            total = places.length;
            console.log('Entro 84');
        }*/

        res.json({
            ok: true,
            message: 'Here are all the places',
            places,
            //allplaces,
            page: {
                desde,
                registropp,
                total
            }
        });
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo todos los lugares de interés'
        });
    }
}

const getPlaces = async(req, res) => {

    const id = req.query.id;
    const name = req.query.name;
    const town = req.query.town;

    const desde = Number(req.query.since) || 0;
    const registropp = Number(process.env.DOCSPERPAGE);

    let text_search = '';
    const text = req.query.texto || '';
    if (text !== '') {
        text_search = new RegExp(text, 'i');
    }
    //console.log(id);
    try {

        const token = req.header('x-token');

        let places = '';
        let reviews = '';
        let query = {};

        if ( /*userr.rol*/ token != "" && (infoToken(token).rol === 'ROL_COMMERCE' || infoToken(token).rol === 'ROL_USER')) {
            const userr = await User.findById(infoToken(token).uid);
            if (id) {

                [places, total] = await Promise.all([
                    Place.findById(id).populate('reviews').populate('town').populate('user', '-v -password -activation_code'),
                    Place.countDocuments()
                ]);

                //reviews = await Review.find({ place: id }).populate('user', '-v -password -activation_code');

                if (infoToken(token).rol === 'ROL_USER') {
                    //console.log("visitassss");
                    //SUMAR VISITAS CUANDO UN USER HACE UN GET CON ID
                    var object = new Object();
                    var fecha = new Date();
                    var mes = fecha.getMonth();
                    let lugar = await Place.findById(id);
                    object = lugar;
                    object.visits[mes] = lugar.visits[mes] + 1;
                    lugar = await Place.findByIdAndUpdate(id, object, { new: true });
                    await lugar.save();
                    //console.log("mes");
                }

            } else {
                if (text) {
                    query = { user: userr, $or: [{ name: text_search }, { description: text_search }] };
                } else {
                    query = { user: userr };
                }
                if(infoToken(token).rol === 'ROL_USER'){
                    [places, total] = await Promise.all([
                        Place.find(query).skip(desde).limit(registropp).collation({ locale: 'es' }).sort({ name: 1 }).populate('town').populate('user', '-v -password -activation_code'),
                        Place.countDocuments(query)
                    ]);
                } else{
                    [places, total] = await Promise.all([
                        Place.find(query).collation({ locale: 'es' }).sort({ name: 1 }).populate('town').populate('user', '-v -password -activation_code'),
                        Place.countDocuments(query)
                    ]);
                }
            }
        } else {

            if (id) {
                [places, total] = await Promise.all([Place.findById(id).populate('reviews'),
                    Place.countDocuments()
                ]);
                reviews = await Review.find({ place: id }).populate('user', '-v -password -activation_code');
                // console.log("Espero no romper las reviews");
                var object = new Object();
                var fecha = new Date();
                var mes = fecha.getMonth();
                let lugar = await Place.findById(id);
                object = lugar;
                object.visits[mes] = lugar.visits[mes] + 1;
                lugar = await Place.findByIdAndUpdate(id, object, { new: true });
                await lugar.save();

            } else if (town) {
                [places, total] = await Promise.all([
                    Place.find({ town: town }),
                    Place.countDocuments()
                ]);

            } else {
                let query = {};
                if (text) {
                    query = { $or: [{ name: text_search }, { description: text_search }] };
                }
                [places, total] = await Promise.all([
                    Place.find(query).skip(desde).limit(registropp).collation({ locale: 'es' }).sort({ name: 1 }).populate('town').populate('user', '-v -password -activation_code'),
                    Place.countDocuments(query)
                ]);
            }
        }
        
        let query2 = {};
        if(text_search != ''){
            query2 = { $or: [{ name: text_search }, { description: text_search }] };
        }
        [allplaces] = await Promise.all([
            Place.find(query2).collation({ locale: 'es' }).sort({ name: 1 }).populate('town')
        ]);
        
        //Cambiamos el modelo a número
        /*for(let i = 0; i < allplaces.length; i++){
            const place = await Place.findById(allplaces[i]._id);
            const numero = Math.floor(Math.random() * (4 - 1) + 1);
            place.model = numero;
            await place.save();
            console.log(place);
        }*/
        /*añadimos la provincia al lugar
        for(let i = 0; i < allplaces.length; i++){
            const city = await Town.findById(allplaces[i].town._id);
            const province = await Province.findById(city.province);
            console.log(province);
            const place = await Place.findById(allplaces[i]._id);
            console.log(place._id);
            place.province = province._id;
            await place.save();
        }
        console.log(allplaces);*/
        res.json({
            ok: true,
            message: 'Here are all the places',
            places,
            allplaces,
            page: {
                desde,
                registropp,
                total
            }
        });
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo todos los lugares de interés'
        });
    }
}

const payLugar = async(req, res) => {
    try {
        const { cantidad, factura, premium } = req.body;
        const placeBD = await Place.findById(req.params.id);

        placeBD.register.push(factura + " " + req.params.id + " " + premium + " " + cantidad);
        //placeBD.status = "Activo";
        await placeBD.save();
        res.json({
            ok: true,
            msg: 'Todo okey'
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error en editar factura'
        });
    }
}


const getAllPlaces = async(req, res) => {

    try {
        const token = req.header('x-token');
        let places = '';

        [places] = await Promise.all([Place.find({}).sort({ name: 1 }).populate('town').populate('user')]);

        res.json({
            ok: true,
            message: 'Here are all the places',
            places,

        });
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo todos los lugares de interés'
        });
    }

}

const getPlacesByCommerce = async(req, res) => {

    const order = req.query.order;

    try {
        const token = req.header('x-token');
        let places = '';

        const user = await User.findById(infoToken(token).uid);

        if(!user){
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe'
            });
        }

        if (user.rol !== 'ROL_COMMERCE' && user.rol !== 'ROL_ADMIN') {
            return res.status(400).json({
                ok: false,
                msg: 'Esto es información solo para clientes y administradores'
            });
        }

        let query = {user: user._id };
        let sort = { name: 1 };
        if(order == 'MEDIA_VAL_HIGH' ){ sort = { media_reviews: -1 } } 
        else if(order == 'MEDIA_VAL_LOW'){ sort = { media_reviews: 1 } }

        if(order == 'MEDIA_VAL_LOW' || order == 'MEDIA_VAL_HIGH' ){
            [places] = await Promise.all([Place.find(query).sort(sort).skip(0).limit(5)]);
        } else {
            [places] = await Promise.all([Place.find(query).sort(sort)]);
        }

        res.json({
            ok: true,
            message: 'Here are all the places',
            places,
        });
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo todos los lugares de interés'
        });
    }

}

const getPlacesByTown = async(req, res) => {

    const order = req.query.order || '';
    const town = req.query.town;

    const desde = Number(req.query.since) || 0;
    const registropp = 6;

    let text_search = '';
    const text = req.query.texto || '';
    let total = 0;

    //const population = req.query.population || '';
    const review = Number(req.query.review) || 0;

    try {

        let places = '';
        
        if(text != ''){
            text_search = new RegExp(text, 'i');
            if(review > 0){
                query = { town: town, status: 'Activo', $or: [{ name: text_search }, { description: text_search }], media_reviews: { $gte: review} }; 
            }
            else{
                 query = { town: town, status: 'Activo', $or: [{ name: text_search }, { description: text_search }] }; 
            }
        } else{
            if(review > 0){
                query = { town: town, status: 'Activo', media_reviews: { $gte: review}}; 
            } else{
                query = { town: town, status: 'Activo' }; 
            }
        }

        //let query = { town: town, status: 'Activo'};
        let sort = { name: 1 };

        if(order == 'MORE_VALUE' ){ sort = { media_reviews: -1 } } 
        else if(order == 'LESS_VALUE'){ sort = { media_reviews: 1 } }

        [places, total] = await Promise.all([
            Place.find(query).skip(desde).limit(registropp).sort(sort),
            Place.countDocuments(query)
        ]);

        res.json({
            ok: true,
            message: 'Here are all the places',
            places,
            page: {
                desde,
                registropp,
                total
            }
        });
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo todos los lugares de interés'
        });
    }

}


const createPlace = async(req, res = response) => {

    const { name, ...object } = req.body;

    try {

        const token = req.header('x-token');
        const user = await User.findById(infoToken(token).uid);
        const town = await Town.findById(req.body.town);

        if (infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).rol !== 'ROL_COMMERCE') {
            return res.status(400).json({
                ok: false,
                msg: 'You do not having permissions to update towns',
            });
        }

        if (object.mobile_number.length !== 9) {
            return res.status(400).json({
                ok: false,
                msg: 'El número de télefono tiene que tener 9 dígitos'
            });
        }

        if (object.mobile_number <= 599999999 || object.mobile_number >= 1000000000) {
            return res.status(400).json({
                ok: false,
                msg: 'El número de télefono tiene que ser mayor que 599999999 y menor que 800000000'
            });
        }

        if(!object.model){
            object.model = 1;
        }

        if (object.model != 1 && object.model != 2 && object.model != 3 && object.model != 4) {
            console.log(object.model);
            return res.status(400).json({
                ok: false,
                msg: 'Solo hay 3 tipos de modelos'
            });
        }

        if (!town) {
            return res.status(400).json({
                ok: false,
                msg: 'La ciudad no existe'
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe'
            });
        }

        if (user.rol !== 'ROL_COMMERCE' && user.rol !== 'ROL_ADMIN') {
            return res.status(400).json({
                ok: false,
                msg: 'Solo pueden crear lugares los comerciantes y los administradores'
            });
        }

        const place = new Place(req.body);

        place.province = town.province;
        place.status = "En revisión";
        place.media_reviews = 1;
        place.user = user;
        await user.commercePlace.push(place._id);
        if(user.rol === 'ROL_ADMIN'){
            place.status = 'Activo';
        }
        await user.save();
        place.pictures = [];
        await town.places.push(place._id);
        await town.save();
        await place.save();

        

        res.json({
            ok: true,
            msg: 'El lugar de interés: ' + name + ' ha sido creado',
            place,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando un lugar de interés'
        });
    }
}

const updatePlace = async(req, res = response) => {


    const {...object } = req.body;
    const uid = req.params.id;

    try {
        const token = req.header('x-token');

        // Comprobar si existe el lugar que queremos actualizar
        const exists_l = await Place.findById(uid);

        if (!exists_l) {
            return res.status(400).json({
                ok: false,
                msg: 'El lugar de interés no existe'
            });
        }

        if (infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).uid.toString() !==  exists_l.user.toString()) {
            return res.status(400).json({
                ok: false,
                msg: 'You do not having permissions to update towns',
            });
        }

        if (object.model && object.model != 1 && object.model != 2 && object.model != 3) {
            return res.status(400).json({
                ok: false,
                msg: 'Solo hay 3 tipos de modelos'
            });
        }

        let str = object.mobile_number.toString();
        if (str.length != 9) {
            console.log('entro');
            return res.status(400).json({
                ok: false,
                msg: 'El número de télefono tiene que tener 9 dígitos'
            });
        }

        if (object.mobile_number <= 599999999 || object.mobile_number >= 1000000000) {
            return res.status(400).json({
                ok: false,
                msg: 'El número de télefono tiene que ser mayor que 599999999 y menor que 800000000'
            });
        }

        if (!object.town) {
            return res.status(400).json({
                ok: false,
                msg: 'Tienes que seleccionar una ciudad'
            });
        }
        
        //este es el pueblo actual al cual pertenece el lugar
        const town1 = await Town.findById(exists_l.town);

        if (!town1) {
            return res.status(400).json({
                ok: false,
                msg: 'La ciudad no existe'
            });
        }
        //si el pueblo que nos llega es distinto del actual, se realiza esta accion
        if (object.town.toString() !== exists_l.town.toString()) {
            //Este es el nuevo pueblo al que pertenece el lugar
            const town2 = await Town.findById(object.town);
            if (!town2) {
                return res.status(400).json({
                    ok: false,
                    msg: 'La ciudad no existe'
                });
            }
            //se realizan los cambios pertinentes
            await town1.places.remove(exists_l._id);
            await town1.save();
            await town2.places.push(exists_l._id);
            await town2.save();
            //console.log(town2.province);
            //console.log(object.province);
            object.province = town2.province;
            //console.log(object.province);
            //falta volcar todas las valoraciones de este lugar a esta provincia
            let quer = { place: exists_l._id };
            let revws = await Review.find(quer);
            for (let i = 0; i < revws.length; i++) {
                const revw = await Review.findById(revws[i]._id);
                revw.province = object.province;
                await revw.save();
            }
        }
        //object.name = name;
        object.status = "En revisión";
        if(infoToken(token).rol === 'ROL_ADMIN'){
            object.status = 'Activo';
        }
        const place = await Place.findByIdAndUpdate(uid, object, { new: true });

        //place.province = object.province;
        //await place.save();

        res.json({
            ok: true,
            msg: 'place updated',
            place
        });

    } catch (error) {


        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error modificando lugar'
        });
    }

}

const acceptPlace = async(req, res = response) => {

    var object = new Object();
    const uid = req.params.id;

    try {


        const exists_l = await Place.findById(uid);

        if (!exists_l) {
            return res.status(400).json({
                ok: false,
                msg: 'El lugar de interés no existe'
            });
        }


        object.status = 'Desactivado';

        const place = await Place.findByIdAndUpdate(uid, object, { new: true });

        res.json({
            ok: true,
            msg: 'place updated',
            place
        });

    } catch (error) {

        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error modificando lugar'
        });
    }

}

const activatePlace = async(req, res = response) => {

    var object = new Object();
    const uid = req.params.id;

    try {


        const exists_l = await Place.findById(uid);

        if (!exists_l) {
            return res.status(400).json({
                ok: false,
                msg: 'El lugar de interés no existe'
            });
        }

        if (exists_l.status != 'Desactivado') {
            return res.status(400).json({
                ok: false,
                msg: 'El lugar no estaba desactivado'
            });
        }



        object.published = true;
        object.status = 'Activo';

        const place = await Place.findByIdAndUpdate(uid, object, { new: true });

        res.json({
            ok: true,
            msg: 'place updated',
            place
        });

    } catch (error) {

        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error modificando lugar'
        });
    }

}


const deactivatePlace = async(req, res = response) => {

    var object = new Object();
    const uid = req.params.id;

    try {


        const exists_l = await Place.findById(uid);

        if (!exists_l) {
            return res.status(400).json({
                ok: false,
                msg: 'El lugar de interés no existe'
            });
        }

        if (exists_l.status != 'Activo') {
            return res.status(400).json({
                ok: false,
                msg: 'El lugar no estaba activado'
            });
        }



        object.published = false;
        object.status = 'Desactivado';

        const place = await Place.findByIdAndUpdate(uid, object, { new: true });

        res.json({
            ok: true,
            msg: 'place updated',
            place
        });

    } catch (error) {

        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error modificando lugar'
        });
    }

}

const denyPlace = async(req, res = response) => {

    var object = new Object();
    const uid = req.params.id;
    const fb = req.params.fb;



    try {


        const exists_l = await Place.findById(uid);

        if (!exists_l) {
            return res.status(400).json({
                ok: false,
                msg: 'El lugar de interés no existe'
            });
        }


        object.published = false;
        object.status = 'Rechazado';
        object.fb = fb;

        const place = await Place.findByIdAndUpdate(uid, object, { new: true });

        res.json({
            ok: true,
            msg: 'place updated',
            place
        });

    } catch (error) {

        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error modificando lugar'
        });
    }

}

const deletePlace = async(req, res = response) => {

    const uid = req.params.id;

    try {

        const token = req.header('x-token');
        // Comprobamos si existe el lugar que queremos borrar
        const exists_t = await Place.findById(uid);
        let userID = exists_t.user;
        let townID = exists_t.town;

        if (!exists_t) {
            return res.status(400).json({
                ok: true,
                msg: 'El lugar de interés no existe'
            });
        }

        //solo un admin o el propio usuario puede eliminar un lugar
        if (infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).uid.toString() !==  exists_t.user.toString()) {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        
        const user = await User.findById(userID);

        if (user) {
            /*return res.status(400).json({
                ok: true,
                msg: 'Este usuario no existe'
            });*/
            //Eliminamos del array de comerciantes el lugar en caso de que no haya sido desarrollado por un administrador
            if (user.rol == 'ROL_COMMERCE' || user.rol == 'ROL_ADMIN') {
                await user.commercePlace.remove(exists_t._id);
                await user.save();
            }
        }
        //buscamos la ciudad a la que pertenece este lugar
        const town = await Town.findById(townID);
        //comprobamos que el lugar existe
        if (town) {
            /*return res.status(400).json({
                ok: true,
                msg: 'La ciudad no existe'
            });*/
            //Eliminamos el lugar del array de lugares de la ciudad a la que pertene
            await town.places.remove(exists_t._id);
            await town.save();
        }

        //añadimos a la query el lugar para comprobar cuantos usuarios lo tienen dentro de sus favoritos.
        let query = { favorites: exists_t };

        let users, total;
        [users, total] = await Promise.all([
            User.find(query).populate('favorites').populate('travels').collation({ locale: 'es' }),
            User.countDocuments(query)
        ]);

        //arriba compruebo los usuarios que tienen como favorito este lugar, y abajo los elimino de dichos usuarios
        if (total > 0) {
            for (let i = 0; i < users.length; i++) {
                if (users[i].favorites.length > 0) {
                    for (let j = 0; j < users[i].favorites.length; j++) {
                        if (users[i].favorites[j]._id.toString() == exists_t._id.toString()) {
                            await users[i].favorites.remove(exists_t._id);
                            await users[i].save();
                        }
                    }
                }
            }
        }

        //aqui eliminamos de los viajes el lugar que estamos tratando eliminar

        let query_travels = { places: exists_t };

        let travels, totals;
        [travels, totals] = await Promise.all([
            Travel.find(query_travels).collation({ locale: 'es' }),
            Travel.countDocuments(query_travels)
        ]);

        if (totals > 0) {
            for (let i = 0; i < travels.length; i++) {
                for (let j = 0; j < travels[i].places.length; j++) {
                    if (travels[i].places[j]._id.toString() == exists_t._id.toString()) {
                        await travels[i].places.remove(exists_t._id);
                        await travels[i].save();
                        if (travels[i].places.length === 0) {
                            const rt = await deleteTRV(travels[i]._id);
                            if (rt !== 'OK') {
                                return res.status(400).json({
                                    ok: false,
                                    msg: rt
                                });
                            }
                            await Travel.findByIdAndRemove(travels[i]._id);
                        }
                    }
                }
            }
        }
        //Eliminamos las imagenes de los lugares;
        if (exists_t.pictures.length > 0) {
            const path = `${process.env.PATH_UPLOAD}/fotoplace`;
            for (let i = 0; i < exists_t.pictures.length; i++) {
                const path_file = `${path}/${exists_t.pictures[i]}`;
                exists_t.pictures.remove(i);
                if (fs.existsSync(path_file)) {
                    fs.unlinkSync(path_file);
                }
            }
        }

        //aqui debemos borrar las valoraciones del lugar que borremos

        let query_place = { place: exists_t };

        let revws, total_revws;
        [revws, total_revws] = await Promise.all([
            Review.find(query_place).collation({ locale: 'es' }),
            Review.countDocuments(query_place)
        ]);

        if (total_revws > 0) {
            for (let i = 0; i < revws.length; i++) {
                if (revws[i].place._id.toString() == exists_t._id.toString()) {
                    const rr = await deleteREVW(revws[i]._id);
                    if (rr !== 'OK') {
                        return res.status(400).json({
                            ok: false,
                            msg: rr
                        });
                    }
                    await Review.findByIdAndRemove(revws[i]._id);
                }
            }
        }

        const result = await Place.findByIdAndRemove(uid);

        res.json({
            ok: true,
            msg: 'Place has been eliminated',
            result: result,
            users,
            revws
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: true,
            msg: 'Error eliminando el lugar de interés'
        });
    }
}

const searchPlace = async(req, res) => {


    const text_search = req.params.name;
    console.log(text_search);
    const var1 = text_search.toString();

    try {




        //let places = await Promise.all([Place.find(query)]);
        let places2 = await Place.find({ "name": { $regex: ".*" + text_search + ".*", $options: 'i' } });

        //console.log(places);
        console.log(places2);
        if (!places2) {
            return res.status(400).json({
                ok: false,
                msg: 'El lugar de interés no existe'
            });
        }


        res.json({
            ok: true,
            message: 'Here are all the places',
            places2
        });

    } catch (error) {

        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo los lugares de interés'
        });
    }

}

module.exports = { getPlaces, getAllPlaces, getPlacesByCommerce, getPlacesByTown, createPlace, updatePlace, deletePlace, acceptPlace, searchPlace, denyPlace, activatePlace, deactivatePlace, getPlacesByFiltersBar, payLugar }