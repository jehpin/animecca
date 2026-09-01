import fs from 'fs';
import path from 'path';
import { School, SearchFilterParams, SearchResult } from '../src/types';

// In-memory cache of schools and CCAs
let schoolsCache: School[] = [];
const allCCAsMap = new Map<string, { category: string; schools: Set<string> }>();
let isInitialized = false;

// Custom CSV Parser for quoted multiline and comma fields
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    rows.push(currentRow);
  }
  return rows;
}

function normalizeName(n: string): string {
  return (n || '')
    .toUpperCase()
    .replace(/[.'’\(\)\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanTokens(t: string): string[] {
  return (t || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

// Aliases mapping for fast acronym and nickname lookup
const COMMON_ALIASES: Record<string, string[]> = {
  ri: ['raffles institution'],
  rgs: ['raffles girls school', 'raffles girls secondary'],
  rgps: ['raffles girls primary'],
  hci: ['hwa chong institution'],
  hcjc: ['hwa chong institution'],
  nygh: ['nanyang girls high'],
  nyps: ['nanyang primary'],
  nyjc: ['nanyang junior college'],
  acjc: ['anglo chinese junior college'],
  acsi: ['anglo chinese school independent'],
  acsbr: ['anglo chinese school barker road'],
  acs: ['anglo chinese school'],
  vjc: ['victoria junior college'],
  vs: ['victoria school'],
  sji: ['st joseph s institution', 'saint joseph'],
  scgs: ['singapore chinese girls school'],
  mgs: ['methodist girls school'],
  chs: ['catholic high school'],
  cjc: ['catholic junior college'],
  dhs: ['dunman high school'],
  rvhs: ['river valley high school'],
  tjc: ['temasek junior college'],
  ejc: ['eunoia junior college'],
  njc: ['national junior college'],
  sajc: ['saint andrew s junior college', 'st andrew'],
  asrjc: ['anderson serangoon junior college'],
  tmjc: ['tampines meridian junior college'],
  jpjc: ['jurong pioneer junior college'],
  yijc: ['yishun innova junior college'],
  mi: ['millennia institute'],
  ncc: ['national cadet corps'],
  npcc: ['national police cadet corps'],
  ncdcc: ['national civil defence cadet corps'],
  sjab: ['st john brigade', 'st john'],
  bb: ['boys brigade'],
  gb: ['girls brigade'],
  mep: ['music elective programme'],
  aep: ['art elective programme'],
  emp: ['enhanced music programme'],
  eap: ['enhanced art programme'],
  bsp: ['bicultural studies programme'],
  lep: ['language elective programme'],
  emas: ['elective programme in malay language'],
  rsp: ['regional studies programme'],
  gep: ['gifted education programme', 'gifted'],
  alp: ['applied learning programme'],
  llp: ['learning for life programme'],
  sap: ['special assistance plan'],
  ip: ['integrated programme'],
};

// Augmented School with pre-built search index
interface IndexedSchool extends School {
  _searchText: string;
  _wordSet: Set<string>;
  _normName: string;
  _ccaNames: string[];
}

let indexedCache: IndexedSchool[] = [];

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

    // Build School Name Lookup
    const schoolLookup = new Map<string, School>();
    for (const s of schoolsCache) {
      s.programmes = s.programmes || [];
      s.moeProgrammes = s.moeProgrammes || [];
      s.subjects = s.subjects || [];

      const norm = normalizeName(s.name);
      schoolLookup.set(norm, s);
      if (norm.endsWith(' SCHOOL')) {
        schoolLookup.set(norm.slice(0, -7).trim(), s);
      }
    }

    const findSchoolObj = (rawName: string): School | null => {
      const n = normalizeName(rawName);
      if (schoolLookup.has(n)) return schoolLookup.get(n)!;
      if (schoolLookup.has(n + ' SCHOOL')) return schoolLookup.get(n + ' SCHOOL')!;
      for (const [key, s] of schoolLookup.entries()) {
        if (key.includes(n) || n.includes(key)) return s;
      }
      return null;
    };

    // 1. Merge MOE Special Programmes CSV
    const moeCsvPath = path.join(process.cwd(), 'server', 'data', 'moe_programmes.csv');
    if (fs.existsSync(moeCsvPath)) {
      try {
        const moeRaw = fs.readFileSync(moeCsvPath, 'utf-8');
        const moeRows = parseCSV(moeRaw).slice(1);
        for (const [schName, desc] of moeRows) {
          if (!schName || !desc) continue;
          const s = findSchoolObj(schName);
          if (s) {
            if (!s.moeProgrammes.includes(desc)) {
              s.moeProgrammes.push(desc);
            }
            if (!s.programmes.some(p => p.title === desc)) {
              s.programmes.push({
                schoolName: s.name,
                programmeType: 'MOE Special Programme',
                domain: 'MOE Elective / Special Programme',
                title: desc,
              });
            }
          }
        }
        console.log(`Merged MOE special programmes from CSV!`);
      } catch (err) {
        console.error('Failed to parse moe_programmes.csv:', err);
      }
    }

    // 2. Merge ALP and LLP CSV
    const alpCsvPath = path.join(process.cwd(), 'server', 'data', 'alp_llp.csv');
    if (fs.existsSync(alpCsvPath)) {
      try {
        const alpRaw = fs.readFileSync(alpCsvPath, 'utf-8');
        const alpRows = parseCSV(alpRaw).slice(1);
        for (const row of alpRows) {
          const [schName, alpDomain, alpTitle, llpDomain, llpTitle] = row;
          if (!schName) continue;
          const s = findSchoolObj(schName);
          if (s) {
            if (alpTitle && alpTitle !== 'na' && !s.programmes.some(p => p.title === alpTitle)) {
              s.programmes.push({
                schoolName: s.name,
                programmeType: 'ALP',
                domain: alpDomain && alpDomain !== 'na' ? alpDomain : 'Applied Learning',
                title: alpTitle,
              });
            }
            if (llpTitle && llpTitle !== 'na' && !s.programmes.some(p => p.title === llpTitle)) {
              s.programmes.push({
                schoolName: s.name,
                programmeType: 'LLP',
                domain: llpDomain && llpDomain !== 'na' ? llpDomain : 'Learning for Life',
                title: llpTitle,
              });
            }
          }
        }
        console.log(`Merged ALP & LLP programmes from CSV!`);
      } catch (err) {
        console.error('Failed to parse alp_llp.csv:', err);
      }
    }

    // Build CCA global indexing & Pre-build Search Blobs
    allCCAsMap.clear();
    indexedCache = schoolsCache.map(school => {
      const ccaNames: string[] = [];
      const ccaBlobs: string[] = [];
      const acronyms: string[] = [];

      for (const cca of school.ccas) {
        const cKey = cca.ccaGrouping.toUpperCase();
        ccaNames.push(cca.ccaGrouping);
        if (cca.ccaCustomizedName) ccaNames.push(cca.ccaCustomizedName);

        if (!allCCAsMap.has(cKey)) {
          allCCAsMap.set(cKey, { category: cca.ccaCategory, schools: new Set() });
        }
        allCCAsMap.get(cKey)!.schools.add(school.name);

        ccaBlobs.push(cca.ccaGrouping, cca.ccaCategory, cca.ccaCustomizedName || '');

        // Add standard CCA acronyms
        const ccaUp = cca.ccaGrouping.toUpperCase();
        if (ccaUp.includes('NATIONAL CADET CORPS')) acronyms.push('ncc');
        if (ccaUp.includes('NATIONAL POLICE CADET CORPS')) acronyms.push('npcc');
        if (ccaUp.includes('NATIONAL CIVIL DEFENCE CADET CORPS')) acronyms.push('ncdcc');
        if (ccaUp.includes('ST JOHN BRIGADE')) acronyms.push('sjab', 'st john');
        if (ccaUp.includes('BOYS') && ccaUp.includes('BRIGADE')) acronyms.push('bb');
        if (ccaUp.includes('GIRLS') && ccaUp.includes('BRIGADE')) acronyms.push('gb');
      }

      const progBlobs = school.programmes.map(p => `${p.programmeType} ${p.domain} ${p.title}`).join(' ');
      const moeBlobs = school.moeProgrammes.join(' ');
      const mtBlobs = school.motherTongues.join(' ');

      // Add programme acronyms
      const progsUp = (moeBlobs + ' ' + progBlobs).toUpperCase();
      if (progsUp.includes('MUSIC ELECTIVE PROGRAMME')) acronyms.push('mep');
      if (progsUp.includes('ART ELECTIVE PROGRAMME')) acronyms.push('aep');
      if (progsUp.includes('ENHANCED MUSIC PROGRAMME')) acronyms.push('emp');
      if (progsUp.includes('ENHANCED ART PROGRAMME')) acronyms.push('eap');
      if (progsUp.includes('BICULTURAL STUDIES PROGRAMME')) acronyms.push('bsp');
      if (progsUp.includes('LANGUAGE ELECTIVE PROGRAMME')) acronyms.push('lep');
      if (progsUp.includes('ELECTIVE PROGRAMME IN MALAY LANGUAGE')) acronyms.push('emas');
      if (progsUp.includes('REGIONAL STUDIES PROGRAMME')) acronyms.push('rsp');
      if (school.isGifted) acronyms.push('gep', 'gifted');
      if (school.isSap) acronyms.push('sap');
      if (school.isIp) acronyms.push('ip');

      // Find matching aliases for this school
      const schoolAliases: string[] = [...acronyms];
      const normName = normalizeName(school.name).toLowerCase();
      for (const [alias, phrases] of Object.entries(COMMON_ALIASES)) {
        if (phrases.some(p => normName.includes(p))) {
          schoolAliases.push(alias);
        }
      }

      const fullSearchText = [
        school.name,
        school.type,
        school.nature,
        school.mainLevel,
        school.zone,
        school.dgp,
        school.mrt,
        school.bus,
        school.address,
        school.postalCode,
        schoolAliases.join(' '),
        ccaBlobs.join(' '),
        progBlobs,
        moeBlobs,
        mtBlobs,
      ].join(' ').toLowerCase();

      const words = cleanTokens(fullSearchText);
      const wordSet = new Set(words);
      // Also add all aliases directly to wordSet
      for (const al of schoolAliases) {
        wordSet.add(al.toLowerCase());
      }

      return {
        ...school,
        _searchText: fullSearchText,
        _wordSet: wordSet,
        _normName: normName,
        _ccaNames: ccaNames,
      };
    });

    console.log(`Indexed ${allCCAsMap.size} distinct CCAs across ${indexedCache.length} schools!`);
    isInitialized = true;
  } catch (err) {
    console.error('Failed to initialize school data:', err);
  }
}

export function searchSchools(params: SearchFilterParams): SearchResult {
  if (!isInitialized) initializeData();

  const rawQuery = (params.query || '').trim();
  const queryTokens = cleanTokens(rawQuery);
  const level = params.level ? params.level.toUpperCase() : '';
  const zone = params.zone ? params.zone.toUpperCase() : '';
  const ccaCategory = params.ccaCategory ? params.ccaCategory.toUpperCase() : '';
  const nature = params.nature ? params.nature.toUpperCase() : '';

  // Filter pass
  const candidateSchools = indexedCache.filter(school => {
    // Level filter
    if (level && level !== 'ALL') {
      const ml = school.mainLevel.toUpperCase();
      if (level === 'PRIMARY' && !ml.includes('PRIMARY')) return false;
      if (level === 'SECONDARY' && !ml.includes('SECONDARY')) return false;
      if (
        level === 'JC' &&
        !ml.includes('JUNIOR COLLEGE') &&
        !ml.includes('JC') &&
        !ml.includes('MIXED LEVEL') &&
        !ml.includes('CENTRALISED INSTITUTE') &&
        !ml.includes('PRE-UNIVERSITY')
      ) {
        return false;
      }
    }

    // Zone filter
    if (zone && zone !== 'ALL') {
      if (school.zone.toUpperCase() !== zone) return false;
    }

    // Nature filter (Co-ed, Girls, Boys)
    if (nature && nature !== 'ALL') {
      const nat = school.nature.toUpperCase();
      if (nature === 'GIRLS' && !nat.includes('GIRLS')) return false;
      if (nature === 'BOYS' && !nat.includes('BOYS')) return false;
      if (nature === 'CO-ED' && !nat.includes('CO-ED') && !nat.includes('MIXED')) return false;
    }

    // Badge / Flag filters
    if (params.isAutonomous && !school.isAutonomous) return false;
    if (params.isSap && !school.isSap) return false;
    if (params.isIp && !school.isIp) return false;
    if (params.isGifted && !school.isGifted) return false;

    // CCA category filter
    if (ccaCategory && ccaCategory !== 'ALL') {
      const hasCategory = school.ccas.some(c =>
        c.ccaCategory.toUpperCase().includes(ccaCategory)
      );
      if (!hasCategory) return false;
    }

    return true;
  });

  // Calculate search relevance score
  interface ScoredSchool {
    school: IndexedSchool;
    score: number;
    matchedTokenCount: number;
  }

  let scoredList: ScoredSchool[] = [];

  if (queryTokens.length === 0) {
    // No query string - return all filtered schools
    scoredList = candidateSchools.map(school => ({
      school,
      score: 0,
      matchedTokenCount: 0,
    }));
  } else {
    for (const school of candidateSchools) {
      let score = 0;
      let matchedCount = 0;
      const text = school._searchText;
      const normName = school._normName;
      const wordSet = school._wordSet;

      // Check full raw query matches
      const rawLower = rawQuery.toLowerCase();
      if (normName === rawLower || school.name.toLowerCase() === rawLower) {
        score += 600;
      } else if (normName.startsWith(rawLower) || school.name.toLowerCase().startsWith(rawLower)) {
        score += 350;
      } else if (normName.includes(rawLower)) {
        score += 180;
      }

      // Check each token
      for (const token of queryTokens) {
        let tokenMatched = false;

        // For short tokens (<= 3 chars, e.g. ri, jc, mep, ncc), match whole word
        if (token.length <= 3) {
          if (wordSet.has(token)) {
            tokenMatched = true;
            score += 35;
          }
        } else {
          // For longer tokens, match substring or word set
          if (text.includes(token)) {
            tokenMatched = true;
            score += 20;
          }
        }

        // Check aliases if not matched yet
        if (!tokenMatched && COMMON_ALIASES[token]) {
          const aliasMatches = COMMON_ALIASES[token].some(phrase => {
            const phrTokens = cleanTokens(phrase);
            return phrTokens.every(pt => text.includes(pt));
          });
          if (aliasMatches) {
            tokenMatched = true;
            score += 30;
          }
        }

        if (tokenMatched) {
          matchedCount++;
          // High reward for School Name or CCA match
          if (normName.includes(token)) {
            score += 45;
          }
          if (school._ccaNames.some(c => c.toLowerCase().includes(token))) {
            score += 35;
          }
          if (school.programmes.some(p => p.title.toLowerCase().includes(token) || p.domain.toLowerCase().includes(token))) {
            score += 30;
          }
          if (school.dgp.toLowerCase().includes(token) || school.mrt.toLowerCase().includes(token)) {
            score += 25;
          }
        }
      }

      if (matchedCount > 0) {
        scoredList.push({
          school,
          score,
          matchedTokenCount: matchedCount,
        });
      }
    }
  }

  // Determine if we have strict all-token matches
  let isPartialMatch = false;
  let finalMatches: ScoredSchool[] = [];

  if (queryTokens.length === 0) {
    finalMatches = scoredList;
  } else {
    const allTokenMatches = scoredList.filter(
      item => item.matchedTokenCount >= queryTokens.length
    );

    if (allTokenMatches.length > 0) {
      finalMatches = allTokenMatches;
    } else if (scoredList.length > 0) {
      // Fallback to best partial matches so user doesn't hit a blank screen
      finalMatches = scoredList;
      isPartialMatch = true;
    } else {
      finalMatches = [];
    }
  }

  // Sort by score descending, then by school name alphabetically
  finalMatches.sort((a, b) => {
    if (b.matchedTokenCount !== a.matchedTokenCount) {
      return b.matchedTokenCount - a.matchedTokenCount;
    }
    if (b.score !== a.score) return b.score - a.score;
    return a.school.name.localeCompare(b.school.name);
  });

  // Calculate matching CCAs for suggestions / quick explore
  const matchingCCAs: { ccaName: string; category: string; schoolCount: number }[] = [];
  if (queryTokens.length > 0) {
    const qLower = rawQuery.toLowerCase();
    for (const [ccaName, info] of allCCAsMap.entries()) {
      if (
        ccaName.toLowerCase().includes(qLower) ||
        queryTokens.some(tok => ccaName.toLowerCase().includes(tok))
      ) {
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

  const total = finalMatches.length;
  const page = params.page || 1;
  const limit = params.limit || 60;
  const paginated = finalMatches
    .slice((page - 1) * limit, page * limit)
    .map(item => {
      const { _searchText, _wordSet, _normName, _ccaNames, ...cleanSchool } = item.school;
      return cleanSchool as School;
    });

  return {
    schools: paginated,
    total,
    matchingCCAs: matchingCCAs.slice(0, 12),
    featuredSuggestions,
    isPartialMatch,
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
  const target = normalizeName(name);
  const found = indexedCache.find(s => s._normName === target || normalizeName(s.name) === target);
  if (found) {
    const { _searchText, _wordSet, _normName, _ccaNames, ...cleanSchool } = found;
    return cleanSchool as School;
  }
  return undefined;
}

export function getRandomSchool(): School | undefined {
  if (!isInitialized) initializeData();
  if (schoolsCache.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * schoolsCache.length);
  return schoolsCache[randomIndex];
}
