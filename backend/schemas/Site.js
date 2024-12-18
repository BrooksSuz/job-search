import mongoose from 'mongoose';

const siteSchema = new mongoose.Schema({
  siteName: { type: String, required: true },
  consent: { type: String },
  errorMessages: { type: [String] },
  isAnchor: { type: Boolean },
  listing: { type: String },
  nextPageDisabled: { type: String },
  nextPageLink: { type: String },
  nextPageParent: { type: String },
  url: { type: String },
  timeout: { type: Number },
});

export default mongoose.model('Site', siteSchema, 'sites');
