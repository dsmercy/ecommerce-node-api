import { Cart } from '../models/cart.model.js';
import { Product } from '../models/product.model.js';

function enrichCart(cart) {
  if (!cart) return { items: [], cartTotal: 0 };

  const items = (cart.items || []).map((item) => {
    const product = item.productId;
    const effectivePrice = product.salePrice ?? product.price;
    const lineTotal = parseFloat((effectivePrice * item.quantity).toFixed(2));
    return {
      productId: product._id,
      name: product.name,
      effectivePrice,
      quantity: item.quantity,
      lineTotal,
      imageUrl: product.images?.[0] || null,
      inStock: product.stockQty >= item.quantity,
    };
  });

  const cartTotal = parseFloat(items.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2));
  return { items, cartTotal };
}

async function fetchPopulatedCart(userId) {
  return Cart.findOne({ userId }).populate(
    'items.productId',
    'name price salePrice images stockQty'
  );
}

export async function getCart(userId) {
  const cart = await fetchPopulatedCart(userId);
  return enrichCart(cart);
}

export async function addItem(userId, { productId, quantity }) {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  const cart = await Cart.findOne({ userId });
  const existingItem = cart?.items.find((i) => i.productId.toString() === productId);
  const newQty = existingItem ? existingItem.quantity + quantity : quantity;

  if (product.stockQty < newQty) {
    const err = new Error(`Insufficient stock. Available: ${product.stockQty}`);
    err.statusCode = 400;
    throw err;
  }

  if (existingItem) {
    await Cart.findOneAndUpdate(
      { userId, 'items.productId': productId },
      { $set: { 'items.$.quantity': newQty } }
    );
  } else {
    await Cart.findOneAndUpdate(
      { userId },
      { $push: { items: { productId, quantity } } },
      { upsert: true, new: true }
    );
  }

  return getCart(userId);
}

export async function updateItem(userId, productId, quantity) {
  const product = await Product.findById(productId);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  if (product.stockQty < quantity) {
    const err = new Error(`Insufficient stock. Available: ${product.stockQty}`);
    err.statusCode = 400;
    throw err;
  }

  await Cart.findOneAndUpdate(
    { userId, 'items.productId': productId },
    { $set: { 'items.$.quantity': quantity } }
  );

  return getCart(userId);
}

export async function removeItem(userId, productId) {
  await Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: { productId } } }
  );
  return getCart(userId);
}

export async function clearCart(userId) {
  await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });
}

export async function getCartTotal(userId) {
  const cart = await fetchPopulatedCart(userId);
  const { cartTotal } = enrichCart(cart);
  return { cartTotal };
}
