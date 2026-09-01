export interface CCAItem {
  schoolName: string;
  schoolSection: string;
  ccaGrouping: string; // e.g. "BADMINTON", "WUSHU", "CHINESE DANCE"
  ccaCategory: string; // e.g. "PHYSICAL SPORTS", "VISUAL AND PERFORMING ARTS", "UNIFORMED GROUPS", "CLUBS AND SOCIETIES"
  ccaCustomizedName?: string | null;
}

export interface DistinctiveProgramme {
  schoolName: string;
  programmeType: string; // "ALP" or "LLP" or "MOE"
  domain: string;
  title: string;
}

export interface School {
  name: string;
  url: string;
  address: string;
  postalCode: string;
  telephone: string;
  telephone2?: string;
  email: string;
  mrt: string;
  bus: string;
  principal: string;
  firstVp?: string;
  secondVp?: string;
  zone: string; // "NORTH", "SOUTH", "EAST", "WEST"
  dgp: string; // "TAMPINES", "BISHAN", "WOODLANDS", etc.
  type: string; // "GOVERNMENT SCHOOL", "GOVERNMENT-AIDED SCH", "INDEPENDENT SCHOOL"
  nature: string; // "CO-ED SCHOOL", "GIRLS' SCHOOL", "BOYS' SCHOOL"
  session: string; // "SINGLE SESSION", "FULL DAY"
  mainLevel: string; // "PRIMARY", "SECONDARY", "JUNIOR COLLEGE", "MIXED LEVEL"
  isSap: boolean;
  isAutonomous: boolean;
  isGifted: boolean;
  isIp: boolean;
  motherTongues: string[];
  ccas: CCAItem[];
  programmes: DistinctiveProgramme[];
  moeProgrammes: string[];
  subjects: string[];
}

export interface SearchFilterParams {
  query?: string;
  level?: string;
  zone?: string;
  ccaCategory?: string;
  nature?: string;
  isAutonomous?: boolean;
  isSap?: boolean;
  isIp?: boolean;
  isGifted?: boolean;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  schools: School[];
  total: number;
  matchingCCAs: {
    ccaName: string;
    category: string;
    schoolCount: number;
  }[];
  featuredSuggestions: string[];
}

export interface MascotQuote {
  character: 'konata' | 'tsukasa' | 'kagami' | 'miyuki';
  name: string;
  avatar: string;
  color: string;
  quote: string;
  mood: 'cheer' | 'curious' | 'studious' | 'excited';
}
