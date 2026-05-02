import React, { useState } from 'react';

interface Props {
  onClose: () => void;
}

const TABS = ['Script & Sounds', 'Sentence Structure', 'Particles', 'Verb System', 'Nouns & Honorifics', 'Common Patterns'] as const;
type Tab = typeof TABS[number];

// ── Shared primitives ─────────────────────────────────────────────────────────

interface LetterCardProps {
  tibetan: string;
  wylie: string;
  sound: string;
}
const LetterCard: React.FC<LetterCardProps> = ({ tibetan, wylie, sound }) => (
  <div className="letter-card">
    <div className="tibetan-letter">{tibetan}</div>
    <div className="letter-info">
      <div className="wylie">{wylie}</div>
      <div className="sound">{sound}</div>
    </div>
  </div>
);

interface GrammarCardProps {
  title: string;
  rule: string;
  examples?: { tibetan: string; wylie: string; english: string }[];
  note?: string;
}
const GrammarCard: React.FC<GrammarCardProps> = ({ title, rule, examples, note }) => (
  <div className="grammar-card">
    <h4 className="grammar-card-title">{title}</h4>
    <p className="grammar-rule">{rule}</p>
    {examples && examples.map((ex, i) => (
      <div key={i} className="grammar-example">
        <div className="grammar-tibetan">{ex.tibetan}</div>
        <div className="grammar-wylie">{ex.wylie}</div>
        <div className="grammar-english">{ex.english}</div>
      </div>
    ))}
    {note && <p className="grammar-note">{note}</p>}
  </div>
);

// ── Tab: Script & Sounds ──────────────────────────────────────────────────────

const CONSONANTS: LetterCardProps[] = [
  { tibetan: 'ཀ', wylie: 'ka', sound: '[ka]' },
  { tibetan: 'ཁ', wylie: 'kha', sound: '[kʰa]' },
  { tibetan: 'ག', wylie: 'ga', sound: '[ga]' },
  { tibetan: 'ང', wylie: 'nga', sound: '[ŋa]' },
  { tibetan: 'ཅ', wylie: 'ca', sound: '[tʃa]' },
  { tibetan: 'ཆ', wylie: 'cha', sound: '[tʃʰa]' },
  { tibetan: 'ཇ', wylie: 'ja', sound: '[dʒa]' },
  { tibetan: 'ཉ', wylie: 'nya', sound: '[ɲa]' },
  { tibetan: 'ཏ', wylie: 'ta', sound: '[ta]' },
  { tibetan: 'ཐ', wylie: 'tha', sound: '[tʰa]' },
  { tibetan: 'ད', wylie: 'da', sound: '[da]' },
  { tibetan: 'ན', wylie: 'na', sound: '[na]' },
  { tibetan: 'པ', wylie: 'pa', sound: '[pa]' },
  { tibetan: 'ཕ', wylie: 'pha', sound: '[pʰa]' },
  { tibetan: 'བ', wylie: 'ba', sound: '[ba]' },
  { tibetan: 'མ', wylie: 'ma', sound: '[ma]' },
  { tibetan: 'ཙ', wylie: 'tsa', sound: '[tsa]' },
  { tibetan: 'ཚ', wylie: 'tsha', sound: '[tsʰa]' },
  { tibetan: 'ཛ', wylie: 'dza', sound: '[dza]' },
  { tibetan: 'ཝ', wylie: 'wa', sound: '[wa]' },
  { tibetan: 'ཞ', wylie: 'zha', sound: '[ʒa]' },
  { tibetan: 'ཟ', wylie: 'za', sound: '[za]' },
  { tibetan: 'འ', wylie: "'a", sound: '[ʔa]' },
  { tibetan: 'ཡ', wylie: 'ya', sound: '[ja]' },
  { tibetan: 'ར', wylie: 'ra', sound: '[ra]' },
  { tibetan: 'ལ', wylie: 'la', sound: '[la]' },
  { tibetan: 'ཤ', wylie: 'sha', sound: '[ʃa]' },
  { tibetan: 'ས', wylie: 'sa', sound: '[sa]' },
  { tibetan: 'ཧ', wylie: 'ha', sound: '[ha]' },
  { tibetan: 'ཨ', wylie: 'a', sound: '[a]' },
];

const VOWELS: LetterCardProps[] = [
  { tibetan: 'ཀི', wylie: 'ki', sound: '[ki]' },
  { tibetan: 'ཀུ', wylie: 'ku', sound: '[ku]' },
  { tibetan: 'ཀེ', wylie: 'ke', sound: '[ke]' },
  { tibetan: 'ཀོ', wylie: 'ko', sound: '[ko]' },
];

const NUMBERS: LetterCardProps[] = [
  { tibetan: '༠', wylie: '0', sound: 'zero' },
  { tibetan: '༡', wylie: '1', sound: 'one' },
  { tibetan: '༢', wylie: '2', sound: 'two' },
  { tibetan: '༣', wylie: '3', sound: 'three' },
  { tibetan: '༤', wylie: '4', sound: 'four' },
  { tibetan: '༥', wylie: '5', sound: 'five' },
  { tibetan: '༦', wylie: '6', sound: 'six' },
  { tibetan: '༧', wylie: '7', sound: 'seven' },
  { tibetan: '༨', wylie: '8', sound: 'eight' },
  { tibetan: '༩', wylie: '9', sound: 'nine' },
];

const PUNCTUATION: LetterCardProps[] = [
  { tibetan: '།', wylie: '|', sound: 'shad (clause break)' },
  { tibetan: '༎', wylie: '||', sound: 'double shad (end of verse)' },
  { tibetan: '༄', wylie: '@', sound: 'head mark (text opening)' },
  { tibetan: 'ཿ', wylie: ':', sound: 'visarga (breath mark)' },
  { tibetan: '་', wylie: '.', sound: 'tsheg (syllable separator)' },
];

const ScriptAndSoundsTab: React.FC = () => (
  <div className="grammar-tab-content">
    <div className="grammar-intro-box">
      <p>
        Tibetan uses the <strong>Uchen script</strong> (དབུ་ཅན།), derived from Indian Brahmi via 7th-century
        Tibet. Each syllable is written left-to-right and separated by a small dot called a <em>tsheg</em> (་).
        Consonants can be stacked vertically — the root letter sits in the middle; prefixes and suffixes
        appear before and after it horizontally; superscript and subscript letters stack above and below.
      </p>
    </div>

    <div className="letter-group">
      <h4>Consonants (གསལ་བྱེད། — 30 letters)</h4>
      <div className="letters-row">
        {CONSONANTS.map(c => <LetterCard key={c.wylie} {...c} />)}
      </div>
    </div>

    <div className="letter-group">
      <h4>Vowel Signs (དབྱངས་རིགས། — added above/below consonants)</h4>
      <div className="letters-row">
        {VOWELS.map(v => <LetterCard key={v.wylie} {...v} />)}
      </div>
      <p className="grammar-note">
        The inherent vowel of every consonant is <em>a</em>. The four vowel signs modify it to <em>i, u, e, o</em>.
      </p>
    </div>

    <div className="letter-group">
      <h4>Stacked Consonants (མཐའ་འཛིན།)</h4>
      <div className="grammar-stack-grid">
        <div className="grammar-stack-example">
          <div className="tibetan-letter">སྒྲ</div>
          <div className="wylie">sgra</div>
          <div className="sound">"sound" — s + g + r stacked</div>
        </div>
        <div className="grammar-stack-example">
          <div className="tibetan-letter">དབྱངས</div>
          <div className="wylie">dbyangs</div>
          <div className="sound">"vowel / melody"</div>
        </div>
        <div className="grammar-stack-example">
          <div className="tibetan-letter">སྐྱེ</div>
          <div className="wylie">skye</div>
          <div className="sound">"to arise / to be born"</div>
        </div>
        <div className="grammar-stack-example">
          <div className="tibetan-letter">གཉིས</div>
          <div className="wylie">gnyis</div>
          <div className="sound">"two"</div>
        </div>
      </div>
      <p className="grammar-note">
        Prefix consonants (མི་ཆེ་བ།) are silent in modern spoken Tibetan but affect the tone/register of the
        root letter. They include: ག, ད, བ, མ, འ.
      </p>
    </div>

    <div className="letter-group">
      <h4>Numbers (གྲངས་ཀ།)</h4>
      <div className="letters-row">
        {NUMBERS.map(n => <LetterCard key={n.wylie} {...n} />)}
      </div>
    </div>

    <div className="letter-group">
      <h4>Punctuation (ཚེག་བར།)</h4>
      <div className="letters-row">
        {PUNCTUATION.map(p => <LetterCard key={p.wylie} {...p} />)}
      </div>
    </div>
  </div>
);

// ── Tab: Sentence Structure ───────────────────────────────────────────────────

const SentenceStructureTab: React.FC = () => (
  <div className="grammar-tab-content">
    <div className="grammar-intro-box">
      <p>
        Tibetan is a <strong>Subject-Object-Verb (SOV)</strong> language. The verb always comes last.
        Modifiers precede what they modify: adjectives precede nouns, relative clauses precede their head noun,
        adverbs precede verbs.
      </p>
    </div>

    <div className="grammar-cards-grid">
      <GrammarCard
        title="Basic SOV Order"
        rule="Subject + Object + Verb. The verb is always sentence-final."
        examples={[
          { tibetan: 'ང་ཆུ་འཐུང་།', wylie: 'nga chu \'thung', english: 'I drink water.' },
          { tibetan: 'ཁོ་མོ་དེབ་ཀློག་གི་རེད།', wylie: 'kho mo deb klog gi red', english: 'She reads books.' },
        ]}
      />
      <GrammarCard
        title="Adjective Placement"
        rule="Adjectives follow the noun in Tibetan (noun + adjective), opposite to English."
        examples={[
          { tibetan: 'ཆུ་ཁོལ་མ།', wylie: 'chu khol ma', english: 'hot water (water hot)' },
          { tibetan: 'གནམ་མཛེས་པ།', wylie: 'gnam mdzes pa', english: 'beautiful sky (sky beautiful)' },
          { tibetan: 'མི་ཐུབ་པ།', wylie: 'mi thub pa', english: 'capable person (person capable)' },
        ]}
      />
      <GrammarCard
        title="Copula Sentences (is / am / are)"
        rule="Use ཡིན། (yin) for first-person or known facts. Use རེད། (red) for third-person, reported or evident facts."
        examples={[
          { tibetan: 'ང་བོད་པ་ཡིན།', wylie: 'nga bod pa yin', english: 'I am Tibetan.' },
          { tibetan: 'ཁོ་ལྷ་ས་ལས་རེད།', wylie: 'kho lha sa las red', english: 'He is from Lhasa.' },
          { tibetan: 'དེ་ཆོས་ཁང་རེད།', wylie: 'de chos khang red', english: 'That is a temple.' },
        ]}
      />
      <GrammarCard
        title="Existential Sentences (has / exists)"
        rule="ཡོད། (yod) = egophoric 'there is / I have'. མེད། (med) = negative. འདུག ('dug) = evidential 'there is' (perceived directly)."
        examples={[
          { tibetan: 'ང་ལ་དེབ་ཡོད།', wylie: 'nga la deb yod', english: 'I have a book. (lit. To me a book exists.)' },
          { tibetan: 'གནམ་གཤིས་ལེགས་པོ་འདུག', wylie: 'gnam gshis legs po \'dug', english: 'The weather is nice. (I can see it.)' },
          { tibetan: 'དུས་ཚོད་མེད།', wylie: 'dus tshod med', english: 'There is no time.' },
        ]}
      />
      <GrammarCard
        title="Negation"
        rule="Negate verbs with མི། (mi) before the verb. Negate ཡིན with མིན། Negate ཡོད with མེད། Use མ། for past negation."
        examples={[
          { tibetan: 'ང་མི་འགྲོ།', wylie: 'nga mi \'gro', english: 'I will not go.' },
          { tibetan: 'ཁོ་བོད་པ་མིན།', wylie: 'kho bod pa min', english: 'He is not Tibetan.' },
          { tibetan: 'ང་མ་ཟས།', wylie: 'nga ma zas', english: 'I did not eat.' },
        ]}
      />
      <GrammarCard
        title="Yes/No Questions"
        rule="Add འམ། ('am) or གམ། (gam) or ཡམ། (yam) to the end of a statement to form a question."
        examples={[
          { tibetan: 'ཁྱེད་རང་བོད་པ་ཡིན་ནམ།', wylie: 'khyed rang bod pa yin nam', english: 'Are you Tibetan?' },
          { tibetan: 'ཁྱེད་རང་ལྷ་ས་ལ་ཕེབས་ཀྱི་ཡིན་ནམ།', wylie: 'khyed rang lha sa la phebs kyi yin nam', english: 'Are you going to Lhasa?' },
        ]}
      />
      <GrammarCard
        title="Relative Clauses"
        rule="Relative clauses precede the noun they modify and end with a nominalizer (པ/བ or ས)."
        examples={[
          { tibetan: 'ང་མཐོང་བའི་མི།', wylie: 'nga mthong ba\'i mi', english: 'the person whom I saw (I-saw-person)' },
          { tibetan: 'ཁོ་བྱིན་པའི་དེབ།', wylie: 'kho byin pa\'i deb', english: 'the book that he gave (he-gave-book)' },
        ]}
      />
    </div>
  </div>
);

// ── Tab: Particles ────────────────────────────────────────────────────────────

const ParticlesTab: React.FC = () => (
  <div className="grammar-tab-content">
    <div className="grammar-intro-box">
      <p>
        Particles are the backbone of Tibetan grammar. They attach to the end of nouns and verb phrases to
        show grammatical relationships. Most particles have multiple <em>allomorphs</em> — alternate forms
        chosen based on the final consonant of the preceding syllable. The table below lists the primary form
        and its main alternates.
      </p>
    </div>

    <div className="grammar-cards-grid">
      <GrammarCard
        title="Genitive གི། — 'of', possession"
        rule="Forms: གི། གྱི། ཀྱི། ཡི། འི། — links nouns showing possession or description. Choice depends on the final consonant of the preceding syllable."
        examples={[
          { tibetan: 'བོད་ཀྱི་ཆོས།', wylie: 'bod kyi chos', english: "Tibet's Dharma / the Dharma of Tibet" },
          { tibetan: 'ཆོས་ཀྱི་རྒྱལ་པོ།', wylie: 'chos kyi rgyal po', english: 'King of Dharma' },
          { tibetan: 'ཤེས་རབ་ཀྱི་ཕ་རོལ་ཏུ་ཕྱིན་པ།', wylie: "shes rab kyi pha rol tu phyin pa", english: 'Gone to the far side of wisdom (Prajnaparamita)' },
        ]}
        note="Quick rule: use གི after ར/ལ/vowels; ཀྱི after ག/ང; གྱི after ད/ན/བ/མ."
      />
      <GrammarCard
        title="Dative/Locative ལ། — 'to', 'for', 'at', 'in'"
        rule="ལ། is invariable (one form only). It marks direction, indirect object, location, and the logical subject of verbs of experience."
        examples={[
          { tibetan: 'ལྷ་ས་ལ་འགྲོ།', wylie: "lha sa la 'gro", english: 'go to Lhasa' },
          { tibetan: 'ང་ལ་དེབ་ཡོད།', wylie: 'nga la deb yod', english: 'I have a book. (lit. To me a book exists.)' },
          { tibetan: 'ཀུན་ལ་ཕན་པ།', wylie: 'kun la phan pa', english: 'beneficial to all' },
        ]}
      />
      <GrammarCard
        title="Ablative ལས། / ནས། — 'from', 'since', 'than'"
        rule="ལས། (las) marks origin or comparison ('than'). ནས། (nas) marks a starting point in space or time."
        examples={[
          { tibetan: 'བོད་ལས་ཡོང་།', wylie: 'bod las yong', english: 'come from Tibet' },
          { tibetan: 'ཁོ་ང་ལས་མཐོ་བ་རེད།', wylie: 'kho nga las mtho ba red', english: 'He is taller than me.' },
          { tibetan: 'ད་ལྟ་ནས།', wylie: 'da lta nas', english: 'from now on' },
        ]}
      />
      <GrammarCard
        title="Agentive/Instrumental གིས། — 'by', 'with'"
        rule="Forms: གིས། གྱིས། ཀྱིས། ཡིས། འིས། — marks the agent (doer) in transitive past sentences, and the instrument used."
        examples={[
          { tibetan: 'ཁོས་ཟས་བཟས།', wylie: 'khos zas bzas', english: 'He ate food. (he-ERG food ate)' },
          { tibetan: 'མིག་གིས་མཐོང་།', wylie: 'mig gis mthong', english: 'see with the eyes' },
          { tibetan: 'སངས་རྒྱས་ཀྱིས་གསུངས།', wylie: 'sangs rgyas kyis gsungs', english: 'spoken by the Buddha' },
        ]}
        note="Tibetan is an ergative language: the agent of a transitive past verb takes the agentive particle, while the patient is unmarked."
      />
      <GrammarCard
        title="Terminative ར། — 'to', 'into', 'as', 'at'"
        rule="Forms: ར། རུ། སུ། དུ། ཏུ། — marks direction, transformation ('becoming'), location, or purpose."
        examples={[
          { tibetan: 'གནས་སུ་འགྲོ།', wylie: "gnas su 'gro", english: 'go to the place' },
          { tibetan: 'སངས་རྒྱས་སུ་འགྱུར།', wylie: "sangs rgyas su 'gyur", english: 'become a Buddha' },
          { tibetan: 'བར་དུ།', wylie: 'bar du', english: 'until, up to, in between' },
        ]}
      />
      <GrammarCard
        title="Comitative དང། — 'and', 'with', 'together with'"
        rule="དང། connects nouns in a list or shows accompaniment. It also introduces contrasts."
        examples={[
          { tibetan: 'ཆུ་དང་མེ།', wylie: 'chu dang me', english: 'water and fire' },
          { tibetan: 'ཁོ་དང་ཆ་འདྲ།', wylie: 'kho dang cha \'dra', english: 'similar to him / like him' },
          { tibetan: 'ང་དང་ཁྱེད་རང་།', wylie: 'nga dang khyed rang', english: 'you and I' },
        ]}
      />
      <GrammarCard
        title="Sentence-final Particles"
        rule="These end-of-sentence particles signal aspect, evidentiality, and mood."
        examples={[
          { tibetan: 'ཡིན།', wylie: 'yin', english: 'is/am/are — egophoric copula (speaker\'s own domain)' },
          { tibetan: 'རེད།', wylie: 'red', english: 'is/are — evidential copula (facts, reported info)' },
          { tibetan: 'འདུག', wylie: "'dug", english: "is — witnessing copula (something I'm perceiving now)" },
          { tibetan: 'ཡོད།', wylie: 'yod', english: 'exists / have — egophoric existential' },
          { tibetan: 'མེད།', wylie: 'med', english: "doesn't exist / don't have — negative existential" },
        ]}
      />
    </div>
  </div>
);

// ── Tab: Verb System ──────────────────────────────────────────────────────────

const VerbSystemTab: React.FC = () => (
  <div className="grammar-tab-content">
    <div className="grammar-intro-box">
      <p>
        Tibetan verbs express <strong>aspect</strong> more than tense. The four-stem system (present, past,
        future, imperative) is found in classical texts; modern spoken Tibetan often uses one or two stems.
        A key feature is <strong>egophoricity</strong>: different verb endings are used depending on whether
        the speaker has direct (first-person) knowledge of the action.
      </p>
    </div>

    <div className="grammar-cards-grid">
      <GrammarCard
        title="Four-Stem Verbs (Classical)"
        rule="Many verbs have distinct forms for present/future, past, future intent, and imperative. Modern colloquial Tibetan often reduces these."
        examples={[
          { tibetan: 'འགྲོ / སོང / འགྲོ / སོང', wylie: "'gro / song / 'gro / song", english: "go — present / past / future / imperative" },
          { tibetan: 'སྟོན / བསྟན / བསྟན / སྟོན', wylie: 'ston / bstan / bstan / ston', english: 'show / teach — present / past / future / imperative' },
          { tibetan: 'བྱེད / བྱས / བྱ / བྱོས', wylie: 'byed / byas / bya / byos', english: 'do — present / past / future / imperative' },
        ]}
        note="Many common verbs are invariable — they have only one form used across all contexts."
      />
      <GrammarCard
        title="Egophoric vs. Evidential Forms"
        rule="Egophoric endings (yin, yod, gi yin) mark the speaker's direct knowledge. Evidential endings (red, yod-red, 'dug) mark observed or reported information."
        examples={[
          { tibetan: 'ང་ལྷ་ས་ལས་ཡིན།', wylie: 'nga lha sa las yin', english: "I am from Lhasa. (I know this about myself)" },
          { tibetan: 'ཁོ་ལྷ་ས་ལས་རེད།', wylie: 'kho lha sa las red', english: 'He is from Lhasa. (I know/heard this fact)' },
          { tibetan: 'ཁོ་ལྷ་ས་ལས་འདུག', wylie: "kho lha sa las 'dug", english: 'He seems to be from Lhasa. (I can see/infer this now)' },
        ]}
        note="Using the wrong evidentiality can sound strange or even dishonest to a native speaker."
      />
      <GrammarCard
        title="Progressive Aspect"
        rule="Use གི་ཡོད། (gi yod) or གི་འདུག (gi 'dug) to express ongoing action."
        examples={[
          { tibetan: 'ང་ཀློག་གི་ཡོད།', wylie: 'nga klog gi yod', english: "I am reading. (I know I'm doing this)" },
          { tibetan: 'ཁོ་ཕྱི་ལ་འགྲོ་གི་འདུག', wylie: "kho phyi la 'gro gi 'dug", english: 'He is going outside. (I can see it)' },
        ]}
      />
      <GrammarCard
        title="Perfective Aspect"
        rule="Use ཟིན། (zin) or པ་རེད། (pa red) to express a completed action."
        examples={[
          { tibetan: 'ཟས་ཟིན།', wylie: 'zas zin', english: 'The eating is done. / (I) finished eating.' },
          { tibetan: 'ཁོ་ཕེབས་པ་རེད།', wylie: 'kho phebs pa red', english: 'He has arrived. (evidential)' },
          { tibetan: 'ང་ལྷ་ས་ལ་སོང་ཡོད།', wylie: 'nga lha sa la song yod', english: 'I have been to Lhasa.' },
        ]}
      />
      <GrammarCard
        title="Future Intention"
        rule="Use གི་ཡིན། (gi yin) for first-person future plans. Use གི་རེད། (gi red) for statements about others' future actions."
        examples={[
          { tibetan: 'ང་ཕྱི་ཉིན་འགྲོ་གི་ཡིན།', wylie: "nga phyi nyin 'gro gi yin", english: 'I will go tomorrow.' },
          { tibetan: 'ཁོ་ལྷ་ས་ལ་འགྲོ་གི་རེད།', wylie: "kho lha sa la 'gro gi red", english: 'He will go to Lhasa.' },
        ]}
      />
      <GrammarCard
        title="Common Auxiliary Verbs"
        rule="A small set of auxiliaries attach to the main verb to add aspect, evidentiality, or modal meaning."
        examples={[
          { tibetan: 'ཐུབ།', wylie: 'thub', english: 'be able to, can — abilitative modal' },
          { tibetan: 'དགོས།', wylie: 'dgos', english: 'need to, must — deontic modal' },
          { tibetan: 'ཆོག', wylie: 'chog', english: 'may, is permitted — permissive modal' },
          { tibetan: 'གི་འདུག', wylie: "gi 'dug", english: 'is happening (witnessed) — progressive evidential' },
        ]}
      />
    </div>
  </div>
);

// ── Tab: Nouns & Honorifics ───────────────────────────────────────────────────

const NounsAndHonorificsTab: React.FC = () => (
  <div className="grammar-tab-content">
    <div className="grammar-intro-box">
      <p>
        Tibetan nouns have no grammatical gender and no definite/indefinite articles. Plurality is
        marked by optional suffixes. The honorific register (<em>zhe-sa</em>, གཞུང་ས།) uses entirely
        different vocabulary to describe actions and attributes of respected persons — an essential
        feature of Tibetan social communication.
      </p>
    </div>

    <div className="grammar-cards-grid">
      <GrammarCard
        title="Plural Markers"
        rule="Plurality is optional and context-dependent. Three main plural suffixes exist with different registers."
        examples={[
          { tibetan: 'མི་ཚོ།', wylie: 'mi tsho', english: 'people, folks (informal / human plural)' },
          { tibetan: 'སེམས་ཅན་རྣམས།', wylie: 'sems can rnams', english: 'sentient beings (formal / religious plural)' },
          { tibetan: 'ཆོས་རྣམས།', wylie: 'chos rnams', english: 'phenomena / dharmas (classical plural)' },
          { tibetan: 'ང་ཚོ།', wylie: 'nga tsho', english: 'we / us (first person plural)' },
        ]}
      />
      <GrammarCard
        title="Nominalizers (པ / བ / མ / ས)"
        rule="Nominalizers convert verbs or clauses into nouns. པ/བ is most common. མ often marks female gender. ས marks agent or instrument."
        examples={[
          { tibetan: 'སྒོམ་པ།', wylie: 'sgom pa', english: 'meditation / meditator (from sgom "to meditate")' },
          { tibetan: 'འགྲོ་བ།', wylie: "'gro ba", english: "sentient beings / those who wander (from 'gro 'to go')" },
          { tibetan: 'མཁས་མ།', wylie: 'mkhas ma', english: 'female scholar/master (feminine nominalizer)' },
          { tibetan: 'གྲུབ་པ།', wylie: 'grub pa', english: 'accomplishment / siddha (from grub "to accomplish")' },
        ]}
      />
      <GrammarCard
        title="Honorific Register — Body & Mind"
        rule="Different words are used for body parts and mental faculties when referring to respected persons."
        examples={[
          { tibetan: 'མགོ → དབུ།', wylie: 'mgo → dbu', english: 'head (plain → honorific)' },
          { tibetan: 'ལུས → སྐུ།', wylie: 'lus → sku', english: 'body (plain → honorific)' },
          { tibetan: 'སེམས → ཐུགས།', wylie: 'sems → thugs', english: 'mind (plain → honorific)' },
          { tibetan: 'ངག → གསུང།', wylie: 'ngag → gsung', english: 'speech (plain → honorific)' },
          { tibetan: 'མིང → མཚན།', wylie: 'ming → mtshan', english: 'name (plain → honorific)' },
        ]}
      />
      <GrammarCard
        title="Honorific Register — Actions"
        rule="Common actions use entirely different verbs when the subject is a respected person (lama, teacher, elder)."
        examples={[
          { tibetan: 'ཟ → མཆོད།', wylie: 'za → mchod', english: 'eat (plain → honorific for high lamas)' },
          { tibetan: 'འགྲོ → ཕེབས།', wylie: "'gro → phebs", english: 'go / come (plain → honorific)' },
          { tibetan: 'ཟེར / ལབ → གསུང།', wylie: 'zer / lab → gsung', english: 'say / speak (plain → honorific)' },
          { tibetan: 'སྟེར → གནང།', wylie: 'ster → gnang', english: 'give (plain → honorific)' },
          { tibetan: 'མཐོང → གཟིགས།', wylie: 'mthong → gzigs', english: 'see (plain → honorific)' },
          { tibetan: 'ཉལ → བཞུགས།', wylie: 'nyal → bzhugs', english: 'rest / stay (plain → honorific)' },
        ]}
        note="སྐུ (sku), གསུང (gsung), and ཐུགས (thugs) — Body, Speech, and Mind — are the three doors of the enlightened being in Vajrayana Buddhism."
      />
      <GrammarCard
        title="Demonstratives & Definiteness"
        rule="Tibetan has no articles (a/the). Demonstratives can indicate definiteness: འདི (this), དེ (that), ཕ་གི (that over there)."
        examples={[
          { tibetan: 'མི་འདི།', wylie: "mi 'di", english: 'this person / this man' },
          { tibetan: 'གནས་དེ།', wylie: 'gnas de', english: 'that place' },
          { tibetan: 'རི་ཕ་གི།', wylie: 'ri pha gi', english: 'that mountain over there' },
        ]}
      />
    </div>
  </div>
);

// ── Tab: Common Patterns ──────────────────────────────────────────────────────

interface PatternRowProps {
  label: string;
  pattern: string;
  tibetan: string;
  wylie: string;
  english: string;
}
const PatternRow: React.FC<PatternRowProps> = ({ label, pattern, tibetan, wylie, english }) => (
  <div className="pattern-row">
    <div className="pattern-label">{label}</div>
    <div className="pattern-formula">{pattern}</div>
    <div className="pattern-example">
      <div className="grammar-tibetan">{tibetan}</div>
      <div className="grammar-wylie">{wylie}</div>
      <div className="grammar-english">{english}</div>
    </div>
  </div>
);

const CommonPatternsTab: React.FC = () => (
  <div className="grammar-tab-content">
    <div className="grammar-intro-box">
      <p>
        These templates cover the most frequently used sentence patterns in Tibetan. Each follows the
        three-line format: Tibetan script → Wylie romanization → English translation.
      </p>
    </div>

    <div className="letter-group">
      <h4>Introductions & Identity</h4>
      <div className="pattern-list">
        <PatternRow label="My name is…" pattern="ང་གི་མིང་… ཡིན།" tibetan="ང་གི་མིང་རྡོ་རྗེ་ཡིན།" wylie="nga gi ming rdo rje yin" english="My name is Dorje." />
        <PatternRow label="I am from…" pattern="ང་… ལས་ཡིན།" tibetan="ང་བོད་ལས་ཡིན།" wylie="nga bod las yin" english="I am from Tibet." />
        <PatternRow label="Nice to meet you" pattern="ཁྱེད་རང་དང་མཇལ་ཐུབ་པར་དགའ་པོ་བྱུང།" tibetan="ཁྱེད་རང་དང་མཇལ་ཐུབ་པར་དགའ་པོ་བྱུང།" wylie="khyed rang dang mjal thub par dga' po byung" english="I am happy to meet you." />
      </div>
    </div>

    <div className="letter-group">
      <h4>Greetings & Courtesy</h4>
      <div className="pattern-list">
        <PatternRow label="Hello" pattern="Greeting" tibetan="བཀྲ་ཤིས་བདེ་ལེགས།" wylie="bkra shis bde legs" english="Tashi Delek (Auspiciousness and well-being)" />
        <PatternRow label="Thank you" pattern="Courtesy" tibetan="ཐུགས་རྗེ་ཆེ།" wylie="thugs rje che" english="Thank you. (lit. Great compassion.)" />
        <PatternRow label="Please" pattern="Request" tibetan="གསོལ་བ་འདེབས།" wylie="gsol ba 'debs" english="I request / Please (formal supplication)" />
        <PatternRow label="Sorry / Excuse me" pattern="Apology" tibetan="དགོངས་པ་མ་ཚོར།" wylie="dgongs pa ma tshor" english="Please forgive me. / Pardon me." />
      </div>
    </div>

    <div className="letter-group">
      <h4>Asking & Answering</h4>
      <div className="pattern-list">
        <PatternRow label="What is this?" pattern="འདི་ག་རེ་རེད།" tibetan="འདི་ག་རེ་རེད།" wylie="'di ga re red" english="What is this?" />
        <PatternRow label="Where is…?" pattern="… ག་པར་ཡོད།" tibetan="ཆོས་ཁང་ག་པར་ཡོད།" wylie="chos khang ga par yod" english="Where is the temple?" />
        <PatternRow label="How much?" pattern="འདི་ག་ཚོད་རེད།" tibetan="འདི་ག་ཚོད་རེད།" wylie="'di ga tshod red" english="How much is this?" />
        <PatternRow label="I don't understand" pattern="ང་ཧ་གོ་མ་སོང།" tibetan="ང་ཧ་གོ་མ་སོང།" wylie="nga ha go ma song" english="I didn't understand." />
        <PatternRow label="Please repeat" pattern="ཡང་བསྐྱར་གསུང་རོགས།" tibetan="ཡང་བསྐྱར་གསུང་རོགས།" wylie="yang bskyar gsung rogs" english="Please say it again." />
      </div>
    </div>

    <div className="letter-group">
      <h4>Spiritual & Dharma Context</h4>
      <div className="pattern-list">
        <PatternRow label="May all beings be happy" pattern="Aspiration prayer" tibetan="སེམས་ཅན་ཐམས་ཅད་བདེ་བ་དང་ལྡན་པར་གྱུར་ཅིག" wylie="sems can thams cad bde ba dang ldan par gyur cig" english="May all sentient beings be endowed with happiness." />
        <PatternRow label="For the benefit of all beings" pattern="Dedication" tibetan="སེམས་ཅན་ཐམས་ཅད་ཀྱི་དོན་དུ།" wylie="sems can thams cad kyi don du" english="For the benefit of all sentient beings." />
        <PatternRow label="May I attain enlightenment" pattern="Aspiration" tibetan="ང་སངས་རྒྱས་ཀྱི་གོ་འཕང་ཐོབ་པར་ཤོག" wylie="nga sangs rgyas kyi go 'phang thob par shog" english="May I attain the level of Buddhahood." />
        <PatternRow label="Guru devotion" pattern="Prayer opening" tibetan="རྩ་བའི་བླ་མ་ལ་གསོལ་བ་འདེབས།" wylie="rtsa ba'i bla ma la gsol ba 'debs" english="I supplicate the root Lama." />
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const TibetanGrammarMainContent: React.FC<Props> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Script & Sounds');

  return (
    <div className="grammar-main-content">
      <div className="grammar-main-header">
        <div className="grammar-header-left">
          <h2>Tibetan Grammar</h2>
          <span className="grammar-subtitle">བོད་སྐད་ཀྱི་བརྡ་སྤྲོད།</span>
        </div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <div className="grammar-tabs-bar">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`grammar-tab-btn${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="grammar-body">
        {activeTab === 'Script & Sounds' && <ScriptAndSoundsTab />}
        {activeTab === 'Sentence Structure' && <SentenceStructureTab />}
        {activeTab === 'Particles' && <ParticlesTab />}
        {activeTab === 'Verb System' && <VerbSystemTab />}
        {activeTab === 'Nouns & Honorifics' && <NounsAndHonorificsTab />}
        {activeTab === 'Common Patterns' && <CommonPatternsTab />}
      </div>
    </div>
  );
};

export default TibetanGrammarMainContent;
