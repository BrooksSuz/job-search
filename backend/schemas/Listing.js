import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
	org: { type: String, required: true, unique: true },
	url: { type: String, required: true },
});

export default mongoose.model('Listing', listingSchema, 'listings');
