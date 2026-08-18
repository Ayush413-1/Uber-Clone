const capatainModel= require("../model/captain.model");

module.exports.craeteCaptain = async({
    firstname,
    lastname,
    email,
    password,
    color,
    plate,
    capacity,
    vehicleType
})=>{
    if(!firstname || !email || !password || !color || !plate || !capacity || !vehicleType){
        throw new Error('All fields are required');
    }
    const captain =  capatainModel.create({
        fullname:{
            firstname,
            lastname
        },
        email,
        password,
        vehicle:{
            color,
            plate,
            capacity,
            vehicleType
        }
    })
    return captain;
}