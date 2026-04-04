import * as categoryService from '../services/category.service.js';
import { apiResponse } from '../utils/response.js';

export async function getCategories(req, res, next) {
  try {
    const data = await categoryService.getAll();
    return apiResponse(res, data, 'Categories fetched successfully');
  } catch (err) {
    next(err);
  }
}

export async function getCategory(req, res, next) {
  try {
    const data = await categoryService.getById(req.params.id);
    return apiResponse(res, data, 'Category fetched successfully');
  } catch (err) {
    next(err);
  }
}

export async function getSubcategories(req, res, next) {
  try {
    const data = await categoryService.getSubcategories(req.params.id);
    return apiResponse(res, data, 'Subcategories fetched successfully');
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const data = await categoryService.create(req.body);
    return apiResponse(res, data, 'Category created successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const data = await categoryService.update(req.params.id, req.body);
    return apiResponse(res, data, 'Category updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    await categoryService.remove(req.params.id);
    return apiResponse(res, null, 'Category deleted successfully');
  } catch (err) {
    next(err);
  }
}
