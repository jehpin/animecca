import fs from 'fs';
import path from 'path';
import { School, SearchFilterParams, SearchResult } from '../src/types';

// In-memory cache of schools and CCAs
let schoolsCache: School[] = [];
const allCCAsMap = new Map<string, { category: string; schools: Set<string> }>();
let isInitialized = false;

export function initializeData(): void {
  if (isInitialized) return;

  try {
    const seedPath = path.join(process.cwd(), 'server', 'seedData.json');
    if (fs.existsSync(seedPath)) {
      const raw = fs.readFileSync(seedPath, 'utf-8');
      schoolsCache = JSON.parse(raw);
      console.log(`Loaded ${schoolsCache.length} schools from seedData.json`);
    } else {
      console.warn('seedData.json not found, empty cache');
    }

    // Build CCA global indexing
    allCCAsMap.clear();
    for (const school of schoolsCache) {
      for (const cca of school.ccas) {
        const cKey = cca.ccaGrouping.toUpperCase();
        if (!allCCAsMap.has(cKey)) {
          allCCAsMap.set(cKey, { category: cca.ccaCategory, schools: new Set() });
        }
        allCCAsMap.get(cKey)!.schools.add(school.name);
      }
    }

    console.log(`Indexed ${allCCAsMap.size} distinct CCAs across ${schoolsCache.length} schools!`);
    isInitialized = true;
  } catch (err) {
    console.error('Failed to initialize school data:', err);
  }
}

export function searchSchools(params: SearchFilterParams): SearchResult {
  if (!isInitialized) initializeData();

  const q = (params.query || '').trim().toLowerCase();
  const level = params.level ? params.level.toUpperCase() : '';
  const zone = params.zone ? params.zone.toUpperCase() : '';
  const ccaCategory = params.ccaCategory ? params.ccaCategory.toUpperCase() : '';
  const nature = params.nature ? params.nature.toUpperCase() : '';

  const filtered = schoolsCache.filter(school => {
    // Level filter
    if (level && level !== 'ALL') {
      if (level === 'PRIMARY' && !school.mainLevel.includes('PRIMARY')) return false;
      if (level === 'SECONDARY' && !school.mainLevel.includes('SECONDARY')) return false;
      if (level === 'JC' && !school.mainLevel.includes('JUNIOR COLLEGE') && !school.mainLevel.includes('JC') && !school.mainLevel.includes('MIXED LEVEL')) return false;
    }

    // Zone filter
    if (zone && zone !== 'ALL' && school.zone !== zone) {
      return false;
    }

    // Nature filter (Co-ed, Girls, Boys)
    if (nature && nature !== 'ALL') {
      if (nature === 'GIRLS' && !school.nature.includes('GIRLS')) return false;
      if (nature === 'BOYS' && !school.nature.includes('BOYS')) return false;
      if (nature === 'CO-ED' && !school.nature.includes('CO-ED')) return false;
    }

    // Flag filters
    if (params.isAutonomous && !school.isAutonomous) return false;
    if (params.isSap && !school.isSap) return false;
    if (params.isIp && !school.isIp) return false;
    if (params.isGifted && !school.isGifted) return false;

    // CCA category filter
    if (ccaCategory && ccaCategory !== 'ALL') {
      const hasCategory = school.ccas.some(c => c.ccaCategory.toUpperCase().includes(ccaCategory));
      if (!hasCategory) return false;
    }

    // Text search query
    if (q) {
      const matchSchoolName = school.name.toLowerCase().includes(q);
      const matchDgp = school.dgp.toLowerCase().includes(q);
      const matchMrt = school.mrt.toLowerCase().includes(q);
      const matchAddress = school.address.toLowerCase().includes(q);
      const matchPostal = school.postalCode.includes(q);
      
      const matchCCA = school.ccas.some(c => 
        c.ccaGrouping.toLowerCase().includes(q) || 
        c.ccaCategory.toLowerCase().includes(q) ||
        (c.ccaCustomizedName && c.ccaCustomizedName.toLowerCase().includes(q))
      );

      const matchProg = school.programmes.some(p => 
        p.title.toLowerCase().includes(q) || p.domain.toLowerCase().includes(q)
      );

      if (!matchSchoolName && !matchDgp && !matchMrt && !matchAddress && !matchPostal && !matchCCA && !matchProg) {
        return false;
      }
    }

    return true;
  });

  // Calculate matching CCAs for suggestions / quick explore
  const matchingCCAs: { ccaName: string; category: string; schoolCount: number }[] = [];
  if (q) {
    for (const [ccaName, info] of allCCAsMap.entries()) {
      if (ccaName.toLowerCase().includes(q)) {
        matchingCCAs.push({
          ccaName,
          category: info.category,
          schoolCount: info.schools.size,
        });
      }
    }
    matchingCCAs.sort((a, b) => b.schoolCount - a.schoolCount);
  }

  const featuredSuggestions = [
    'Wushu',
    'Badminton',
    'Robotics',
    'Choir',
    'Symphonic Band',
    'Floorball',
    'Archery',
    'National Cadet Corps (NCC)',
    'Raffles Institution',
    'Nanyang Girls\' High',
    'Victoria School',
    'Hwa Chong Institution',
    'Tampines',
    'Bishan',
  ];

  const total = filtered.length;
  const page = params.page || 1;
  const limit = params.limit || 60;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    schools: paginated,
    total,
    matchingCCAs: matchingCCAs.slice(0, 12),
    featuredSuggestions,
  };
}

export function getAllCCAs() {
  if (!isInitialized) initializeData();
  const result: { name: string; category: string; count: number }[] = [];
  for (const [name, info] of allCCAsMap.entries()) {
    result.push({
      name,
      category: info.category,
      count: info.schools.size,
    });
  }
  return result.sort((a, b) => b.count - a.count);
}

export function getSchoolByName(name: string): School | undefined {
  if (!isInitialized) initializeData();
  return schoolsCache.find(s => s.name.toUpperCase() === name.toUpperCase());
}

export function getRandomSchool(): School | undefined {
  if (!isInitialized) initializeData();
  if (schoolsCache.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * schoolsCache.length);
  return schoolsCache[randomIndex];
}
