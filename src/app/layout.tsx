import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { CartProvider } from '@/context/CartContext';
import { ModalProvider } from '@/context/ModalContext';
import { getAllProducts } from '@/lib/products';
import { getAllCategories } from '@/lib/categories';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import SearchOverlay from '@/components/ui/SearchOverlay';
import QuickViewModal from '@/components/ui/QuickViewModal';
import CustomCursor from '@/components/ui/CustomCursor';
import WhatsAppFloat from '@/components/ui/WhatsAppFloat';
import ScrollProgress from '@/components/ui/ScrollProgress';
import RevealInitializer from '@/components/ui/RevealInitializer';

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'Cosmevo Cosmeceuticals | Skincare Products in Pakistan',
  description: 'Shop Cosmevo face care, hair care and cleansing products with delivery available across Pakistan.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const products = await getAllProducts();
  const categories = await getAllCategories();

  return (
    <html lang="en">
      <body className={`bg-warm-white text-ink font-manrope selection:bg-plum selection:text-white ${manrope.variable}`}>
        <ToastProvider>
          <CartProvider initialProducts={products}>
            <ModalProvider>
              <ScrollProgress />
              <RevealInitializer />
              <Header categories={categories} />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer categories={categories} />
              <CartDrawer />
              <SearchOverlay />
              <QuickViewModal />
              <WhatsAppFloat />
              <CustomCursor />
            </ModalProvider>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
