const blacklistTokenModel = require('../model/blacklistToken.model');
const capatinModel = require('../model/captain.model');
const userModel = require('../model/user.model')
const jwt = require('jsonwebtoken')


module.exports.authUser = async(req,res,next) =>{
    const token = req.cookies?.token || (req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : null);

    if(!token){
        return res.status(401).json({message: 'Unauthorized'})
    }

    try{

    const isBlacklisted = await blacklistTokenModel.findOne({token: token});

    if(isBlacklisted){
        return res.status(401).json({ message: "Unauthorized"});
    }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       
        const user = await userModel.findById(decoded._id)

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        req.user = user;

        return next();

} 
catch(err){
        return res.status(401).json({message: 'Unauthorized'})
    }
}


module.exports.authCaptain = async(req,res,next) =>{
    const token =
        req.cookies?.token ||
        (req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : null);

    if(!token){
        return res.status(401).json({message: 'Unauthorized'})
    }

    try{
    const isBlacklisted = await blacklistTokenModel.findOne({token: token});

    if(isBlacklisted){
        return res.status(401).json({ message: "Unauthorized"});
    }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const captain = await capatinModel.findById(decoded._id)
            
            if (!captain) {
            return res.status(401).json({
                message: "Captain not found"
            });
        }
         
        req.captain=captain;

        next();
} 
catch(err){
         res.status(401).json({message: 'Unauthorized'})
    }
}