const { response } = require('express');
const allowed_places = ['RESTAURANT', 'MONUMENTS', 'GREEN_ZONE', 'ENTERTAINMENT', 'COMMERCES', 'ART_AND_CULTURE', 'CHURCH_PLACES'];

const validate_type_place = (req, res = response, next) => {

    const typePlace = req.body.type;

    if (typePlace && !allowed_places.includes(typePlace)) {
        return res.status(400).json({
            ok: false,
            msg: `Los lugares solo pueden tener uno de los siguientes tipos: 
            Restauración, Monumentos, Zonas verdes, Entretenimiento, Comercios, Arte y cultura y Lugares de culto`
        });
    }
    
    next();
}

module.exports = { validate_type_place }