const mongoose = require("mongoose");
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        unique:true,
        require:true
    },
    email: {
        type: String, require: true,
        unique: [true, "Email Id Is Already Presents"],
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email..")
            }
        }
    },
    phone: {
        type: Number,
        unique: true,
        min: 10,
        require: true
    },
    image:{
        type:String,
        require:true
    },
    created:{
        type:Date,
        require:true,
        default:Date.now,
    }
});


module.exports = mongoose.model("User",userSchema);
