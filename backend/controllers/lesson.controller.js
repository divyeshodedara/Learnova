const prisma = require("../lib/prisma");
const cloudinary = require("../lib/cloudinary");

exports.getLessons = async (req, res) => {
  try {
    const { id: courseId } = req.params; // from /api/courses/:id/lessons
    
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
       return res.status(404).json({ success: false, error: "Course not found" });
    }

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: { attachments: true }
    });

    res.json({ success: true, count: lessons.length, data: lessons });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ success: false, error: "Failed to fetch lessons" });
  }
};

exports.addLesson = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { title, type, description, order, videoUrl, duration, allowDownload, responsibleName } = req.body;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
       return res.status(404).json({ success: false, error: "Course not found" });
    }

    let fileUrl = null;
    let fileKey = null;

    if (req.file) {
      fileUrl = req.file.path;
      fileKey = req.file.filename;
    }

    const data = {
      courseId,
      title,
      type: type || "VIDEO",
      order: order ? parseInt(order) : 0,
      allowDownload: allowDownload === 'true' || allowDownload === true,
    };

    if (description) data.description = description;
    if (videoUrl) data.videoUrl = videoUrl;
    if (duration) data.duration = parseInt(duration);
    if (responsibleName) data.responsibleName = responsibleName;
    if (fileUrl) data.fileUrl = fileUrl;
    if (fileKey) data.fileKey = fileKey;

    const lesson = await prisma.lesson.create({ data });

    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    console.error("Error adding lesson:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to add lesson" });
  }
};

exports.editLesson = async (req, res) => {
  try {
    const { id } = req.params; // lesson id
    const { title, type, description, order, videoUrl, duration, allowDownload, responsibleName } = req.body;

    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    let updateData = {
        title,
        type,
        description,
        order: order !== undefined ? parseInt(order) : undefined,
        videoUrl,
        duration: duration !== undefined ? parseInt(duration) : undefined,
        allowDownload: allowDownload !== undefined ? (allowDownload === 'true' || allowDownload === true) : undefined,
        responsibleName
    };

    if (req.file) {
      updateData.fileUrl = req.file.path;
      updateData.fileKey = req.file.filename;

      if (existing.fileKey) {
        await cloudinary.uploader.destroy(existing.fileKey);
      }
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data: updateData
    });

    res.json({ success: true, data: lesson });
  } catch (error) {
    console.error("Error editing lesson:", error);
    res.status(500).json({ success: false, error: "Failed to edit lesson" });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await prisma.lesson.findUnique({ where: { id } });

    if (!lesson) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    if (lesson.fileKey) {
      await cloudinary.uploader.destroy(lesson.fileKey);
    }

    await prisma.lesson.delete({ where: { id } });

    res.json({ success: true, message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({ success: false, error: "Failed to delete lesson" });
  }
};

exports.addAttachment = async (req, res) => {
  try {
    const { id: lessonId } = req.params;
    const { type, label, linkUrl } = req.body;

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
       return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    let fileUrl = null;
    let fileKey = null;

    if (req.file) {
      fileUrl = req.file.path;
      fileKey = req.file.filename;
    }

    const attachment = await prisma.lessonAttachment.create({
      data: {
        lessonId,
        type: type || "FILE",
        label,
        fileUrl,
        fileKey,
        linkUrl
      }
    });

    res.status(201).json({ success: true, data: attachment });
  } catch (error) {
    console.error("Error adding attachment:", error);
    res.status(500).json({ success: false, error: "Failed to add attachment" });
  }
};

exports.deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const attachment = await prisma.lessonAttachment.findUnique({ where: { id } });

    if (!attachment) {
      return res.status(404).json({ success: false, error: "Attachment not found" });
    }

    if (attachment.fileKey) {
      await cloudinary.uploader.destroy(attachment.fileKey);
    }

    await prisma.lessonAttachment.delete({ where: { id } });

    res.json({ success: true, message: "Attachment deleted successfully" });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    res.status(500).json({ success: false, error: "Failed to delete attachment" });
  }
};
