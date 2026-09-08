import React from 'react';
import { getAllProducts } from '@/lib/products';
import { getAllCategories, getAllSubcategories } from '@/lib/categories';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const products = await getAllProducts();
  const categories = await getAllCategories();
  const subcategories = await getAllSubcategories();
  
  return <HomeClient initialProducts={products} categories={categories} subcategories={subcategories} />;
}
