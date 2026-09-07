const mongoose = require("mongoose");

const organizationsSchema = new mongoose.Schema(
  {
    organization_name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postcode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
    },
    subscription_status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    subscription_end_date: {
      type: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Organizations", organizationsSchema);
