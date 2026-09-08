import React from 'react';
import { getAllProducts } from '@/lib/products';
import { getAllCategories, getAllSubcategories } from '@/lib/categories';
import { getAllActiveVideos } from '@/lib/videos';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const products = await getAllProducts();
  const categories = await getAllCategories();
  const subcategories = await getAllSubcategories();
  const videos = await getAllActiveVideos();
  
  return (
    <HomeClient 
      initialProducts={products} 
      categories={categories} 
      subcategories={subcategories}
      videos={videos}
    />
  );
}

