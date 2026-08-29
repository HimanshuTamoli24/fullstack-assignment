/**
 * Example:
 * const { countries, lookup } = useCountry();
 * const india = lookup("IN"); // { name: "India", dialCode: "+91", flag: "🇮🇳", ... }
 */


export interface CountryData {
  name: string;
  iso2: string;
  iso3: string;
  dialCode: string;
  currency: string;
  flag: string;
  timezone: string;
  capital: string;
  languages: string[];
}

const countryDatabase: CountryData[] = [
  {
    name: "India",
    iso2: "IN",
    iso3: "IND",
    dialCode: "+91",
    currency: "INR",
    flag: "🇮🇳",
    timezone: "Asia/Kolkata",
    capital: "New Delhi",
    languages: ["Hindi", "English"],
  },
  {
    name: "United States",
    iso2: "US",
    iso3: "USA",
    dialCode: "+1",
    currency: "USD",
    flag: "🇺🇸",
    timezone: "America/New_York",
    capital: "Washington, D.C.",
    languages: ["English"],
  },
  {
    name: "United Kingdom",
    iso2: "GB",
    iso3: "GBR",
    dialCode: "+44",
    currency: "GBP",
    flag: "🇬🇧",
    timezone: "Europe/London",
    capital: "London",
    languages: ["English"],
  },
  {
    name: "Canada",
    iso2: "CA",
    iso3: "CAN",
    dialCode: "+1",
    currency: "CAD",
    flag: "🇨🇦",
    timezone: "America/Toronto",
    capital: "Ottawa",
    languages: ["English", "French"],
  },
  {
    name: "Australia",
    iso2: "AU",
    iso3: "AUS",
    dialCode: "+61",
    currency: "AUD",
    flag: "🇦🇺",
    timezone: "Australia/Sydney",
    capital: "Canberra",
    languages: ["English"],
  },
];

export function useCountry() {
  const getCountryByIso2 = (iso2: string): CountryData | undefined => {
    return countryDatabase.find((c) => c.iso2.toUpperCase() === iso2.toUpperCase());
  };

  const getCountryByIso3 = (iso3: string): CountryData | undefined => {
    return countryDatabase.find((c) => c.iso3.toUpperCase() === iso3.toUpperCase());
  };

  const getCountryByDialCode = (dialCode: string): CountryData | undefined => {
    return countryDatabase.find((c) => c.dialCode === dialCode);
  };

  const getCountryByName = (name: string): CountryData | undefined => {
    return countryDatabase.find((c) => c.name.toLowerCase() === name.toLowerCase());
  };

  const lookup = (query: string): CountryData | undefined => {
    if (!query) return undefined;
    const clean = query.trim();
    if (clean.startsWith("+")) return getCountryByDialCode(clean);
    if (clean.length === 2) return getCountryByIso2(clean);
    if (clean.length === 3) return getCountryByIso3(clean);
    return getCountryByName(clean);
  };

  return {
    countries: countryDatabase,
    getCountryByIso2,
    getCountryByIso3,
    getCountryByDialCode,
    getCountryByName,
    lookup,
  };
}
