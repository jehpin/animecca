export interface Mascot {
  id: string;
  name: string;
  role: string;
  hairColor: string;
  avatar: string;
  dialogues: {
    welcome: string;
    searching: string;
    resultsFound: string;
    noResults: string;
    ccaSelected: string;
    gacha: string;
    share: string;
  };
}

// References to the generated anime schoolgirl assets
export const MASCOTS: Record<string, Mascot> = {
  konata: {
    id: 'konata',
    name: 'Kona-chan',
    role: 'Anime & Gaming Club Leader (Blue Sailor)',
    hairColor: 'text-sky-600',
    avatar: '/src/assets/images/mascot_guide_blue_1788253079499.jpg',
    dialogues: {
      welcome: 'Konnichiwa! Ready to find the dream school and coolest CCAs? Type anything in the search bar! (≧∇≦)/',
      searching: 'Searching through all Singapore schools and clubs... Tada~! ✨',
      resultsFound: 'Sugoi! Look at all these awesome CCAs and school activities! Which one are you joining? (b ᵔ▽ᵔ)b',
      noResults: 'Hmm... Nothing found with that name. Try searching "Wushu", "Band", "Robotics", or a location like "Bishan"! (｡•́︿•̀｡)',
      ccaSelected: 'Ooh, that CCA is legendary! Let’s share this to your WhatsApp study group! 📱✨',
      gacha: '✨ LUCKY GACHA! ✨ Let the anime gods pick an exciting school for you! (☆ω☆)',
      share: 'Sent to WhatsApp! Your friends are gonna love this lineup! (๑˃̵ᴗ˂̵)و',
    },
  },
  miyuki: {
    id: 'miyuki',
    name: 'Miyuki-senpai',
    role: 'Class Representative (Pink Sailor)',
    hairColor: 'text-pink-600',
    avatar: '/src/assets/images/mascot_guide_pink_1788253092430.jpg',
    dialogues: {
      welcome: 'Hello there! I have gathered the official Ministry of Education dataset for you to explore! ( ˘͈ ᵕ ˘͈ )',
      searching: 'Cross-referencing MOE Collection 457 records for you right now...',
      resultsFound: 'Here are the comprehensive details including Applied Learning (ALP) and Life Learning (LLP) programmes! 📚',
      noResults: 'Ara? Could you double-check the spelling or try selecting one of the popular filter tags above? 🌸',
      ccaSelected: 'Participating in CCAs develops excellent leadership and holistic life skills! ✨',
      gacha: 'A serendipitous discovery! Take a look at this school’s distinctive programmes! 🌸',
      share: 'Sharing is caring! All the formatted details and MRT locations are ready for your friends! 💌',
    },
  },
  kagami: {
    id: 'kagami',
    name: 'Kagami-chan',
    role: 'Disciplinary Committee (Twin-tails)',
    hairColor: 'text-indigo-600',
    avatar: '/src/assets/images/mascot_guide_purple_1788253106338.jpg',
    dialogues: {
      welcome: 'Hmph! Don’t just slack off—pick a school with rigorous CCAs and give it your 100%! (*\'へ\'*)',
      searching: 'Checking the roster... Better be something good!',
      resultsFound: 'Found them! Look through the uniformed groups and sports leagues carefully! (ò_óˇ)',
      noResults: 'Oi, nothing came up! Stop making typos and search for real CCAs like "NCC" or "Floorball"! 💢',
      ccaSelected: 'Nice pick! Commitment and regular training are key to getting high LEAPS points! 🎖️',
      gacha: 'Feeling adventurous, huh? Let’s see what random school fate has in store for you! ⚡',
      share: 'Don’t forget to tell your squad on WhatsApp so they don’t register for the wrong school! 📲',
    },
  },
};
