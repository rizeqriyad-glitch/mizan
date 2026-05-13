import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { getTodayKey } from '../utils/dateUtils'

// ─── Morning & Evening Adhkar from Hisn al-Muslim ────────────────────────────
// Source: حصن المسلم — Dr. Sa'id ibn Ali ibn Wahf al-Qahtani

const MORNING_ADHKAR = [
  {
    id: 'm0',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    english: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
    name: { en: 'Ayat al-Kursi', ar: 'آية الكرسي' },
    count: 1,
    source: 'البقرة: ٢٥٥',
    virtue: { en: 'Whoever recites it in the morning will be protected by Allah from jinn until evening', ar: 'من قرأها حين يصبح أُجير من الجن حتى يمسي' },
  },
  {
    id: 'm1',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    english: 'Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent.',
    name: { en: 'Surat Al-Ikhlas', ar: 'سورة الإخلاص' },
    count: 3,
    source: 'سورة الإخلاص (١١٢)',
    virtue: { en: 'Whoever recites it three times is rewarded as if he recited the entire Quran', ar: 'من قرأها ثلاثاً كان له ثواب قراءة القرآن كاملاً' },
  },
  {
    id: 'm2',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    english: 'Say: I seek refuge in the Lord of daybreak, from the evil of what He has created, and from the evil of darkness when it settles, and from the evil of the blowers in knots, and from the evil of an envier when he envies.',
    name: { en: 'Surat Al-Falaq', ar: 'سورة الفلق' },
    count: 3,
    source: 'سورة الفلق (١١٣)',
    virtue: { en: 'Sufficient protection against all evil', ar: 'كافية من كل شر' },
  },
  {
    id: 'm3',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    english: 'Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer — who whispers in the breasts of mankind — from among the jinn and mankind.',
    name: { en: 'Surat An-Nas', ar: 'سورة الناس' },
    count: 3,
    source: 'سورة الناس (١١٤)',
    virtue: { en: 'Sufficient protection against all evil', ar: 'كافية من كل شر' },
  },
  {
    id: 'm4',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
    english: 'We have reached the morning, and at this very time all sovereignty belongs to Allah. Praise be to Allah. None has the right to be worshipped except Allah, alone, without partner; to Him belongs all sovereignty and praise, and He is over all things omnipotent. My Lord, I ask You for the good of this day and the good of what follows it; and I seek refuge in You from the evil of this day and the evil of what follows it. My Lord, I seek refuge in You from laziness and the deterioration of old age. My Lord, I seek refuge in You from torment in the Fire and torment in the grave.',
    name: { en: 'Morning Declaration', ar: 'دعاء الصباح' },
    count: 1,
    source: 'مسلم (٢٧٢٣)',
    virtue: { en: 'A comprehensive morning supplication taught by the Prophet ﷺ', ar: 'من أذكار الصباح الجامعة' },
  },
  {
    id: 'm5',
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    english: 'O Allah, by Your grace we have reached the morning, and by Your grace we reach the evening; by You we live and by You we die, and to You is the resurrection.',
    name: { en: 'Morning Beginning', ar: 'افتتاح الصباح' },
    count: 1,
    source: 'أبو داود (٥٠٦٨)، الترمذي (٣٣٩١)',
    virtue: { en: 'Affirming that all life belongs to Allah', ar: 'إقرار بأن الحياة كلها لله' },
  },
  {
    id: 'm6',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    english: 'O Allah, You are my Lord. None has the right to be worshipped except You. You created me and I am Your servant. I uphold Your covenant and my promise to You as best I can. I seek refuge in You from the evil that I have done. I acknowledge Your blessings upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.',
    name: { en: 'Sayyid al-Istighfar', ar: 'سيد الاستغفار' },
    count: 1,
    source: 'البخاري (٦٣٠٦)',
    virtue: { en: 'Whoever says it with certainty in the morning and dies that day enters Paradise', ar: 'من قالها موقناً فمات من يومه دخل الجنة' },
  },
  {
    id: 'm7',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    english: 'None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty, to Him is all praise, and He is over all things omnipotent.',
    name: { en: 'Tahlil', ar: 'التهليل' },
    count: 10,
    source: 'النسائي (٢٤/٣)، الطبراني',
    virtue: { en: 'Recited 10× morning and evening: reward equal to freeing 4 slaves, 100 good deeds written, 100 sins erased, and protection from Shaytan all day', ar: '١٠ مرات صباحاً ومساءً = أجر عتق أربع رقاب وكُتب له ١٠٠ حسنة ومُحيت ١٠٠ سيئة وكان في حرز من الشيطان' },
  },
  {
    id: 'm8',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ',
    english: 'In the name of Allah, with whose name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing.',
    name: { en: 'Morning Protection', ar: 'ذكر الحماية' },
    count: 3,
    source: 'أبو داود (٥٠٨٨)، الترمذي (٣٣٨٨)، ابن ماجه (٣٨٦٩)',
    virtue: { en: 'Whoever says it 3× in the morning: nothing will harm him until evening', ar: 'من قالها ثلاثاً حين يصبح لم يضره شيء حتى يمسي' },
  },
  {
    id: 'm9',
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    english: 'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.',
    name: { en: 'Contentment with Allah', ar: 'الرضا بالله' },
    count: 3,
    source: 'أبو داود (٥٠٧٢)، الترمذي (٣٣٨٩)',
    virtue: { en: 'It is a right upon Allah to please the one who says this on the Day of Judgement', ar: 'كان حقاً على الله أن يُرضيه يوم القيامة' },
  },
  {
    id: 'm10',
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    english: 'O Allah, grant well-being to my body. O Allah, grant well-being to my hearing. O Allah, grant well-being to my sight. There is none worthy of worship except You.',
    name: { en: "Du'a for Well-being", ar: 'دعاء العافية' },
    count: 3,
    source: 'أبو داود (٥٠٩٠)',
    virtue: { en: 'Supplication for sound health in body, hearing, and sight', ar: 'دعاء للعافية في البدن والسمع والبصر' },
  },
  {
    id: 'm11',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    english: 'Glory and praise be to Allah.',
    name: { en: 'Tasbih', ar: 'التسبيح' },
    count: 100,
    source: 'مسلم (٢٦٩١)',
    virtue: { en: 'Whoever says it 100× in the morning: his sins are forgiven even if they are like the foam of the sea', ar: 'من قالها مئة مرة حُطَّت خطاياه وإن كانت مثل زبد البحر' },
  },
]

const EVENING_ADHKAR = [
  {
    id: 'e0',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    english: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
    name: { en: 'Ayat al-Kursi', ar: 'آية الكرسي' },
    count: 1,
    source: 'البقرة: ٢٥٥',
    virtue: { en: 'Whoever recites it in the evening will be protected by Allah from jinn until morning', ar: 'من قرأها حين يمسي أُجير من الجن حتى يصبح' },
  },
  {
    id: 'e1',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    english: 'Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent.',
    name: { en: 'Surat Al-Ikhlas', ar: 'سورة الإخلاص' },
    count: 3,
    source: 'سورة الإخلاص (١١٢)',
    virtue: { en: 'Whoever recites it three times morning and evening: it is sufficient for him', ar: 'تكفيه من كل شيء' },
  },
  {
    id: 'e2',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    english: 'Say: I seek refuge in the Lord of daybreak, from the evil of what He has created, and from the evil of darkness when it settles, and from the evil of the blowers in knots, and from the evil of an envier when he envies.',
    name: { en: 'Surat Al-Falaq', ar: 'سورة الفلق' },
    count: 3,
    source: 'سورة الفلق (١١٣)',
    virtue: { en: 'Sufficient protection against all evil', ar: 'كافية من كل شر' },
  },
  {
    id: 'e3',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    english: 'Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer — who whispers in the breasts of mankind — from among the jinn and mankind.',
    name: { en: 'Surat An-Nas', ar: 'سورة الناس' },
    count: 3,
    source: 'سورة الناس (١١٤)',
    virtue: { en: 'Sufficient protection against all evil', ar: 'كافية من كل شر' },
  },
  {
    id: 'e4',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
    english: 'We have reached the evening, and at this very time all sovereignty belongs to Allah. Praise be to Allah. None has the right to be worshipped except Allah, alone, without partner; to Him belongs all sovereignty and praise, and He is over all things omnipotent. My Lord, I ask You for the good of this night and the good of what follows it; and I seek refuge in You from the evil of this night and the evil of what follows it. My Lord, I seek refuge in You from laziness and the deterioration of old age. My Lord, I seek refuge in You from torment in the Fire and torment in the grave.',
    name: { en: 'Evening Declaration', ar: 'دعاء المساء' },
    count: 1,
    source: 'مسلم (٢٧٢٣)',
    virtue: { en: 'A comprehensive evening supplication taught by the Prophet ﷺ', ar: 'من أذكار المساء الجامعة' },
  },
  {
    id: 'e5',
    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    english: 'O Allah, by Your grace we have reached the evening, and by Your grace we reach the morning; by You we live and by You we die, and to You is the final return.',
    name: { en: 'Evening Beginning', ar: 'افتتاح المساء' },
    count: 1,
    source: 'أبو داود (٥٠٦٨)، الترمذي (٣٣٩١)',
    virtue: { en: 'Affirming that all life belongs to Allah', ar: 'إقرار بأن الحياة كلها لله' },
  },
  {
    id: 'e6',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    english: 'O Allah, You are my Lord. None has the right to be worshipped except You. You created me and I am Your servant. I uphold Your covenant and my promise to You as best I can. I seek refuge in You from the evil that I have done. I acknowledge Your blessings upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.',
    name: { en: 'Sayyid al-Istighfar', ar: 'سيد الاستغفار' },
    count: 1,
    source: 'البخاري (٦٣٠٦)',
    virtue: { en: 'Whoever says it with certainty in the evening and dies that night enters Paradise', ar: 'من قالها موقناً فمات من ليلته دخل الجنة' },
  },
  {
    id: 'e7',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    english: 'None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty, to Him is all praise, and He is over all things omnipotent.',
    name: { en: 'Tahlil', ar: 'التهليل' },
    count: 10,
    source: 'النسائي (٢٤/٣)، الطبراني',
    virtue: { en: 'Recited 10× morning and evening: reward equal to freeing 4 slaves, 100 good deeds written, 100 sins erased', ar: '١٠ مرات = أجر عتق أربع رقاب وكُتب له ١٠٠ حسنة ومُحيت ١٠٠ سيئة' },
  },
  {
    id: 'e8',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ',
    english: 'In the name of Allah, with whose name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing.',
    name: { en: 'Evening Protection', ar: 'ذكر الحماية' },
    count: 3,
    source: 'أبو داود (٥٠٨٨)، الترمذي (٣٣٨٨)، ابن ماجه (٣٨٦٩)',
    virtue: { en: 'Whoever says it 3× in the evening: nothing will harm him until morning', ar: 'من قالها ثلاثاً حين يمسي لم يضره شيء حتى يصبح' },
  },
  {
    id: 'e9',
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    english: 'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.',
    name: { en: 'Contentment with Allah', ar: 'الرضا بالله' },
    count: 3,
    source: 'أبو داود (٥٠٧٢)، الترمذي (٣٣٨٩)',
    virtue: { en: 'It is a right upon Allah to please the one who says this on the Day of Judgement', ar: 'كان حقاً على الله أن يُرضيه يوم القيامة' },
  },
  {
    id: 'e10',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي',
    english: 'O Allah, I ask You for pardon and well-being in this life and the next. O Allah, I ask You for pardon and well-being in my religion, my worldly affairs, my family, and my wealth. O Allah, conceal my faults and calm my fears.',
    name: { en: "Du'a for Pardon & Well-being", ar: 'دعاء العفو والعافية' },
    count: 1,
    source: 'أبو داود (٥٠٧٤)، ابن ماجه (٣٨٧١)',
    virtue: { en: 'The Prophet ﷺ never abandoned this supplication morning or evening', ar: 'كان النبي ﷺ لا يدعها صباحاً ولا مساءً' },
  },
  {
    id: 'e11',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    english: 'Glory and praise be to Allah.',
    name: { en: 'Tasbih', ar: 'التسبيح' },
    count: 100,
    source: 'مسلم (٢٦٩١)',
    virtue: { en: 'Whoever says it 100× in the evening: his sins are forgiven even if they are like the foam of the sea', ar: 'من قالها مئة مرة حُطَّت خطاياه وإن كانت مثل زبد البحر' },
  },
]

const SETS = { morning: MORNING_ADHKAR, evening: EVENING_ADHKAR }

export default function AdhkarSection() {
  const { language, t } = useApp()
  const { user } = useAuth()
  const isAr = language === 'ar'

  const [tab,      setTab]      = useState('morning')
  const [counts,   setCounts]   = useState({})
  const [expanded, setExpanded] = useState(true)
  const saveTimer = useRef(null)

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(
      doc(db, 'users', user.uid, 'adhkar', getTodayKey()),
      snap => { if (snap.exists()) setCounts(snap.data()) },
      err  => console.error('Adhkar listener:', err)
    )
    return unsub
  }, [user])

  const persistCounts = useCallback((next) => {
    if (!user) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setDoc(
        doc(db, 'users', user.uid, 'adhkar', getTodayKey()),
        { ...next, date: getTodayKey() },
        { merge: true }
      ).catch(err => console.error('Adhkar save:', err))
    }, 600)
  }, [user])

  const increment = (id, target) => {
    setCounts(prev => {
      const next = { ...prev, [id]: Math.min((prev[id] || 0) + 1, target) }
      persistCounts(next)
      return next
    })
  }

  const decrement = (id) => {
    setCounts(prev => {
      const next = { ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) }
      persistCounts(next)
      return next
    })
  }

  const list      = SETS[tab]
  const doneCount = list.filter(a => (counts[a.id] || 0) >= a.count).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        marginTop: '1.5rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🤲</span>
          <span style={{
            fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {t('adhkarTitle')}
          </span>
          <span style={{
            fontSize: '0.7rem',
            background: doneCount === list.length ? 'var(--emerald-dim)' : 'var(--gold-dim)',
            color:      doneCount === list.length ? 'var(--emerald)' : 'var(--gold)',
            border:     `1px solid ${doneCount === list.length ? 'rgba(74,222,128,0.2)' : 'rgba(212,175,106,0.2)'}`,
            borderRadius: 'var(--radius-full)', padding: '0.1rem 0.5rem',
          }}>
            {doneCount}/{list.length}
          </span>
        </div>
        <span style={{
          color: 'var(--text-muted)', fontSize: '0.8rem',
          transition: 'transform 0.2s', display: 'inline-block',
          transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
        }}>▼</span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {/* Tab switcher */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
              {['morning', 'evening'].map(key => (
                <button
                  key={key}
                  onClick={e => { e.stopPropagation(); setTab(key) }}
                  style={{
                    flex: 1, padding: '0.65rem',
                    background: tab === key ? 'var(--gold-dim)' : 'transparent',
                    border: 'none',
                    borderBottom: tab === key ? '2px solid var(--gold)' : '2px solid transparent',
                    color: tab === key ? 'var(--gold)' : 'var(--text-muted)',
                    fontSize: '0.82rem', fontWeight: tab === key ? 500 : 400,
                    cursor: 'pointer', transition: 'all var(--transition)',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  }}
                >
                  {key === 'morning'
                    ? (isAr ? '☀️ أذكار الصباح' : '☀️ Morning')
                    : (isAr ? '🌙 أذكار المساء' : '🌙 Evening')}
                </button>
              ))}
            </div>

            {/* Adhkar list */}
            <div style={{ padding: '0.25rem 0' }}>
              {list.map((adhkar, i) => {
                const current = counts[adhkar.id] || 0
                const isDone  = current >= adhkar.count

                return (
                  <motion.div
                    key={adhkar.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.025 }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.875rem',
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid var(--border)',
                      background: isDone ? 'rgba(74,222,128,0.04)' : 'transparent',
                      transition: 'background var(--transition)',
                    }}
                  >
                    {/* Number badge */}
                    <div style={{
                      flexShrink: 0,
                      width: 26, height: 26, borderRadius: '50%',
                      border: `1.5px solid ${isDone ? 'var(--emerald)' : 'var(--border-strong)'}`,
                      background: isDone ? 'var(--emerald-dim)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 600,
                      color: isDone ? 'var(--emerald)' : 'var(--text-muted)',
                      marginTop: '0.25rem',
                    }}>
                      {isDone ? '✓' : i + 1}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Name row */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        marginBottom: '0.5rem', flexWrap: 'wrap',
                        flexDirection: isAr ? 'row-reverse' : 'row',
                      }}>
                        <span style={{
                          fontSize: '0.78rem', fontWeight: 600,
                          color: isDone ? 'var(--emerald)' : 'var(--text-secondary)',
                          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                        }}>
                          {adhkar.name[language] || adhkar.name.en}
                        </span>
                        <span style={{
                          fontSize: '0.68rem',
                          background: 'var(--gold-dim)', color: 'var(--gold)',
                          border: '1px solid rgba(212,175,106,0.2)',
                          borderRadius: 'var(--radius-full)', padding: '0.05rem 0.45rem',
                        }}>
                          ×{adhkar.count}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                          {adhkar.source}
                        </span>
                      </div>

                      {/* Arabic text */}
                      <p style={{
                        fontFamily: 'var(--font-arabic)',
                        fontSize: '1.1rem', lineHeight: 2,
                        color: isDone ? 'var(--emerald)' : 'var(--text-primary)',
                        opacity: isDone ? 0.75 : 1,
                        direction: 'rtl', textAlign: 'right',
                        margin: '0 0 0.5rem',
                        transition: 'color var(--transition)',
                      }}>
                        {adhkar.arabic}
                      </p>

                      {/* English translation */}
                      {language === 'en' && (
                        <p style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.65,
                          fontStyle: 'italic',
                          margin: '0 0 0.5rem',
                          paddingLeft: '0.5rem',
                          borderLeft: '2px solid var(--border)',
                          direction: 'ltr',
                          textAlign: 'left',
                        }}>
                          {adhkar.english}
                        </p>
                      )}

                      {/* Virtue */}
                      <p style={{
                        fontSize: '0.72rem', color: 'var(--gold)',
                        fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                        direction: isAr ? 'rtl' : 'ltr', margin: 0, opacity: 0.85,
                      }}>
                        ✦ {adhkar.virtue[language] || adhkar.virtue.en}
                      </p>
                    </div>

                    {/* Counter widget */}
                    <div style={{
                      flexShrink: 0,
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: '0.3rem', marginTop: '0.2rem',
                    }}>
                      <div style={{
                        fontSize: '0.72rem', fontWeight: 600,
                        color: isDone ? 'var(--emerald)' : 'var(--text-secondary)',
                        fontVariantNumeric: 'tabular-nums',
                        minWidth: 36, textAlign: 'center',
                        transition: 'color var(--transition)',
                      }}>
                        {current}/{adhkar.count}
                      </div>

                      <div style={{
                        width: 52, height: 3, borderRadius: 2,
                        background: 'var(--border)', overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min((current / adhkar.count) * 100, 100)}%`,
                          background: isDone ? 'var(--emerald)' : 'var(--gold)',
                          borderRadius: 2, transition: 'width 0.2s ease, background 0.2s',
                        }} />
                      </div>

                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.15rem' }}>
                        <button
                          onClick={() => decrement(adhkar.id)}
                          disabled={current === 0}
                          style={{
                            width: 22, height: 22, borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-strong)',
                            background: 'transparent',
                            color: current === 0 ? 'var(--border-strong)' : 'var(--text-muted)',
                            fontSize: '0.9rem', lineHeight: 1,
                            cursor: current === 0 ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all var(--transition)',
                          }}
                        >−</button>
                        <button
                          onClick={() => increment(adhkar.id, adhkar.count)}
                          disabled={isDone}
                          style={{
                            width: 22, height: 22, borderRadius: 'var(--radius-sm)',
                            border: `1px solid ${isDone ? 'var(--emerald)' : 'var(--gold)'}`,
                            background: isDone ? 'var(--emerald-dim)' : 'var(--gold-dim)',
                            color: isDone ? 'var(--emerald)' : 'var(--gold)',
                            fontSize: '0.9rem', lineHeight: 1,
                            cursor: isDone ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all var(--transition)',
                          }}
                        >+</button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
