const Organizations = require("../../models/organizations");
const dns = require("dns");
const util = require("util");
const resolveMx = util.promisify(dns.resolveMx);

const createOrganization = async (req, res) => {
  try {
    const {
      organization_name,
      address,
      city,
      postcode,
      country,
      domain,
      is_subscribed,
      subscription_end_date,
    } = req.body;

    if (
      !organization_name ||
      !address ||
      !city ||
      !postcode ||
      !country ||
      !domain
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    let cleanDomain = domain.toLowerCase().trim();
    cleanDomain = cleanDomain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/^@/, "");

    const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(cleanDomain)) {
      return res.status(400).json({
        success: false,
        message: "Invalid domain format. Please enter a valid domain (e.g. school.edu or organization.com).",
      });
    }

    const existingOrg = await Organizations.findOne({ domain: cleanDomain });
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: "Organization domain already exists",
      });
    }

    const organization = new Organizations({
      organization_name,
      address,
      city,
      postcode,
      country,
      domain: cleanDomain,
      subscription_status: is_subscribed ? "active" : "inactive",
      subscription_end_date: is_subscribed ? subscription_end_date : null,
    });
    await organization.save();

    return res.status(201).json({
      success: true,
      message: "Organization created successfully",
      organization,
    });
  } catch (error) {
    console.log("Error in createOrganization:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getAllOrganizations = async (req, res) => {
  try {
    let { page, limit, search } = req.query;

    if (limit) {
      limit = parseInt(limit);
    } else {
      limit = 20;
    }

    if (page) {
      page = parseInt(page);
    } else {
      page = 1;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      const organizations = await Organizations.find({
        $or: [
          { organization_name: regex },
          { address: regex },
          { city: regex },
          { postcode: regex },
          { country: regex },
          { domain: regex },
        ],
      })
        .skip((page - 1) * limit)
        .limit(limit);
      const count = await Organizations.countDocuments({
        $or: [
          { organization_name: regex },
          { address: regex },
          { city: regex },
          { postcode: regex },
          { country: regex },
          { domain: regex },
        ],
      });
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        message: "Organizations fetched successfully",
        organizations,
        totalPages,
      });
    }

    const organizations = await Organizations.find()
      .skip((page - 1) * limit)
      .limit(limit);
    const count = await Organizations.countDocuments();
    const totalPages = Math.ceil(count / limit);
    return res.status(200).json({
      success: true,
      message: "Organizations fetched successfully",
      organizations,
      totalPages,
    });
  } catch (error) {
    console.log("Error in getAllOrganizations:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      organization_name,
      address,
      city,
      postcode,
      country,
      domain,
      is_subscribed,
      subscription_end_date,
    } = req.body;
    const organization = await Organizations.findByIdAndUpdate(id, {
      organization_name,
      address,
      city,
      postcode,
      country,
      domain,
      subscription_status: is_subscribed ? "active" : "inactive",
      subscription_end_date: is_subscribed ? subscription_end_date : null,
    });
    if (!organization) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      organization,
    });
  } catch (error) {
    console.log("Error in updateOrganization:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const removeOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = await Organizations.findByIdAndDelete(id);
    if (!organization) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Organization deleted successfully",
      organization,
    });
  } catch (error) {
    console.log("Error in removeOrganization:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createOrganization,
  getAllOrganizations,
  updateOrganization,
  removeOrganization,
};
