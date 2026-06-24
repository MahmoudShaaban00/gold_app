import { Category } from "../models/category.js";

export const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    const exists = await Category.findOne({ name });

    if (exists) {
      return res.status(400).json({
        message: "القسم موجود بالفعل",
      });
    }

    const category = await Category.create({
      name,
      type,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "القسم غير موجود",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "القسم غير موجود",
      });
    }

    // التحقق من عدم تكرار الاسم
    if (name) {
      const exists = await Category.findOne({
        name,
        _id: { $ne: id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "اسم القسم موجود بالفعل",
        });
      }
    }

    category.name = name || category.name;
    category.type = type || category.type;

    await category.save();

    res.status(200).json({
      success: true,
      message: "تم تحديث القسم بنجاح",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "القسم غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      message: "تم حذف القسم بنجاح",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};