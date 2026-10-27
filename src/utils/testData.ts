import fs from 'fs';
import path from 'path';
import { Customer, Product, UserCredentials } from './models';

const dataDir = path.join(process.cwd(), 'test-data');

function readJson<T>(fileName: string): T {
  const filePath = path.join(dataDir, fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

const usersFile = readJson<Record<string, UserCredentials>>('users.json');

export const users = {
  standard: usersFile.standard,
  lockedOut: usersFile.lockedOut,
  problem: usersFile.problem,
  performance: usersFile.performance,
  invalid: usersFile.invalid,
};

export const products: Product[] = readJson<Product[]>('products.json');

export const customers = readJson<Record<string, Customer>>('customers.json');

export function productByName(name: string): Product {
  const product = products.find((item) => item.name === name);
  if (!product) {
    throw new Error(`Product not found in test data: ${name}`);
  }
  return product;
}

/** Catalog order used by the name A–Z sort on the products page. */
export function productsByName(direction: 'asc' | 'desc' = 'asc'): Product[] {
  const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));
  return direction === 'asc' ? sorted : sorted.reverse();
}
