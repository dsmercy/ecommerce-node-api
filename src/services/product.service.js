import { Product } from '../models/product.model.js';
import { Category } from '../models/category.model.js';
import { Review } from '../models/review.model.js';
import { getCache, setCache, deleteCache } from '../utils/cache.js';
import cache from '../utils/cache.js';

const sortFieldMap = {
  name: 'name',
  price: 'price',
  rating: 'averageRating',
  createdAt: 'createdAt',
};

export async function searchProducts(query) {
  const cacheKey = 'products:' + JSON.stringify(query);
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const { search, categoryId, minPrice, maxPrice, minRating, tags, sortBy, sortOrder, page, pageSize } = query;

  const filter = { isActive: true };

  if (search) filter.name = { $regex: search, $options: 'i' };
  if (categoryId) filter.categoryId = categoryId;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }
  if (minRating !== undefined) filter.averageRating = { $gte: minRating };
  if (tags) {
    const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (tagArray.length) filter.tags = { $in: tagArray };
  }

  const sortKey = sortFieldMap[sortBy] || 'name';
  const sortDir = sortOrder === 'desc' ? -1 : 1;
  const skip = (page - 1) * pageSize;

  const [items, totalCount] = await Promise.all([
    Product.find(filter).sort({ [sortKey]: sortDir }).skip(skip).limit(pageSize).lean(),
    Product.countDocuments(filter),
  ]);

  const result = {
    items,
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };

  setCache(cacheKey, result);
  return result;
}

export async function getProductById(id) {
  const cacheKey = 'product:' + id;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const product = await Product.findById(id).populate('categoryId', 'name slug').lean();
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  setCache(cacheKey, product);
  return product;
}

export async function createProduct(dto) {
  const categoryExists = await Category.exists({ _id: dto.categoryId });
  if (!categoryExists) {
    const err = new Error('Category not found');
    err.statusCode = 404;
    throw err;
  }

  const product = await Product.create(dto);
  _invalidateListCache();
  return product;
}

export async function updateProduct(id, dto) {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  Object.assign(product, dto);
  await product.save();

  deleteCache('product:' + id);
  _invalidateListCache();
  return product;
}

export async function deleteProduct(id) {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  product.isActive = false;
  await product.save();

  deleteCache('product:' + id);
  _invalidateListCache();
}

export async function getFeaturedProducts() {
  const cacheKey = 'products:featured';
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const products = await Product.find({ isActive: true, averageRating: { $gte: 4 } })
    .sort({ averageRating: -1 })
    .limit(10)
    .lean();

  setCache(cacheKey, products);
  return products;
}

export async function getRelatedProducts(productId) {
  const product = await Product.findById(productId).lean();
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  return Product.find({
    categoryId: product.categoryId,
    _id: { $ne: productId },
    isActive: true,
  })
    .limit(5)
    .lean();
}

export async function recalculateRating(productId) {
  const result = await Review.aggregate([
    { $match: { productId: productId, isApproved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const avg = result.length ? parseFloat(result[0].avg.toFixed(2)) : 0;
  const count = result.length ? result[0].count : 0;

  await Product.findByIdAndUpdate(productId, { averageRating: avg, reviewCount: count });
  deleteCache('product:' + productId);
  _invalidateListCache();
}

function _invalidateListCache() {
  const keys = cache.keys();
  keys.filter((k) => k.startsWith('products:')).forEach((k) => deleteCache(k));
}
