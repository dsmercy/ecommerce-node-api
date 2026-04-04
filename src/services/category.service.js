import { Category } from '../models/category.model.js';
import { Product } from '../models/product.model.js';
import { getCache, setCache, deleteCache } from '../utils/cache.js';

const CACHE_KEY = 'categories:all';

export async function getAll() {
  const cached = getCache(CACHE_KEY);
  if (cached) return cached;

  const categories = await Category.find({ parentId: null }).lean();

  const withSubs = await Promise.all(
    categories.map(async (cat) => {
      const subcategories = await Category.find({ parentId: cat._id }).lean();
      return { ...cat, subcategories };
    })
  );

  setCache(CACHE_KEY, withSubs);
  return withSubs;
}

export async function getById(id) {
  const category = await Category.findById(id).lean();
  if (!category) {
    const err = new Error('Category not found');
    err.statusCode = 404;
    throw err;
  }
  return category;
}

export async function getSubcategories(parentId) {
  return Category.find({ parentId }).lean();
}

export async function create(dto) {
  const category = await Category.create(dto);
  deleteCache(CACHE_KEY);
  return category;
}

export async function update(id, dto) {
  const category = await Category.findByIdAndUpdate(id, dto, { new: true, runValidators: true });
  if (!category) {
    const err = new Error('Category not found');
    err.statusCode = 404;
    throw err;
  }
  deleteCache(CACHE_KEY);
  return category;
}

export async function remove(id) {
  const inUse = await Product.exists({ categoryId: id, isActive: true });
  if (inUse) {
    const err = new Error('Cannot delete category: products are assigned to it');
    err.statusCode = 400;
    throw err;
  }
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    const err = new Error('Category not found');
    err.statusCode = 404;
    throw err;
  }
  deleteCache(CACHE_KEY);
}
