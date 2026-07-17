import Department from './models/Department.js';
import { asyncHandler, generateDeptQR } from './helpers.js';

export const getAllDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true }).sort({ name: 1 });

  res.json({
    success: true,
    data: departments,
  });
});

export const getDepartmentBySlug = asyncHandler(async (req, res) => {
  const department = await Department.findOne({
    slug: req.params.slug.toLowerCase(),
    isActive: true,
  });

  if (!department) {
    return res.status(404).json({
      success: false,
      message: 'Department not found.',
      error: 'DEPT_NOT_FOUND',
    });
  }

  res.json({
    success: true,
    data: department,
  });
});

export const createDepartment = asyncHandler(async (req, res) => {
  const { name, slug, description } = req.body;

  if (!name || !slug) {
    return res.status(400).json({
      success: false,
      message: 'Name and slug are required.',
      error: 'MISSING_FIELDS',
    });
  }

  const exists = await Department.findOne({ slug: slug.toLowerCase().trim() });
  if (exists) {
    return res.status(400).json({
      success: false,
      message: 'A department with this slug already exists.',
      error: 'SLUG_EXISTS',
    });
  }

  const department = await Department.create({
    name: name.trim(),
    slug: slug.toLowerCase().trim(),
    description: description || '',
  });

  res.status(201).json({
    success: true,
    data: department,
    message: 'Department created',
  });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    return res.status(404).json({
      success: false,
      message: 'Department not found.',
      error: 'DEPT_NOT_FOUND',
    });
  }

  const { name, slug, description, isActive } = req.body;

  if (name !== undefined) department.name = name.trim();
  if (slug !== undefined) department.slug = slug.toLowerCase().trim();
  if (description !== undefined) department.description = description;
  if (isActive !== undefined) department.isActive = isActive;

  await department.save();

  res.json({
    success: true,
    data: department,
    message: 'Department updated',
  });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    return res.status(404).json({
      success: false,
      message: 'Department not found.',
      error: 'DEPT_NOT_FOUND',
    });
  }

  department.isActive = false;
  await department.save();

  res.json({
    success: true,
    data: department,
    message: 'Department deactivated',
  });
});

export const getDepartmentQR = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    return res.status(404).json({
      success: false,
      message: 'Department not found.',
      error: 'DEPT_NOT_FOUND',
    });
  }

  const qrDataUrl = await generateDeptQR(department.slug);

  res.json({
    success: true,
    data: {
      slug: department.slug,
      url: `${process.env.CLIENT_URL}/queue/${department.slug}`,
      qrDataUrl,
    },
  });
});
