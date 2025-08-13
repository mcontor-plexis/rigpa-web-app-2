// Import additional terms from your .ts file
import { additionalTerms } from './AdditionalDzogchenTerms';

export interface DzogchenTerm {
  id: number;
  tibetanScript: string;
  wileyScript: string;
  englishTransliteration: string;
  englishTranslation: string;
}

// Base terms (keeping current 20 as examples)
const baseTerms: DzogchenTerm[] = [
  { id: 1, tibetanScript: 'རིག་པ', wileyScript: 'rig pa', englishTransliteration: 'Rigpa', englishTranslation: 'Pure awareness, the natural state of mind' },
  { id: 2, tibetanScript: 'རྫོགས་ཆེན', wileyScript: 'rdzogs chen', englishTransliteration: 'Dzogchen', englishTranslation: 'The Great Perfection, highest teaching in Tibetan Buddhism' },
  { id: 3, tibetanScript: 'ཀ་དག', wileyScript: 'ka dag', englishTransliteration: 'Kadag', englishTranslation: 'Primordial purity, the empty essence of awareness' },
  { id: 4, tibetanScript: 'ལྷུན་གྲུབ', wileyScript: 'lhun grub', englishTransliteration: 'Lhundrub', englishTranslation: 'Spontaneous presence, the luminous nature of awareness' },
  { id: 5, tibetanScript: 'ཐུགས་རྗེ', wileyScript: 'thugs rje', englishTransliteration: 'Thugs-je', englishTranslation: 'Compassion, the spontaneous energy of awareness' },
  { id: 6, tibetanScript: 'གཞི', wileyScript: 'gzhi', englishTransliteration: 'Zhi', englishTranslation: 'The ground, the basis of all phenomena' },
  { id: 7, tibetanScript: 'ལམ', wileyScript: 'lam', englishTransliteration: 'Lam', englishTranslation: 'The path, the journey of spiritual development' },
  { id: 8, tibetanScript: 'འབྲས་བུ', wileyScript: "'bras bu", englishTransliteration: 'Drebü', englishTranslation: 'The fruition, the result of spiritual practice' },
  { id: 9, tibetanScript: 'སེམས་ཉིད', wileyScript: 'sems nyid', englishTransliteration: 'Sem-nyid', englishTranslation: 'The nature of mind, the essence of consciousness' },
  { id: 10, tibetanScript: 'ཡེ་ཤེས', wileyScript: 'ye shes', englishTransliteration: 'Yeshe', englishTranslation: 'Primordial wisdom, the innate knowing quality of mind' },
  { id: 11, tibetanScript: 'སྒྱུ་མ', wileyScript: 'sgyu ma', englishTransliteration: 'Gyuma', englishTranslation: 'Illusion, the dreamlike nature of phenomena' },
  { id: 12, tibetanScript: 'བདེ་བ', wileyScript: 'bde ba', englishTransliteration: 'Dewa', englishTranslation: 'Bliss, the joyful aspect of enlightened awareness' },
  { id: 13, tibetanScript: 'གསལ་བ', wileyScript: 'gsal ba', englishTransliteration: 'Salwa', englishTranslation: 'Clarity, the luminous aspect of awareness' },
  { id: 14, tibetanScript: 'མི་རྟོག', wileyScript: 'mi rtog', englishTransliteration: 'Mitok', englishTranslation: 'Non-conceptual, beyond discursive thought' },
  { id: 15, tibetanScript: 'རང་གྲོལ', wileyScript: 'rang grol', englishTransliteration: 'Rangdrol', englishTranslation: 'Self-liberation, the spontaneous freedom of awareness' },
  { id: 16, tibetanScript: 'ཞི་གནས', wileyScript: 'zhi gnas', englishTransliteration: 'Zhine', englishTranslation: 'Calm abiding, meditative tranquility' },
  { id: 17, tibetanScript: 'ལྷག་མཐོང', wileyScript: 'lhag mthong', englishTransliteration: 'Lhakthong', englishTranslation: 'Special insight, penetrating wisdom' },
  { id: 18, tibetanScript: 'བྱང་ཆུབ', wileyScript: 'byang chub', englishTransliteration: 'Changchub', englishTranslation: 'Enlightenment, the awakened state' },
  { id: 19, tibetanScript: 'སྤྲོས་བྲལ', wileyScript: 'spros bral', englishTransliteration: 'Trödral', englishTranslation: 'Beyond elaboration, free from conceptual fabrication' },
  { id: 20, tibetanScript: 'མ་བསྐྱེད', wileyScript: 'ma bskyed', englishTransliteration: 'Ma-kye', englishTranslation: 'Unborn, the uncreated nature of phenomena' },
];

// Merge all terms and reassign IDs sequentially
export const dzogchenTermsData: DzogchenTerm[] = [
  ...baseTerms,
  ...additionalTerms  // Now includes your 228 additional terms!
].map((term, index) => ({
  ...term,
  id: index + 1  // Reassign sequential IDs starting from 1
}));
