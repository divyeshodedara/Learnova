const prisma = require("../lib/prisma");

exports.getTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, count: tags.length, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch tags" });
  }
};

exports.createTag = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: "Tag name is required" });
    }

    const existing = await prisma.tag.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ success: false, error: "Tag already exists" });
    }

    const tag = await prisma.tag.create({
      data: { name }
    });

    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    console.error("Tag creation error:", error);
    res.status(500).json({ success: false, error: "Failed to create tag" });
  }
};
