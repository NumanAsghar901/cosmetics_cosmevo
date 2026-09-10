import React from 'react';
import { Metadata } from 'next';
import { getAllActiveDistributors } from '@/lib/distributors';
import DistributorsClient from './DistributorsClient';

export const metadata: Metadata = {
  title: 'Authorized Distributors in Pakistan | Cosmevo Cosmeceuticals',
  description: 'Find official Cosmevo certified distributors and retail stockists across Lahore, Karachi, Islamabad, Faisalabad, Multan, and major cities in Pakistan for authentic skincare and wholesale inquiries.',
  keywords: [
    'Cosmevo distributors',
    'cosmetics distributors Pakistan',
    'skincare distributors Lahore',
    'Cosmevo stockists Karachi',
    'dermatological supplier Pakistan',
    'wholesale skincare Pakistan',
  ],
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DistributorsPage() {
  const distributors = await getAllActiveDistributors();

  return <DistributorsClient initialDistributors={distributors} />;
}
