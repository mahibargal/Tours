const User = require("../models.js/userModel")
const catchAsync = require("../utils/catchAsync")




const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(elm => {

        if (allowedFields.includes(elm)) {
            newObj[elm] = obj[elm];
        }

    })
    return newObj;
}

exports.getAllUsers = catchAsync(async(req, res) => {


const users = await User.find();

    res.status(200).json({ 
        status:'success',
        results:users.length,
    data:{
        users
    }    
    })
})
exports.getUserWithId = (req, res) => {
    res.status(500).json({ message: 'route not defined yet!' })
}
exports.updateUserWIthId = (req, res) => {
    res.status(500).json({ message: 'route not defined yet!' })
}
exports.deleteUser = (req, res) => {
    res.status(500).json({ message: 'route not defined yet!' })
}
exports.addUser = (req, res) => {
    res.status(500).json({ message: 'route not defined yet!' })
}

exports.updateUser = catchAsync( async(req,res,next)=>{
    const user = req.user;
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError("This api is not for update user password",400))
    }

    const filteredBody = filterObj(req.body,'name','email');

    console.log(filteredBody,user)
    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        filteredBody,
        {
            new: true,
            runValidators: true
        }
    )

    res.status(200).json({
        status:'success',
        data:{
            user:updatedUser
        }
    })

})

exports.deleteUser = catchAsync(async(req,res,next)=>{

    await User.findByIdAndUpdate(req.user._id, { active: false });

    res.status(204).json({
        status:'success',
    })

})