const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "First name is required"],
        unique: true,
        index: true,
        minlength: [2, "First name must be at least 2 characters long"],
        maxlength: [50, "First name must be less than 50 characters long"],
    },
    lastname: {
        type: String,
        required: [true, "Last name is required"],
        unique: true,
        index: true,
        minlength: [2, "Last name must be at least 2 characters long"],
        maxlength: [50, "Last name must be less than 50 characters long"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email address"
        ],
    },
    mobile: {
        type: String,
        required: [true, "Mobile number is required"],
        unique: true,
        match: [
            /^[0-9]{10}$/,
            "Please enter a valid 10-digit mobile number"
        ],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
        type: String,
        default: 'user'
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    cart: {
        type: Array,
        default: []
    },
    address: {
        type: String,
    },
    wishList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    refreshToken: {
        type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordExpires: Date

}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createPasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest("hex");
    this.passwordExpires = Date.now() + 30 * 60 * 1000;
    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
