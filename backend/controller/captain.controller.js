const captainModel = require('../model/captain.model');
const captainService = require("../services/captain.service");
const { valicationResult, validationResult } = require('express-validator')

module.exports.registerCaptain = async(req,res,next)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const {fullname, email, password, vehicle} = req.body;

    const isCaptainAlreadyExists = await captainModel.findOne({email});

    if(isCaptainAlreadyExists){
        return res.status(400).json({message: "Captain aready exist"});
    }

    const hashPassword = await captainModel.hashPassword(password);

    const captain = await captainService.craeteCaptain({
        firstname:fullname.firstname,
        lastname:fullname.lastname,
        email,
        password: hashPassword,
        color:vehicle.color,
        plate:vehicle.plate,
        capacity:vehicle.capacity,
        vehicleType: vehicle.vehicleType
    });

    const token = captain.generateAuthToken();

    res.status(201).json({ token, captain });
}
