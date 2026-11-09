export interface Verse {
  id: number;
  balochi: string;
  transliteration: string;
  english: string;
  explanation: string;
  keywords: string[];
}

export interface GlossaryItem {
  word: string;
  transliteration: string;
  meaning: string;
  balochiMeaning?: string;
  category: 'virtue' | 'maritime' | 'action' | 'nature' | 'courage';
}

export const POEM_TITLE = {
  balochi: 'او مڑا داریں بلوچ',
  transliteration: 'O Mardaaren Baloch',
  english: 'O Valiant Baloch!',
  subtitle: 'گالاں نصیرءِ گوش بدار (Listen to the words of Naseer)',
  poet: {
    balochi: 'میر گل خان نصیر',
    english: 'Mir Gul Khan Naseer',
    lifespan: '1914 – 1983',
    title: 'The Revolutionary Poet of Balochistan (ملک الشعراء)',
    bio: 'Mir Gul Khan Naseer was a prominent Balochi poet, historian, politician, and philosopher. His fiery, anti-colonial and progressive verses inspired generations of youths to shed passivity, struggle for dignity, and steer their own destiny.',
  },
};

export const POEM_VERSES: Verse[] = [
  {
    id: 1,
    balochi: 'او مڑا داریں بلوچ! او سرمَچنڈیں نامدار',
    transliteration: 'O mardaaren Baloch! O sarmachand-en naamdaar',
    english: 'O valiant, chivalrous Baloch! O renowned champion!',
    explanation: 'An impassioned summons to the noble heritage, invoking the historic valor and proud identity of the Baloch.',
    keywords: ['مڑا داریں', 'سرمَچنڈیں', 'نامدار'],
  },
  {
    id: 2,
    balochi: 'نشتگئے پرچے او ورنا ! تو چو بیواک و نکار',
    transliteration: 'Nishtag-e parche o warnaa! Tu chu bay-waak o nakaar',
    english: 'Why do you sit idle, O youth! In powerlessness and uselessness?',
    explanation: 'A sharp rebuke against inertia, urging the youthful generation to break free from resignation and fatalism.',
    keywords: ['ورنا', 'بیواک', 'نکار'],
  },
  {
    id: 3,
    balochi: 'بستگئے دستان وتی ، چماں تئی گِپتہ ھُمار',
    transliteration: 'Bastag-e dastaan wati, chammaan tayi gepta humaar',
    english: 'You have bound your own hands, while slumber and intoxication have seized your eyes!',
    explanation: 'The poet diagnoses the tragedy: not that the people lack strength, but that they have tied their own hands and fallen asleep.',
    keywords: ['دستان', 'ھُمار'],
  },
  {
    id: 4,
    balochi: 'بوجی ءَ گندئے وتی بیتگ گوں توپان ءَ دچار',
    transliteration: 'Boji-a gind-e wati baytag gon toofaan-a dochaar',
    english: 'You see your own boat caught and beleaguered in the ferocious storm!',
    explanation: 'Invoking the coastal Makrani seafaring metaphor of a wooden vessel (boji) threatened by roaring tempestuous tides.',
    keywords: ['بوجی', 'توپان', 'دچار'],
  },
  {
    id: 5,
    balochi: 'پاد کائنت چئول ،چو گٹیں گـَر و سبزیں تلار',
    transliteration: 'Paad kayant chawool, chu gatt-en gar o sabz-en talaar',
    english: 'The towering waves leap upward like precipitous chasms and moss-green cliffs!',
    explanation: 'A vivid visual portrayal of monstrous oceanic waves resembling mountain ravines and slick jagged sea-cliffs.',
    keywords: ['چئول', 'گٹیں گـَر', 'سبزیں تلار'],
  },
  {
    id: 6,
    balochi: 'بوجی ءَ نیستیں ،تئی مستیں زرءِ لاپ ءَ کرار',
    transliteration: 'Boji-a nest-en, tayi mast-en zar-e laap-a qaraar',
    english: 'Your boat finds no calm repose inside the belly of the drunken ocean!',
    explanation: 'The sea is described as "mast" (wild, drunk, unruly) with no sanctuary for a motionless boat.',
    keywords: ['مستیں زر', 'لاپ', 'کرار'],
  },
  {
    id: 7,
    balochi: 'جمّراں بستہ دُهتوکی، گرئنداں گوں گوات ءَ آوار',
    transliteration: 'Jammaraan basta dohtoki, grayndaan gon gwaath-a aawaar',
    english: 'Heavy clouds have wrapped dark veils across the sky; rolling thunders mingle with howling winds!',
    explanation: 'Dark atmospheric oppression where tempestuous winds and lightning join together in chaos.',
    keywords: ['جمّراں', 'دُهتوکی', 'گرئنداں', 'آوار'],
  },
  {
    id: 8,
    balochi: 'دیر و بیگواہ انت تیاب و شپ سیاہ انت و تهار',
    transliteration: 'Dair o bay-gwaah ant tayaab o shap siyaah ant o tahaar',
    english: 'Distant and lost is the shoreline, and the night is pitch black and abyssal!',
    explanation: 'Total disorientation where the harbor cannot be seen in the darkest midnight.',
    keywords: ['بیگواہ', 'تیاب', 'تہار'],
  },
  {
    id: 9,
    balochi: 'بد دلی زیبا نہ انت او دل مَتُرسین سَرمَچار',
    transliteration: 'Bad-dilli zaybaa na-int, o dil ma-tursen sarmachaar',
    english: 'Faint-heartedness is unbecoming! O fearless warrior (Sarmachar), do not terrify your heart!',
    explanation: 'The pivotal shift from despair to defiance: true warriors never allow cowardice or self-doubt to conquer their spirit.',
    keywords: ['بد دلی', 'سَرمَچار', 'مَتُرسین'],
  },
  {
    id: 10,
    balochi: 'یک کسانیں مُهلتے اے زندگی نئیتیں دو بار',
    transliteration: 'Yak kasaan-en mohlat-e ay zindagee nayt-en do baar',
    english: 'This life is but a brief respite—it will never be granted twice!',
    explanation: 'Existential urgency: mortality means our chance to make a stand and act with honor is now or never.',
    keywords: ['مُهلتے', 'زندگی', 'دو بار'],
  },
  {
    id: 11,
    balochi: 'باید انت بندئے سرینءَ نیں پہ جدّ و جُهد و کار',
    transliteration: 'Baayad ant band-e sarin-a neyn pa jadd o johd o kaar',
    english: 'You must now tighten your belt (gird your loins) for relentless struggle, effort, and deed!',
    explanation: 'Banding the sarin (girding the waist) is the traditional Balochi idiom for preparing for battle and hard labor.',
    keywords: ['سرین', 'جدّ و جُهد', 'کار'],
  },
  {
    id: 12,
    balochi: 'بئے گوں توپانءَ مُکابل، چِکّی تکدیرءِ مهار',
    transliteration: 'Baye gon toofaan-a mukaabal, chekki takdeer-e mahaar',
    english: 'Stand face-to-face against the tempest, and firmly pull the reins of destiny!',
    explanation: 'Rejecting fatalism: destiny is not a passive yoke, but a camel whose reins (mahaar) must be seized by your own hands.',
    keywords: ['مُکابل', 'تکدیرءِ مهار', 'چِکّی'],
  },
  {
    id: 13,
    balochi: 'زندگی لئیبے بزان، پرواہ مکن، وهمءَ میار',
    transliteration: 'Zindagee layb-e bazaan, parwaah ma-kan, wahm-a ma-yaar',
    english: 'Regard life as a daring game—care not, harbor no trembling illusions or dread!',
    explanation: 'Play the game of life with audacious spirit rather than paralyzing anxieties.',
    keywords: ['لئیب', 'پرواہ', 'وهم'],
  },
  {
    id: 14,
    balochi: 'گوات و توپان و گِروک و گِرئندگاں هِچّی مَچار',
    transliteration: 'Gwaath o toofaan o giroak o grayndagaan hich-ee ma-chaar',
    english: 'Gaze upon howling wind, stormy gales, flashing lightning, and thundering bolts as nothing!',
    explanation: 'Diminishing outer terror through supreme inner psychological conviction.',
    keywords: ['گِروک', 'گِرئندگاں', 'هِچّی'],
  },
  {
    id: 15,
    balochi: 'آزمان پُرشیت، زمین جسکیت بلے، پرواہ مدار',
    transliteration: 'Aazmaan porsheet, zameen jaskeet balay, parwaah ma-daar',
    english: 'Even if the heavens shatter and the firm earth quakes, maintain no fear!',
    explanation: 'Stoic fearlessness in the face of cataclysmic adversity.',
    keywords: ['آزمان پُرشیت', 'زمین جسکیت', 'پرواہ مدار'],
  },
  {
    id: 16,
    balochi: 'کل تئی وَهم و گمان ئنت ایش کہ گُرّنت چو نهار',
    transliteration: 'Kull tayi wahm o gumaan ant eysh ke gurrant chu nahaar',
    english: 'All these monsters that roar like ravenous beasts are only your own fears and illusions!',
    explanation: 'Enlightened psychological insight: the external phantoms of oppression hold power only because your mind projects fear.',
    keywords: ['وَهم و گمان', 'گُرّنت', 'نهار'],
  },
  {
    id: 17,
    balochi: 'هَکلش دئے دیر سِندنت شِنگ و شانگ و تار پَتار',
    transliteration: 'Hakkl-esh day dair sindant shing o shaang o taar pataar',
    english: 'Bellow at them with a commanding shout—they will splinter apart, scattered to the winds!',
    explanation: 'A resolute voice of conviction causes phantom terrors to shatter into nothingness.',
    keywords: ['هَکلش دئے', 'شِنگ و شانگ', 'تار پَتار'],
  },
  {
    id: 18,
    balochi: 'همت اش نیستن، تئی دیما بہ اوشتنت پِیْدْوار',
    transliteration: 'Himmat-ish nest-en, tayi daymaa ba-oshtant paydwaar',
    english: 'They possess no courage to stand firm before your unwavering advance!',
    explanation: 'Tyranny and adversity wilt when confronted with unbending human fortitude.',
    keywords: ['همت', 'اوشتنت', 'پِیْدْوار'],
  },
  {
    id: 19,
    balochi: 'بُست او ورنا ! پہ زندءَ نیں پَتَی دستان مَچار',
    transliteration: 'Bost o warnaa! Pa zind-a neyn patay dastaan ma-chaar',
    english: 'Rise up, O youth! In this existence, do not look mournfully at empty hands!',
    explanation: 'Cast away excuses of poverty or helplessness; human agency is the greatest wealth.',
    keywords: ['بُست', 'ورنا', 'دستان'],
  },
  {
    id: 20,
    balochi: 'وت تئی دست انت بیلی بَھت و تکدیرءِ مهار',
    transliteration: 'Wat tayi dast ant bayli baht o takdeer-e mahaar',
    english: 'In your very own hands, my comrade, lies the bridle of fortune and destiny!',
    explanation: 'The core philosophical maxim: you are the author and commander of your own fate.',
    keywords: ['بیلی', 'بَھت', 'تکدیرءِ مهار'],
  },
  {
    id: 21,
    balochi: 'ڈڈ کَن ورنائیں دلءَ گالاں نصیرءِ گوش بدار',
    transliteration: 'Dadd kan warnaa-en dil-a gaalaan Naseer-e gosh ba-daar',
    english: 'Steel and strengthen your youthful heart, and lend your ear to the words of Naseer:',
    explanation: 'The poet seals his name (takhallus) into the verse, giving his immortal testament to future generations.',
    keywords: ['ڈڈ کَن', 'دل', 'نصیر', 'گوش بدار'],
  },
  {
    id: 22,
    balochi: 'اے سیاهیں شپ نہ مانیت، نئے سیاهیں روزگار',
    transliteration: 'Ay siyaah-en shap na maaneet, nay siyaah-en rozgaar',
    english: 'Neither will this dark night endure, nor will this black era remain!',
    explanation: 'The eternal anthem of hope and triumph: the longest darkness and most oppressive regimes must inevitably give way to dawn.',
    keywords: ['سیاهیں شپ', 'نہ مانیت', 'سیاهیں روزگار'],
  },
];

export const GLOSSARY: GlossaryItem[] = [
  {
    word: 'مڑا داریں',
    transliteration: 'Mardaaren',
    meaning: 'Valiant, chivalrous, possessing honor and dignified grit',
    balochiMeaning: 'با غیرت ءُ با ہمتیں مرد',
    category: 'virtue',
  },
  {
    word: 'سرمَچنڈیں',
    transliteration: 'Sarmachand-en',
    meaning: 'Unbending champion, unyielding hero who never bows',
    balochiMeaning: 'سربلند ءُ بے باکیں بہادر',
    category: 'courage',
  },
  {
    word: 'سَرمَچار',
    transliteration: 'Sarmachaar',
    meaning: 'Fearless warrior who sacrifices their head / stakes life for justice',
    balochiMeaning: 'جان نثاریں جنگول ءُ سرفروش',
    category: 'courage',
  },
  {
    word: 'بوجی',
    transliteration: 'Boji',
    meaning: 'Traditional wooden sailboat / vessel on the Baloch coast (Makran)',
    balochiMeaning: 'زرّی لنجیں گوانزگ یا بیرک داریں بوجی',
    category: 'maritime',
  },
  {
    word: 'چئول',
    transliteration: 'Chawool',
    meaning: 'Crashing ocean wave, surge, tide',
    balochiMeaning: 'مستیں زرّءِ موج ءُ لہڑ',
    category: 'maritime',
  },
  {
    word: 'تلار',
    transliteration: 'Talaar',
    meaning: 'Sheer vertical rock cliff, massive stone wall',
    balochiMeaning: 'ٹکیں سنگ ءُ بُرزیں کوہ',
    category: 'nature',
  },
  {
    word: 'مستیں زر',
    transliteration: 'Mast-en zar',
    meaning: 'The roaring, drunken, untamed ocean (Arabian Sea / Gulf of Oman)',
    balochiMeaning: 'زوراک ءُ پر چوشیں دریا',
    category: 'maritime',
  },
  {
    word: 'دُهتوکی',
    transliteration: 'Dohtoki',
    meaning: 'Veil, embroidered wrap, dense shroud covering the skies',
    balochiMeaning: 'تہاریں چادر یا سیاھیں پوت',
    category: 'nature',
  },
  {
    word: 'تیاب',
    transliteration: 'Tayaab',
    meaning: 'Seashore, sandy coastline, maritime harbor',
    balochiMeaning: 'زرّءِ کرگ ءُ کنارہ',
    category: 'maritime',
  },
  {
    word: 'بندئے سرینءَ',
    transliteration: 'Band-e sarin-a',
    meaning: 'Gird your loins, tighten the belt at the waist for resolute labor',
    balochiMeaning: 'کمر ءَ بستن، تیاری کنگ پہ جنگ ءُ کار',
    category: 'action',
  },
  {
    word: 'تکدیرءِ مهار',
    transliteration: 'Takdeer-e mahaar',
    meaning: 'The nose-rein / bridle of destiny (directing one’s own fate like a noble steed or camel)',
    balochiMeaning: 'قسمتءِ لگام وتی دستءَ زورگ',
    category: 'action',
  },
  {
    word: 'گِروک',
    transliteration: 'Giroak',
    meaning: 'Lightning flash that splits the storm clouds',
    balochiMeaning: 'جمّبرانی تہا بریکاریں روک',
    category: 'nature',
  },
  {
    word: 'گرئند',
    transliteration: 'Graynd',
    meaning: 'Thunder roar reverberating across mountains and sea',
    balochiMeaning: 'جمّبرانی کروک ءُ توار',
    category: 'nature',
  },
  {
    word: 'نهار',
    transliteration: 'Nahaar',
    meaning: 'A roaring hungry predator, lion, or ravenous wild beast',
    balochiMeaning: 'گرّوکیں درندہ یا شیر',
    category: 'nature',
  },
  {
    word: 'تار پَتار',
    transliteration: 'Taar pataar',
    meaning: 'Scattered into shreds, shattered into nonexistence',
    balochiMeaning: 'ٹکڑا ٹکڑا بیگ، ریزہ ریزہ بیگ',
    category: 'action',
  },
  {
    word: 'ڈڈ کَن',
    transliteration: 'Dadd kan',
    meaning: 'Steel, harden, make steadfast and resolute',
    balochiMeaning: 'دلءَ مھکم ءُ پر ہمت کنگ',
    category: 'courage',
  },
  {
    word: 'سیاهیں روزگار',
    transliteration: 'Siyaah-en rozgaar',
    meaning: 'Dark era, oppressive times, gloomy period of tyranny',
    balochiMeaning: 'ظلم ءُ جبرءِ دور و زمانگ',
    category: 'virtue',
  },
];

export const TTS_VOICES = [
  {
    name: 'Fenrir',
    label: 'Fenrir (بم و حماسی مردانه)',
    tone: 'شاهری، باصلابت، طنین سینه و صدای دلاورانه',
    stylePrompt: 'Deep, heroic, stirring orator with resonant chest tone, reciting classical Balochi revolutionary poetry with emotional weight and solemn pride',
  },
  {
    name: 'Charon',
    label: 'Charon (پیر دانا و راوی کهن)',
    tone: 'استاد کهنسال و راوی تاریخ بلوچستان با وقار و هیبت',
    stylePrompt: 'Ancient epic bard declaiming against the howling storm, with deep sonorous projection and legendary gravitas',
  },
  {
    name: 'Puck',
    label: 'Puck (ورنا و جوان پرشور)',
    tone: 'جوان، جسور، شتابان و پرانرژی برای اشعار امید و خروش',
    stylePrompt: 'Urgent, impassioned, stirring revolutionary youth reciting verses with rapid cadence, conviction, and fearless energy',
  },
  {
    name: 'Aoede',
    label: 'Aoede (بانوی نغمه‌خوان مکرانی)',
    tone: 'گیرا، سوزناک و شاعرانه، نغمه‌سرایی لطیف زنانه',
    stylePrompt: 'Lyrical, emotive Balochi female bard reciting with soulful clarity, musical cadences, and poetic beauty',
  },
  {
    name: 'Kore',
    label: 'Kore (آرام، نرم و شمرده)',
    tone: 'صدای ملایم، آرام‌بخش و شمرده، مناسب آموزش و غزل‌های دلنشین',
    stylePrompt: 'Lyrical, emotive, rich poetic declamation with clear enunciation, dramatic pauses, and solemn grandeur',
  },
  {
    name: 'Zephyr',
    label: 'Zephyr (متین و رادیویی)',
    tone: 'صدای استوار، سنجیده، گوینده رادیویی و دانا',
    stylePrompt: 'Wise, steadfast, dignified poet elder reciting with rhythmic meter, calm authority, and unwavering conviction',
  },
];

export interface TtsStyle {
  id: string;
  label: string;
  englishLabel: string;
  description: string;
  prompt: string;
}

export const TTS_STYLES: TtsStyle[] = [
  {
    id: 'epic',
    label: 'دکلمه حماسی شاهری (Sarmachar Epic)',
    englishLabel: 'Heroic Epic Declamation',
    description: 'رجزخوانی دلاورانه با صلابت، غلتش حروف ر و طنین صدای سینه',
    prompt: 'Passionate, heroic Balochi master poet (شاهر) declaiming with majestic cadence, rolling r, and rhythmic dignity',
  },
  {
    id: 'zahirok',
    label: 'زهیروک و سوزناک (Zahirok Lament)',
    englishLabel: 'Soulful Zahirok Lamentation',
    description: 'نوای محزون و دلتنگی با تحریرهای کشیده و نفس‌های عمیق',
    prompt: 'Sorrowful, deeply emotional Balochi zahirok lamentation style, melodic pauses, soulful breathing',
  },
  {
    id: 'liko',
    label: 'نغمگی و لِیکو (Melodic Liko)',
    englishLabel: 'Melodic Liko Cadence',
    description: 'ضرب‌آهنگ ترنمی، ریتمیک، زهیری و دلنشین',
    prompt: 'Rhythmic, melodious Balochi liko chanting with musical cadence and flowing prosody',
  },
  {
    id: 'clear',
    label: 'شمرده و آموزشی (Educational & Clear)',
    englishLabel: 'Slow Articulated Recitation',
    description: 'تلفظ شمرده، دقیق با رعایت کشش مصوت‌ها و حروف رتروفلکس (ڈ، ٹ، ڑ) برای یادگیری',
    prompt: 'Articulate, slow educational native Balochi reciter, precise vowels and retroflex consonants',
  },
  {
    id: 'gentle',
    label: 'نجوای آرام و شبانه (Nocturnal Whispers)',
    englishLabel: 'Gentle Nocturnal Recital',
    description: 'نوای لطیف، عاشقانه و آرام‌بخش زیر آسمان کویر و دریا',
    prompt: 'Gentle, lyrical nocturnal Balochi poetry recitation with warm intimate tones and smooth transitions',
  },
  {
    id: 'dialogue',
    label: 'مناظره و گفت‌وگو (Dramatic Dialogue)',
    englishLabel: 'Dramatic Call-and-Response',
    description: 'لحن گفت‌وگویی، پرسش و پاسخی و نمایش‌نامه‌ای',
    prompt: 'Dramatic dialogue, sharp responsive theatrical delivery with dynamic emotional shifts',
  },
  {
    id: 'festive',
    label: 'سرود شادمانی و جشن (Celebratory Sot)',
    englishLabel: 'Joyful & Celebratory',
    description: 'لحن شاد، پرامید و وجدآور متناسب با مجالس جشن و پیروزی',
    prompt: 'Uplifting, joyous Balochi festive chant celebrating courage, unity, and bright dawn',
  },
];
