
const User = require('../models/user');
const Travel = require('../models/travel');
const { infoToken } = require('../helpers/infotoken');
const fs = require('fs');


const deleteTRV = async(uid) => {


const exists_tra = await Travel.findById(uid);

if (!exists_tra) {
    return 'El viaje no existe';
}

//Vamos a eliminar de usuarios este viaje
const user = await User.findById(exists_tra.user);

let bool_user = false;

if (user) {
    if(user.travels.length > 0){    
        for(let i = 0; i < user.travels.length; i++){
            if(user.travels[i]._id.toString() === exists_tra._id.toString()){
                user.travels.remove(exists_tra._id);
            }
        }
    }   
    await user.save();
    bool_user = true;
}

if(!bool_user){
    const user = await User.find({travels: exists_tra});
    if(user.length === 1){
        if(user[0].travels.length > 0){
            await user[0].travels.remove(exists_tra._id);
            await user[0].save();
        }
    }
}

//eliminamos sus imágenes
if(exists_tra.pictures.length > 0){
    const path = `${process.env.PATH_UPLOAD}/fototravel`;
    for (let i = 0; i < exists_tra.pictures.length; i++){
        const path_file = `${path}/${exists_tra.pictures[i]}`;
        if(fs.existsSync(path_file)){
            fs.unlinkSync(path_file);
        }
    }
}

return 'OK';

}

module.exports = { deleteTRV }