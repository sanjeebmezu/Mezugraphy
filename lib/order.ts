export type OrderInput = {
  fullName: string;
  phone: string;
  email: string;
  location: string;
  productName: string;
  quantity: number;
  pricePerPiece: number;
  totalPrice: number;
};

export type Order = OrderInput & {
  orderId: string;
  dateTime: string;
  paymentMethod: 'Cash On Delivery';
  orderStatus: 'New Order';
  notes: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateOrder(data: Partial<OrderInput>) {
  const errors: string[] = [];
  const quantity = Number(data.quantity);
  const pricePerPiece = Number(data.pricePerPiece);
  const totalPrice = Number(data.totalPrice);

  if (!data.fullName?.trim()) errors.push('Name is required.');
  if (!data.phone?.trim()) errors.push('Phone number is required.');
  if (!data.email?.trim() || !emailPattern.test(data.email)) {
    errors.push('A valid email address is required.');
  }
  if (!data.location?.trim()) errors.push('Exact location is required.');
  if (!data.productName?.trim()) errors.push('Product name is required.');
  if (!Number.isFinite(quantity) || quantity < 1) {
    errors.push('Quantity must be at least 1.');
  }
  if (!Number.isFinite(pricePerPiece) || pricePerPiece <= 0) {
    errors.push('Price per piece must be valid.');
  }
  if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
    errors.push('Total price must be valid.');
  }

  return errors;
}

export function createOrder(data: OrderInput): Order {
  const orderId = `MS-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

  return {
    ...data,
    quantity: Number(data.quantity),
    pricePerPiece: Number(data.pricePerPiece),
    totalPrice: Number(data.totalPrice),
    orderId,
    dateTime: new Date().toISOString(),
    paymentMethod: 'Cash On Delivery',
    orderStatus: 'New Order',
    notes: '',
  };
}

export function formatCurrency(value: number) {
  return `Rs. ${Number(value).toLocaleString('en-NP')}`;
}
