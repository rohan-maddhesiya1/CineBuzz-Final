import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    image: {type: String, default: ''},
    role: {type: String, enum: ['user', 'admin'], default: 'user'},
    isMember: { type: Boolean, default: false },
    membershipType: { type: String, default: null },
    membershipStart: { type: Date, default: null },
    membershipEnd: { type: Date, default: null },
    membershipPaymentId: { type: String, default: null },
    favorites: [{type: String}]
}, {timestamps: true})

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema)

export default User;