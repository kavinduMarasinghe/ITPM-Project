const Community = require("../models/G_Community");

const VALID_CATEGORIES = ["sports", "technology", "cultural", "community", "music", "academic", "other"];

const formatCommunity = (community) => ({
  _id: community._id,
  id: community._id.toString(),
  name: community.name,
  color: community.color,
  icon: community.icon,
  description: community.description,
  category: community.category,
  members: community.members
    ? community.members.map((member) => ({
        _id: member._id,
        id: member._id.toString(),
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        role: member.role,
      }))
    : [],
});

const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find({
      members: req.user._id,
    })
      .populate("members", "name email avatar role")
      .sort({ createdAt: -1 });

    res.json(communities.map(formatCommunity));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCommunity = async (req, res) => {
  try {
    const { name, color, icon, description, category, members } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Society name is required" });
    }

    const trimmedName = String(name).trim();

    if (trimmedName.length < 2) {
      return res.status(400).json({ message: "Society name must be at least 2 characters" });
    }

    if (trimmedName.length > 100) {
      return res.status(400).json({ message: "Society name must be less than 100 characters" });
    }

    if (!description || !String(description).trim()) {
      return res.status(400).json({ message: "Description is required" });
    }

    if (String(description).trim().length > 500) {
      return res.status(400).json({ message: "Description must be less than 500 characters" });
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: "Invalid category. Must be one of: " + VALID_CATEGORIES.join(", ") });
    }

    if (!icon) {
      return res.status(400).json({ message: "Icon is required" });
    }

    if (!color) {
      return res.status(400).json({ message: "Color is required" });
    }

    const duplicateName = await Community.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });

    if (duplicateName) {
      return res.status(409).json({ message: "A society with this name already exists" });
    }

    const creatorId = req.user._id.toString();

    const safeMembers = Array.isArray(members)
      ? [...new Set([creatorId, ...members.map(String)])]
      : [creatorId];

    const community = new Community({
      name,
      color,
      icon,
      description,
      category,
      members: safeMembers,
    });

    const saved = await community.save();

    const populated = await Community.findById(saved._id).populate(
      "members",
      "name email avatar role"
    );

    res.status(201).json(formatCommunity(populated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCommunity = async (req, res) => {
  try {
    const { name, color, icon, description, category, members } = req.body;

    const existingCommunity = await Community.findById(req.params.id);

    if (!existingCommunity) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (name !== undefined && name !== null) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return res.status(400).json({ message: "Society name cannot be empty" });
      }
      if (trimmedName.length < 2) {
        return res.status(400).json({ message: "Society name must be at least 2 characters" });
      }
      if (trimmedName.length > 100) {
        return res.status(400).json({ message: "Society name must be less than 100 characters" });
      }

      const duplicateName = await Community.findOne({
        _id: { $ne: existingCommunity._id },
        name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      });

      if (duplicateName) {
        return res.status(409).json({ message: "A society with this name already exists" });
      }
    }

    if (description !== undefined && description !== null) {
      if (!String(description).trim()) {
        return res.status(400).json({ message: "Description cannot be empty" });
      }
      if (String(description).trim().length > 500) {
        return res.status(400).json({ message: "Description must be less than 500 characters" });
      }
    }

    if (category !== undefined && category !== null) {
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ message: "Invalid category. Must be one of: " + VALID_CATEGORIES.join(", ") });
      }
    }

    const creatorId = req.user._id.toString();

    const safeMembers = Array.isArray(members)
      ? [...new Set([creatorId, ...members.map(String)])]
      : existingCommunity.members.map((m) => m.toString());

    existingCommunity.name = name ?? existingCommunity.name;
    existingCommunity.color = color ?? existingCommunity.color;
    existingCommunity.icon = icon ?? existingCommunity.icon;
    existingCommunity.description = description ?? existingCommunity.description;
    existingCommunity.category = category ?? existingCommunity.category;
    existingCommunity.members = safeMembers;

    const updated = await existingCommunity.save();

    const populated = await Community.findById(updated._id).populate(
      "members",
      "name email avatar role"
    );

    res.json(formatCommunity(populated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findByIdAndDelete(req.params.id);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    res.json({ message: "Community deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCommunities,
  createCommunity,
  updateCommunity,
  deleteCommunity,
};