const prisma = require("../lib/prisma");
const slugify = require("../utils/slugify");
const { z } = require("zod");

// Zod schemas for manual validation within controller, 
// though we also have a validation middleware, we'll parse here for simplicity 
// or one can use middleware. Let's do it manually to return clear errors.

const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  shortDesc: z.string().optional(),
  coverImageUrl: z.string().url().optional(),
  visibility: z.enum(["EVERYONE", "SIGNED_IN"]).optional(),
  accessRule: z.enum(["OPEN", "ON_INVITATION", "ON_PAYMENT"]).optional(),
  price: z.number().nonnegative().optional(),
  tags: z.array(z.string()).optional(), // Array of Tag IDs
});

const updateCourseSchema = createCourseSchema.partial();

exports.createCourse = async (req, res) => {
  try {
    const parsed = createCourseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors });
    }

    const data = parsed.data;
    const userId = req.user.userId;

    let baseSlug = slugify(data.title);
    let slug = baseSlug;
    let count = 1;
    
    // Ensure unique slug
    while (await prisma.course.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const newCourse = await prisma.course.create({
      data: {
        title: data.title,
        slug: slug,
        description: data.description,
        shortDesc: data.shortDesc,
        coverImageUrl: data.coverImageUrl,
        visibility: data.visibility || "EVERYONE",
        accessRule: data.accessRule || "OPEN",
        price: data.price,
        createdById: userId,
        adminId: userId, // assign creator as admin initially
        tags: data.tags?.length ? {
          create: data.tags.map(tagId => ({
            tag: { connect: { id: tagId } }
          }))
        } : undefined
      },
      include: { tags: { include: { tag: true } } }
    });

    res.status(201).json({ success: true, data: newCourse });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ success: false, error: "Failed to create course" });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const { search, isPublished } = req.query;
    
    const where = {};
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    if (isPublished !== undefined) {
      where.isPublished = isPublished === 'true';
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        tags: { include: { tag: true } }
      }
    });

    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ success: false, error: "Failed to fetch courses" });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        tags: { include: { tag: true } },
        lessons: { orderBy: { order: 'asc' } }
      }
    });

    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ success: false, error: "Failed to fetch course" });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = updateCourseSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors });
    }

    const data = parsed.data;

    // Check if course exists
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    // if tags are provided, we should ideally replace existing ones.
    let tagsUpdate = undefined;
    if (req.body.tags !== undefined) {
      tagsUpdate = {
        deleteMany: {}, // Clear existing
        create: req.body.tags.map(tagId => ({
          tag: { connect: { id: tagId } }
        }))
      };
    }

    let nextSlug = existing.slug;
    if (data.title && data.title !== existing.title) {
       let baseSlug = slugify(data.title);
       nextSlug = baseSlug;
       let count = 1;
       while (await prisma.course.findFirst({ where: { slug: nextSlug, NOT: { id } } })) {
         nextSlug = `${baseSlug}-${count}`;
         count++;
       }
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        title: data.title,
        slug: nextSlug,
        description: data.description,
        shortDesc: data.shortDesc,
        coverImageUrl: data.coverImageUrl,
        visibility: data.visibility,
        accessRule: data.accessRule,
        price: data.price,
        tags: tagsUpdate
      },
      include: { tags: { include: { tag: true } } }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ success: false, error: "Failed to update course" });
  }
};

exports.togglePublishCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished, websiteUrl } = req.body;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    if (isPublished && (!websiteUrl && !course.websiteUrl)) {
       return res.status(400).json({ success: false, error: "websiteUrl is required when publishing a course" });
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        isPublished: isPublished,
        publishedAt: isPublished ? (course.publishedAt || new Date()) : null,
        websiteUrl: websiteUrl !== undefined ? websiteUrl : course.websiteUrl
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error toggling course publish status:", error);
    res.status(500).json({ success: false, error: "Failed to toggle publish status" });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if course exists
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
       return res.status(404).json({ success: false, error: "Course not found" });
    }

    await prisma.course.delete({ where: { id } });

    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ success: false, error: "Failed to delete course" });
  }
};
