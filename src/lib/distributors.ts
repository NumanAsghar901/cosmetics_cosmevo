import { createClient } from '@supabase/supabase-js';
import { Distributor } from './types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  global: {
    fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
  },
});

export const FALLBACK_DISTRIBUTORS: Distributor[] = [
  {
    id: 'dist-lahore-1',
    name: 'Cosmevo Central Distribution Punjab',
    contact_person: 'M. Haris Khan',
    city: 'Lahore',
    province: 'Punjab',
    phone: '0309 4560316',
    whatsapp: '923094560316',
    email: 'lahore@cosmevo.pk',
    address: 'Suite 402, Al-Hafeez Heights, Ghalib Road, Gulberg III, Lahore',
    area_covered: 'Gulberg, DHA, Model Town, Johar Town & Cantt',
    display_order: 1,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dist-karachi-1',
    name: 'Sindh Derma & Cosmeceuticals Hub',
    contact_person: 'Dr. Tariq Mahmood',
    city: 'Karachi',
    province: 'Sindh',
    phone: '0321 8294711',
    whatsapp: '923218294711',
    email: 'karachi@cosmevo.pk',
    address: 'Plot 18-C, 4th Commercial Lane, Zamzama Blvd, DHA Phase 5, Karachi',
    area_covered: 'Clifton, DHA, Saddar, PECHS, Gulshan & North Nazimabad',
    display_order: 2,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dist-isb-1',
    name: 'Capital Derma Care Network',
    contact_person: 'Shahid Rafique',
    city: 'Islamabad',
    province: 'Islamabad',
    phone: '0333 5192844',
    whatsapp: '923335192844',
    email: 'islamabad@cosmevo.pk',
    address: 'Office 12, Executive Heights, Sector F-7 Markaz, Islamabad',
    area_covered: 'F-Sectors, G-Sectors, Blue Area & Bahria Enclave',
    display_order: 3,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dist-fsd-1',
    name: 'Cosmevo Flagship Regional Supply',
    contact_person: 'Numan Asghar',
    city: 'Faisalabad',
    province: 'Punjab',
    phone: '0309 4560316',
    whatsapp: '923094560316',
    email: 'info@cosmevo.pk',
    address: 'Canal Road Trade Center, East Canal Road, Faisalabad',
    area_covered: 'Canal Road, D-Ground, Susan Road, Peoples Colony & Madina Town',
    display_order: 4,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dist-rwp-1',
    name: 'Rawalpindi Medical & Aesthetic Supply',
    contact_person: 'Adeel Raza',
    city: 'Rawalpindi',
    province: 'Punjab',
    phone: '0300 5519201',
    whatsapp: '923005519201',
    email: 'rawalpindi@cosmevo.pk',
    address: 'Plaza 24, Main Bank Road, Saddar, Rawalpindi',
    area_covered: 'Saddar, Bahria Town Phases 1-8, DHA Rawalpindi & Chaklala',
    display_order: 5,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dist-multan-1',
    name: 'South Punjab Derma & Pharma Line',
    contact_person: 'Malik Naveed Ahmed',
    city: 'Multan',
    province: 'Punjab',
    phone: '0300 7329104',
    whatsapp: '923007329104',
    email: 'multan@cosmevo.pk',
    address: 'Shop 7, Medical Commercial Center, Nishtar Road, Multan',
    area_covered: 'Nishtar Road, Cantt, Gulgasht Colony & Bosan Road',
    display_order: 6,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dist-pesh-1',
    name: 'Khyber Aesthetics & Derma Supply',
    contact_person: 'Junaid Khan',
    city: 'Peshawar',
    province: 'KPK',
    phone: '0314 9182334',
    whatsapp: '923149182334',
    email: 'peshawar@cosmevo.pk',
    address: 'Shop 14, Dean’s Trade Center, University Road, Peshawar',
    area_covered: 'University Road, Hayatabad, Cantt & Saddar',
    display_order: 7,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dist-grw-1',
    name: 'Crescent Medicos & Aesthetics',
    contact_person: 'Chaudhry Bilal',
    city: 'Gujranwala',
    province: 'Punjab',
    phone: '0301 6451299',
    whatsapp: '923016451299',
    email: 'gujranwala@cosmevo.pk',
    address: 'Main GT Road Commercial Zone, Model Town, Gujranwala',
    area_covered: 'Model Town, Satellite Town, DC Colony & Cantt',
    display_order: 8,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dist-skt-1',
    name: 'Chenab Healthcare & Derma Supply',
    contact_person: 'Kashif Butt',
    city: 'Sialkot',
    province: 'Punjab',
    phone: '0345 6172833',
    whatsapp: '923456172833',
    email: 'sialkot@cosmevo.pk',
    address: 'Paris Road Commercial Plaza, Paris Road, Sialkot',
    area_covered: 'Paris Road, Sialkot Cantt & Model Town',
    display_order: 9,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  }
];

export async function getAllActiveDistributors(): Promise<Distributor[]> {
  try {
    const { data, error } = await supabase
      .from('distributors')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_DISTRIBUTORS;
    }

    return data as Distributor[];
  } catch (err) {
    console.error('Error fetching active distributors:', err);
    return FALLBACK_DISTRIBUTORS;
  }
}

export async function getAllAdminDistributors(): Promise<Distributor[]> {
  try {
    const { data, error } = await supabase
      .from('distributors')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_DISTRIBUTORS;
    }

    return data as Distributor[];
  } catch (err) {
    console.error('Error fetching admin distributors:', err);
    return FALLBACK_DISTRIBUTORS;
  }
}
