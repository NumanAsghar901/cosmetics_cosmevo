import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { BUNDLED_PRODUCTS, getProductBySlug, getRelatedProducts } from '@/lib/products';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BUNDLED_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Cosmevo Cosmeceuticals',
    };
  }

  return {
    title: `${product.name} | Cosmevo Cosmeceuticals`,
    description: product.tagline || product.overview,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = getRelatedProducts(product, BUNDLED_PRODUCTS, 4);

  return <ProductDetailClient product={product} related={related} />;
}
