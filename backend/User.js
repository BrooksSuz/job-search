import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.pasword = await bcrypt.hash(this.password, 12);

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

export default mongoose.model('User', userSchema);