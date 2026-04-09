const Community = require("../models/G_Community");

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