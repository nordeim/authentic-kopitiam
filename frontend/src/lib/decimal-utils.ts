/**
 * Decimal Utility for Singapore GST Compliance (DECIMAL 10,4)
 * 
 * Handles high-precision financial calculations to avoid floating point errors.
 * All calculations are performed by scaling to integers (x 10000), performing the operation,
 * and scaling back.
 */

const SCALE = 10000;

export const decimal = {
  // Convert number to scaled integer
  toScaled: (num: number): number => Math.round(num * SCALE),

  // Convert scaled integer back to number
  fromScaled: (num: number): number => num / SCALE,

  // Add two numbers with precision
  add: (a: number, b: number): number => {
    return (Math.round(a * SCALE) + Math.round(b * SCALE)) / SCALE;
  },

  // Multiply number by factor with precision
  multiply: (amount: number, factor: number): number => {
    // Multiply scaled amount by factor, then round to nearest integer
    return Math.round(amount * SCALE * factor) / SCALE;
  },

  // Calculate 9% GST specifically
  calculateGST: (amount: number): number => {
    return Math.round(amount * SCALE * 0.09) / SCALE;
  },

  // Format for display (e.g., $10.50)
  format: (amount: number): string => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
};
