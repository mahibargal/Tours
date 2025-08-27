const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please provide a password"],
        validate: {
            //This only works on CREATE and SAVE!
            validator: function (el) {
                return this.password == el
            },
            message: "Password should matched!"
        }
    },
    passwordChangedAt:Date
    //  {
    //     type: Date,
    //     // default:new Date()
    // }
    ,
    passwordResetToken: String,
    passWordTokenResetExpires: Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined; //dont send passwordConfirm
    next();
})

userSchema.pre('save',function(next){
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now()-1000;
    next();

})

userSchema.pre(/^find/, function (next) {
    //this points to ucrrent quesry
    this.find({ active: { $ne: false } })
    next();
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.passwordChangeAfterJwtIssued = function (jwtIssuedTime) {
    if (this.passwordChangedAt) {
        const passChangeTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return passChangeTime > jwtIssuedTime;
    }
    //Pass not change
    return false;
}
userSchema.methods.createPasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log({ resetToken }, `hashToken= ${this.passwordResetToken}`)

    this.passWordTokenResetExpires = Date.now() + 10 * 60 * 1000;  //10min
    return resetToken;

}
const User = mongoose.model('User', userSchema);
module.exports = User;