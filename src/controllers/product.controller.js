import * as productService from '../services/product.service.js';
import { apiResponse } from '../utils/response.js';

export async function searchProducts(req, res, next) {
  try {
    const data = await productService.searchProducts(req.query);
    return apiResponse(res, data, 'Products fetched successfully');
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const data = await productService.getProductById(req.params.id);
    return apiResponse(res, data, 'Product fetched successfully');
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const data = await productService.createProduct(req.body);
    return apiResponse(res, data, 'Product created successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const data = await productService.updateProduct(req.params.id, req.body);
    return apiResponse(res, data, 'Product updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await productService.deleteProduct(req.params.id);
    return apiResponse(res, null, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
}

export async function getFeaturedProducts(req, res, next) {
  try {
    const data = await productService.getFeaturedProducts();
    return apiResponse(res, data, 'Featured products fetched successfully');
  } catch (err) {
    next(err);
  }
}

export async function getRelatedProducts(req, res, next) {
  try {
    const data = await productService.getRelatedProducts(req.params.id);
    return apiResponse(res, data, 'Related products fetched successfully');
  } catch (err) {
    next(err);
  }
}
