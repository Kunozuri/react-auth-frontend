// ============================================================================
// countries.ts - the options for the "Country" <select> in the sign-up form.
// ============================================================================
//
// Save this as: src/lib/countries.ts
//
// WHY A LIST AND NOT A TEXT BOX
// The backend only accepts a 2-letter ISO code ("PH", "US"...), matching the
// rule in the User model: /^[A-Z]{2}$/. With a <select>, the person sees the
// full name but we send the code, so a typo is impossible.
//
// This is a short starter list. Add more rows in the same shape whenever you
// need them. `code` MUST be a valid 2-letter ISO 3166-1 alpha-2 code, uppercase.
// ============================================================================

export type Country = {
    code: string; // what gets sent to the backend
    name: string; // what the person sees
};

export const COUNTRIES: Country[] = [
    { code: "AU", name: "Australia" },
    { code: "BR", name: "Brazil" },
    { code: "CA", name: "Canada" },
    { code: "CN", name: "China" },
    { code: "FR", name: "France" },
    { code: "DE", name: "Germany" },
    { code: "HK", name: "Hong Kong" },
    { code: "IN", name: "India" },
    { code: "ID", name: "Indonesia" },
    { code: "IT", name: "Italy" },
    { code: "JP", name: "Japan" },
    { code: "MY", name: "Malaysia" },
    { code: "MX", name: "Mexico" },
    { code: "NZ", name: "New Zealand" },
    { code: "PH", name: "Philippines" },
    { code: "SA", name: "Saudi Arabia" },
    { code: "SG", name: "Singapore" },
    { code: "KR", name: "South Korea" },
    { code: "ES", name: "Spain" },
    { code: "TH", name: "Thailand" },
    { code: "AE", name: "United Arab Emirates" },
    { code: "GB", name: "United Kingdom" },
    { code: "US", name: "United States" },
    { code: "VN", name: "Vietnam" },
];