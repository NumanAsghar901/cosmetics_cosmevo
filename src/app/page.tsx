import React from 'react';
import { getAllProducts } from '@/lib/products';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const products = await getAllProducts();
  
  return <HomeClient initialProducts={products} />;
}
