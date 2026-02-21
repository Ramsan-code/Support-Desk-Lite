import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'missing your name'],
    },
    email: {
        type: String,
        required: [true, 'missing your email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            ' missing your email',
        ],
    },
    password: {
        type: String,
        required: [true, 'not match your password'],
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: ['Customer', 'Agent', 'Admin'],
        default: 'Customer',
    },
}, {
    timestamps: true,
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
