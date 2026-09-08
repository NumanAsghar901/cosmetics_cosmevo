import { WA_NUMBER } from './constants';

export function fmtPrice(n: number): string {
  return 'Rs. ' + (n || 0).toLocaleString('en-PK');
}

export function getToneFor(category: string): 'face' | 'hair' | 'soap' {
  if (category === 'hair') return 'hair';
  if (category === 'soap') return 'soap';
  return 'face';
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case 'face':
      return 'Face Care';
    case 'hair':
      return 'Hair Care';
    case 'soap':
      return 'Soaps';
    default:
      return 'All Products';
  }
}



export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
