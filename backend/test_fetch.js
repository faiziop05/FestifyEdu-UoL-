const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./src/models/users");
const Dataset = require("./src/models/datasets");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const superadmin = await User.findOne({ role: "super_admin" });
  const datasets = await Dataset.find({ teacher_id: superadmin._id }).lean();
  console.log("Dataset 0 teacher_id type:", typeof datasets[0].teacher_id.toString());
  console.log("Dataset 0 teacher_id match:", datasets[0].teacher_id.toString() === superadmin._id.toString());
  console.log("Dataset 0 parsed_data type:", typeof datasets[0].parsed_data);
  if (datasets[0].parsed_data) console.log("Keys:", Object.keys(datasets[0].parsed_data));
  process.exit(0);
})();
