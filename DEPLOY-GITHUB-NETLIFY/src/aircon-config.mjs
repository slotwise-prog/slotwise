const rates = [
  ['installation-labor', 'Installation Labor Only', 4500, 'Installation', { installation: 'Labor Only', unitType: 'Split Type' }],
  ['installation-1-2hp', 'Installation Labor + Materials - 1HP to 2HP', 7500, 'Installation', { installation: 'Labor + Materials', unitType: 'Split Type', capacity: '1HP to 2HP' }],
  ['installation-2-3hp', 'Installation Labor + Materials - 2.5HP to 3HP', 8500, 'Installation', { installation: 'Labor + Materials', unitType: 'Split Type', capacity: '2.5HP to 3HP' }],
  ['floor-mounted', 'Floor Mounted Installation', 14500, 'Installation', { installation: 'Labor + Materials', unitType: 'Floor Mounted' }],
  ['ceiling-suspended', 'Ceiling Suspended Installation', 14500, 'Installation', { installation: 'Labor + Materials', unitType: 'Ceiling Suspended' }],
  ['ceiling-cassette', 'Ceiling Cassette Installation', 14500, 'Installation', { installation: 'Labor + Materials', unitType: 'Ceiling Cassette' }],
  ['cleaning-split', 'Cleaning - Split Type', 1000, 'Cleaning', { unitType: 'Split Type', perUnit: true }],
  ['cleaning-window', 'Cleaning - Window Type', 600, 'Cleaning', { unitType: 'Window Type' }],
  ['cleaning-inverter', 'Cleaning - Window Type Inverter', 700, 'Cleaning', { unitType: 'Window Type Inverter' }],
  ['cleaning-compact', 'Cleaning - U-Shape / Compact', 1200, 'Cleaning', { unitType: 'U-Shape / Compact' }],
  ['cleaning-pulldown', 'Pulldown Cleaning', 3500, 'Cleaning', { unitType: 'Pulldown' }],
  ['system-reprocess', 'System Reprocess', 5500, 'Repair & Maintenance', {}],
  ['relocation', 'Relocation', 6500, 'Repair & Maintenance', { relocation: true }],
  ['dismantling', 'Dismantling', 600, 'Repair & Maintenance', {}],
  ['refrigerant', 'Charging Refrigerant', 3500, 'Repair & Maintenance', {}],
  ['checkup', 'Check-up', 500, 'Repair & Maintenance', {}],
  ['sales', 'Aircon Sales / Unit Recommendation', null, 'Aircon Sales / Quote', {}],
];

export const koolmateServices = rates.map(([key, name, price, serviceCategory], index) => ({
  id: `koolmate-${key}`, name, price, serviceCategory, pricingUnit: 'FLAT',
  pricingType: 'FIXED', description: '', status: 'Active', displayOrder: index,
}));
export const koolmateBusiness = {
  slug: 'koolmate-aircon-services', business: 'KOOLMATE Air-Conditioning Services and Maintenance',
  name: 'Aircon Services / HVAC', businessType: 'Aircon Services', bookingTemplate: 'AIRCON_SERVICES',
  bookingMode: 'booking', package: 'PRO', status: 'ACTIVE',
  logo: '/koolmate-logo.png', cover: '/koolmate-hero.png', primaryColor: '#0676FF', accentColor: '#FFD21F', pageBackgroundColor: '#F4F8FF',
  phone: '0993-551-5531', primaryEmail: 'koolmateadmin070826@gmail.com',
  address: '244 Mikas Street, Real 1, Bacoor, Cavite, Philippines, 4102',
  messengerLink: 'https://m.me/61591997337938', website: 'https://koolmate.netlify.app/',
  description: 'Professional air-conditioning service for a cooler, cleaner, and more energy-efficient home or business.',
  availability: { days: '', hours: '', slots: [], blockedDates: [] },
  services: koolmateServices.map(item => item.name), serviceDetails: koolmateServices, forms: ['Additional notes'],
  featureFlags: {
    airconBrandName: 'KOOLMATE', airconTagline: 'Cooler Air.\nCleaner Comfort.\nSmarter Savings.',
    airconBrandLine: 'Choose KOOLMATE!',
    airconServiceAreas: ['Bacoor / Cavite', 'San Mateo / Rizal', 'Nearby / Other Area'],
    airconServiceOptions: Object.fromEntries(rates.map(([key, , , , options]) => [`koolmate-${key}`, options])),
  },
};

export const airconCategories = ['Installation', 'Cleaning', 'Repair & Maintenance', 'Aircon Sales / Quote'];
export function airconServiceOptions(business, service) {
  return business.featureFlags?.airconServiceOptions?.[service?.id] || {};
}
export function airconCategory(service) {
  if (airconCategories.includes(service.serviceCategory)) return service.serviceCategory;
  if (/install/i.test(service.name)) return 'Installation';
  if (/clean/i.test(service.name)) return 'Cleaning';
  if (service.pricingType === 'CUSTOM_INQUIRY' || /sales|recommendation/i.test(service.name)) return 'Aircon Sales / Quote';
  return 'Repair & Maintenance';
}
