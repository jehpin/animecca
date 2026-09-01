import Papa from 'papaparse';
import { School, SearchFilterParams, SearchResult } from '../types';

// In-memory cache for client-side instant searches
let schoolsCache: School[] = [];
const allCCAsMap = new Map<string, { category: string; schools: Set<string> }>();
let isLoaded = false;
let isLoading = false;
let loadError: string | null = null;

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

interface IndexedSchool extends School {
  _searchText: string;
  _wordSet: Set<string>;
  _normName: string;
  _ccaNames: string[];
}

let indexedCache: IndexedSchool[] = [];

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

// Fetch and parse single CSV file with PapaParse
async function fetchAndParseCSV<T>(url: string): Promise<T[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  return new Promise((resolve, reject) => {
    Papa.parse<T>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim(),
      complete: results => {
        if (results.errors && results.errors.length > 0) {
          console.warn(`Warnings while parsing ${url}:`, results.errors.slice(0, 3));
        }
        resolve(results.data);
      },
      error: err => {
        reject(new Error(`PapaParse failed for ${url}: ${err.message}`));
      },
    });
  });
}

export async function loadSchoolDataFromCSV(): Promise<School[]> {
  if (isLoaded && schoolsCache.length > 0) {
    return schoolsCache;
  }

  if (isLoading) {
    // Wait for in-progress load
    while (isLoading) {
      await new Promise(r => setTimeout(r, 50));
    }
    if (isLoaded && schoolsCache.length > 0) return schoolsCache;
    if (loadError) throw new Error(loadError);
  }

  isLoading = true;
  loadError = null;

  try {
    console.log('Fetching 5 static CSV files from root relative paths...');
    
    const [genData, ccaData, moeData, progData, subData] = await Promise.all([
      fetchAndParseCSV<Record<string, string>>('/general-information-of-schools.csv'),
      fetchAndParseCSV<Record<string, string>>('/co-curricular-activities.csv'),
      fetchAndParseCSV<Record<string, string>>('/moe-programmes.csv').catch(err => {
        console.warn('Optional /moe-programmes.csv fetch issue, continuing:', err);
        return [] as Record<string, string>[];
      }),
      fetchAndParseCSV<Record<string, string>>('/school-distinctive-programmes.csv').catch(err => {
        console.warn('Optional /school-distinctive-programmes.csv fetch issue, continuing:', err);
        return [] as Record<string, string>[];
      }),
      fetchAndParseCSV<Record<string, string>>('/subjects-offered.csv').catch(err => {
        console.warn('Optional /subjects-offered.csv fetch issue, continuing:', err);
        return [] as Record<string, string>[];
      }),
    ]);

    if (!genData || genData.length === 0) {
      throw new Error('General information CSV contains no records.');
    }

    const schoolLookup = new Map<string, School>();
    const builtSchools: School[] = [];

    // 1. General Information Processing
    for (const row of genData) {
      const name = (row.school_name || row.School_Name || row.name || row['School Name'] || '').trim();
      if (!name) continue;

      const mt: string[] = [];
      const mt1 = (row.mothertongue1_code || row.mothertongue1 || '').trim();
      const mt2 = (row.mothertongue2_code || row.mothertongue2 || '').trim();
      const mt3 = (row.mothertongue3_code || row.mothertongue3 || '').trim();
      if (mt1 && mt1.toLowerCase() !== 'na') mt.push(mt1.toUpperCase());
      if (mt2 && mt2.toLowerCase() !== 'na') mt.push(mt2.toUpperCase());
      if (mt3 && mt3.toLowerCase() !== 'na') mt.push(mt3.toUpperCase());

      const sapStr = (row.sap_ind || row.isSap || '').toString().toLowerCase();
      const autoStr = (row.autonomous_ind || row.isAutonomous || '').toString().toLowerCase();
      const giftStr = (row.gifted_ind || row.isGifted || '').toString().toLowerCase();
      const ipStr = (row.ip_ind || row.isIp || '').toString().toLowerCase();

      const school: School = {
        name,
        url: (row.url_address || row.url || '').trim(),
        address: (row.address || '').trim(),
        postalCode: (row.postal_code || row.postalCode || '').trim(),
        telephone: (row.telephone_no || row.telephone || '').trim(),
        email: (row.email_address || row.email || '').trim(),
        mrt: (row.mrt_desc || row.mrt || '').trim(),
        bus: (row.bus_desc || row.bus || '').trim(),
        principal: (row.principal_name || row.principal || '').trim(),
        firstVp: (row.first_vp_name || row.firstVp || '').trim(),
        secondVp: (row.second_vp_name || row.secondVp || '').trim(),
        zone: (row.zone_code || row.zone || '').trim(),
        dgp: (row.dgp_code || row.dgp || '').trim(),
        type: (row.type_code || row.type || '').trim(),
        nature: (row.nature_code || row.nature || '').trim(),
        session: (row.session_code || row.session || '').trim(),
        mainLevel: (row.mainlevel_code || row.mainLevel || '').trim(),
        isSap: sapStr === 'yes' || sapStr === 'true' || sapStr === '1',
        isAutonomous: autoStr === 'yes' || autoStr === 'true' || autoStr === '1',
        isGifted: giftStr === 'yes' || giftStr === 'true' || giftStr === '1',
        isIp: ipStr === 'yes' || ipStr === 'true' || ipStr === '1',
        motherTongues: mt.length > 0 ? mt : ['CHINESE', 'MALAY', 'TAMIL'],
        ccas: [],
        programmes: [],
        moeProgrammes: [],
        subjects: [],
      };

      builtSchools.push(school);
      const norm = normalizeName(name);
      schoolLookup.set(norm, school);
      if (norm.endsWith(' SCHOOL')) {
        schoolLookup.set(norm.slice(0, -7).trim(), school);
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

    // 2. Attach CCAs
    for (const row of ccaData) {
      const schName = row.school_name || row.schoolName;
      if (!schName) continue;
      const s = findSchoolObj(schName);
      if (s) {
        const cat = (row.cca_grouping_desc || row.ccaCategory || row.cca_category || 'CLUBS AND SOCIETIES').trim();
        const grp = (row.cca_generic_name || row.ccaGrouping || row.cca_grouping || '').trim();
        const custom = (row.cca_customized_name || row.ccaCustomizedName || '').trim();
        s.ccas.push({
          schoolName: s.name,
          schoolSection: (row.school_section || row.schoolSection || s.mainLevel).trim(),
          ccaCategory: cat,
          ccaGrouping: grp || custom || 'Activity',
          ccaCustomizedName: custom && custom.toLowerCase() !== 'na' ? custom : null,
        });
      }
    }

    // 3. Attach MOE Special Programmes
    for (const row of moeData) {
      const schName = row.school_name || row.schoolName;
      const desc = (row.moe_programme_desc || row.programme || '').trim();
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

    // 4. Attach Distinctive Programmes (ALP & LLP)
    for (const row of progData) {
      const schName = row.school_name || row.schoolName;
      if (!schName) continue;
      const s = findSchoolObj(schName);
      if (s) {
        const alpTitle = (row.alp_title || '').trim();
        const alpDomain = (row.alp_domain || '').trim();
        const llpTitle = (row.llp_title || '').trim();
        const llpDomain = (row.llp_domain1 || row.llp_domain || '').trim();

        if (alpTitle && alpTitle.toLowerCase() !== 'na' && !s.programmes.some(p => p.title === alpTitle)) {
          s.programmes.push({
            schoolName: s.name,
            programmeType: 'ALP',
            domain: alpDomain && alpDomain.toLowerCase() !== 'na' ? alpDomain : 'Applied Learning',
            title: alpTitle,
          });
        }
        if (llpTitle && llpTitle.toLowerCase() !== 'na' && !s.programmes.some(p => p.title === llpTitle)) {
          s.programmes.push({
            schoolName: s.name,
            programmeType: 'LLP',
            domain: llpDomain && llpDomain.toLowerCase() !== 'na' ? llpDomain : 'Learning for Life',
            title: llpTitle,
          });
        }
      }
    }

    // 5. Attach Subjects
    for (const row of subData) {
      const schName = row.school_name || row.schoolName;
      const sub = (row.subject_desc || row.subject || '').trim();
      if (!schName || !sub) continue;
      const s = findSchoolObj(schName);
      if (s && !s.subjects.includes(sub)) {
        s.subjects.push(sub);
      }
    }

    // Build In-Memory Index & CCA Map
    allCCAsMap.clear();
    indexedCache = builtSchools.map(school => {
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
      const subBlobs = school.subjects.join(' ');
      const mtBlobs = school.motherTongues.join(' ');

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
        subBlobs,
        mtBlobs,
      ].join(' ').toLowerCase();

      const words = cleanTokens(fullSearchText);
      const wordSet = new Set(words);
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

    schoolsCache = builtSchools;
    isLoaded = true;
    console.log(`Successfully parsed 5 CSV files: ${schoolsCache.length} schools and ${allCCAsMap.size} CCAs loaded.`);
    return schoolsCache;
  } catch (err: any) {
    const msg = err?.message || 'Unknown error parsing CSV files';
    loadError = msg;
    console.error('Error loading CSV files:', err);
    throw err;
  } finally {
    isLoading = false;
  }
}

export function searchSchoolsClient(params: SearchFilterParams): SearchResult {
  const rawQuery = (params.query || '').trim();
  const queryTokens = cleanTokens(rawQuery);
  const level = params.level ? params.level.toUpperCase() : '';
  const zone = params.zone ? params.zone.toUpperCase() : '';
  const ccaCategory = params.ccaCategory ? params.ccaCategory.toUpperCase() : '';
  const nature = params.nature ? params.nature.toUpperCase() : '';

  // Filter pass
  const candidateSchools = indexedCache.filter(school => {
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

    if (zone && zone !== 'ALL') {
      if (school.zone.toUpperCase() !== zone) return false;
    }

    if (nature && nature !== 'ALL') {
      const nat = school.nature.toUpperCase();
      if (nature === 'GIRLS' && !nat.includes('GIRLS')) return false;
      if (nature === 'BOYS' && !nat.includes('BOYS')) return false;
      if (nature === 'CO-ED' && !nat.includes('CO-ED') && !nat.includes('MIXED')) return false;
    }

    if (params.isAutonomous && !school.isAutonomous) return false;
    if (params.isSap && !school.isSap) return false;
    if (params.isIp && !school.isIp) return false;
    if (params.isGifted && !school.isGifted) return false;

    if (ccaCategory && ccaCategory !== 'ALL') {
      const hasCategory = school.ccas.some(c =>
        c.ccaCategory.toUpperCase().includes(ccaCategory)
      );
      if (!hasCategory) return false;
    }

    return true;
  });

  interface ScoredSchool {
    school: IndexedSchool;
    score: number;
    matchedTokenCount: number;
  }

  let scoredList: ScoredSchool[] = [];

  if (queryTokens.length === 0) {
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

      const rawLower = rawQuery.toLowerCase();
      if (normName === rawLower || school.name.toLowerCase() === rawLower) {
        score += 600;
      } else if (normName.startsWith(rawLower) || school.name.toLowerCase().startsWith(rawLower)) {
        score += 350;
      } else if (normName.includes(rawLower)) {
        score += 180;
      }

      for (const token of queryTokens) {
        let tokenMatched = false;

        if (token.length <= 3) {
          if (wordSet.has(token)) {
            tokenMatched = true;
            score += 35;
          }
        } else {
          if (text.includes(token)) {
            tokenMatched = true;
            score += 20;
          }
        }

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
          if (normName.includes(token)) score += 45;
          if (school._ccaNames.some(c => c.toLowerCase().includes(token))) score += 35;
          if (school.programmes.some(p => p.title.toLowerCase().includes(token) || p.domain.toLowerCase().includes(token))) score += 30;
          if (school.dgp.toLowerCase().includes(token) || school.mrt.toLowerCase().includes(token)) score += 25;
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
      finalMatches = scoredList;
      isPartialMatch = true;
    } else {
      finalMatches = [];
    }
  }

  finalMatches.sort((a, b) => {
    if (b.matchedTokenCount !== a.matchedTokenCount) {
      return b.matchedTokenCount - a.matchedTokenCount;
    }
    if (b.score !== a.score) return b.score - a.score;
    return a.school.name.localeCompare(b.school.name);
  });

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

export function getAllCCAsClient() {
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

export function getRandomSchoolClient(): School | undefined {
  if (schoolsCache.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * schoolsCache.length);
  return schoolsCache[randomIndex];
}

export function getLoadError(): string | null {
  return loadError;
}

export function isDataLoaded(): boolean {
  return isLoaded;
}
