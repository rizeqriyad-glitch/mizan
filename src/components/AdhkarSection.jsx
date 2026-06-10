import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { getTodayKey } from '../utils/dateUtils'

// Source: حصن المسلم — Dr. Sa'id ibn Ali ibn Wahf al-Qahtani

const MORNING_ADHKAR = [
  {
    id: 'm0',
    arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\n﴿اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾',
    english: 'I seek refuge in Allah from the accursed Satan. "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and on the earth. Who can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great." [Al-Baqarah: 255]',
    name: { en: 'Ayat al-Kursi', ar: 'آية الكرسي' },
    count: 1,
    source: 'البقرة: ٢٥٥',
    virtue: { en: 'Whoever recites it in the morning will be protected from jinn until evening', ar: 'من قرأها حين يصبح أُجير من الجن حتى يمسي' },
  },
  {
    id: 'm1',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\n﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾\nبِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\n﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾\nبِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\n﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ﴾',
    english: 'In the name of Allah, the Most Gracious, the Most Merciful. "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent." // "Say: I seek refuge in the Lord of daybreak, from the evil of what He has created, from the evil of darkness when it settles, from the evil of the blowers in knots, and from the evil of an envier when he envies." // "Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer — who whispers in the breasts of mankind — from among the jinn and mankind."',
    name: { en: 'Al-Muʿawwidhat', ar: 'المعوِّذات' },
    count: 3,
    source: 'أبو داود (٥٠٨٢)',
    virtue: { en: 'Sufficient as a protection from every evil when recited 3 times morning and evening', ar: 'تكفيك من كل شيء إذا قُرئت ثلاثاً صباحاً ومساءً' },
  },
  {
    id: 'm2',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
    english: 'We have reached the morning and at this very time unto Allah belongs all sovereignty. Praise is to Allah. None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and all praise, and He is over all things omnipotent. My Lord, I ask You for the good of this day and the good of what follows it; and I seek refuge in You from the evil of this day and the evil of what follows it. My Lord, I seek refuge in You from laziness and the deterioration of old age. My Lord, I seek refuge in You from the torment of the Fire and the torment of the grave.',
    name: { en: 'Morning Declaration', ar: 'دعاء الصباح' },
    count: 1,
    source: 'مسلم (٢٧٢٣)',
    virtue: { en: 'A comprehensive morning supplication taught by the Prophet ﷺ', ar: 'من أذكار الصباح الجامعة النبوية' },
  },
  {
    id: 'm3',
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    english: 'O Allah, by Your leave we have reached the morning and by Your leave we reach the evening; by You we live and by You we die, and unto You is the resurrection.',
    name: { en: 'Morning by Allah\'s Leave', ar: 'افتتاح الصباح' },
    count: 1,
    source: 'أبو داود (٥٠٦٨)، الترمذي (٣٣٩١)',
    virtue: { en: 'Affirming that all life and existence belongs to Allah alone', ar: 'إقرار بأن الحياة كلها لله' },
  },
  {
    id: 'm4',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    english: 'O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.',
    name: { en: 'Sayyid al-Istighfar', ar: 'سيد الاستغفار' },
    count: 1,
    source: 'البخاري (٦٣٠٦)',
    virtue: { en: 'Whoever says it with certainty in the morning and dies that day enters Paradise', ar: 'من قالها موقناً فمات من يومه دخل الجنة' },
  },
  {
    id: 'm5',
    arabic: 'اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُكَ',
    english: 'O Allah, I have reached the morning calling upon You as my witness, and upon the bearers of Your Throne, Your angels, and all of Your creation, that You are Allah — none has the right to be worshipped except You — alone, without partner, and that Muhammad ﷺ is Your servant and Your Messenger.',
    name: { en: 'Morning Testimony', ar: 'شهادة الصباح' },
    count: 4,
    source: 'أبو داود (٥٠٦٩)',
    virtue: { en: 'Allah will free a quarter of him from the Fire for each time he says it (4 times = fully freed)', ar: 'أعتقه الله ربع النار من قالها مرة، فمن قالها أربعاً أعتقه من النار' },
  },
  {
    id: 'm6',
    arabic: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',
    english: 'O Allah, whatever blessing I or any of Your creation have reached the morning with, it is from You alone, without partner, so to You belongs all praise and to You all thanks.',
    name: { en: 'Morning Gratitude', ar: 'شكر النعمة صباحاً' },
    count: 1,
    source: 'أبو داود (٥٠٧٣)',
    virtue: { en: 'Whoever says it in the morning has fulfilled the thanksgiving due for that day', ar: 'من قالها حين يصبح فقد أدى شكر يومه' },
  },
  {
    id: 'm7',
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ',
    english: 'O Allah, grant well-being to my body. O Allah, grant well-being to my hearing. O Allah, grant well-being to my sight. None has the right to be worshipped except You. O Allah, I seek Your refuge from disbelief and poverty, and I seek Your refuge from the punishment of the grave. None has the right to be worshipped except You.',
    name: { en: 'Du\'ā for Well-being', ar: 'دعاء العافية' },
    count: 3,
    source: 'أبو داود (٥٠٩٠)',
    virtue: { en: 'Supplication for sound health in body, hearing, sight, faith, and from the punishment of the grave', ar: 'دعاء للعافية في البدن والسمع والبصر والإيمان والقبر' },
  },
  {
    id: 'm8',
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    english: 'Sufficient for me is Allah; none has the right to be worshipped except Him. Upon Him I rely, and He is the Lord of the Magnificent Throne.',
    name: { en: 'Allah is Sufficient for Me', ar: 'حسبي الله' },
    count: 7,
    source: 'أبو داود (٥٠٨١)',
    virtue: { en: 'Whoever says it 7 times morning and evening — Allah will take care of his affair in this world and the next', ar: 'كفاه الله ما أهمه من أمر الدنيا والآخرة من قالها سبع مرات' },
  },
  {
    id: 'm9',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي',
    english: 'O Allah, I ask You for pardon and well-being in this life and the next. O Allah, I ask You for pardon and well-being in my religion, my worldly affairs, my family, and my wealth. O Allah, conceal my faults and calm my fears. O Allah, protect me from what is before me and behind me, from my right and my left, and from above me; and I seek refuge in Your greatness from being struck down from beneath me.',
    name: { en: 'Du\'ā for Pardon & Well-being', ar: 'دعاء العفو والعافية' },
    count: 1,
    source: 'أبو داود (٥٠٧٤)، ابن ماجه (٣٨٧١)',
    virtue: { en: 'The Prophet ﷺ never abandoned this supplication morning or evening', ar: 'كان النبي ﷺ لا يدعها صباحاً ولا مساءً' },
  },
  {
    id: 'm10',
    arabic: 'اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ',
    english: 'O Allah, Knower of the unseen and the manifest, Creator of the heavens and the earth, Lord and Sovereign of all things, I bear witness that none has the right to be worshipped except You. I seek Your refuge from the evil within myself and from the evil of the devil and his snare, and from committing wrong against myself or bringing it upon a Muslim.',
    name: { en: 'Seeking Refuge in Allah', ar: 'الاستعاذة بالله' },
    count: 1,
    source: 'أبو داود (٥٠٦٧)، الترمذي (٣٣٩٢)',
    virtue: { en: 'Comprehensive protection from the evil of self, Satan, and oppressing others', ar: 'حماية شاملة من شر النفس والشيطان وظلم الآخرين' },
  },
  {
    id: 'm11',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    english: 'In the name of Allah with whose name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing.',
    name: { en: 'Protection by Allah\'s Name', ar: 'ذكر الحماية' },
    count: 3,
    source: 'أبو داود (٥٠٨٨)، الترمذي (٣٣٨٨)، ابن ماجه (٣٨٦٩)',
    virtue: { en: 'Whoever says it 3 times in the morning: nothing will harm him until evening', ar: 'من قالها ثلاثاً حين يصبح لم يضره شيء حتى يمسي' },
  },
  {
    id: 'm12',
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    english: 'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.',
    name: { en: 'Contentment with Allah', ar: 'الرضا بالله' },
    count: 3,
    source: 'أبو داود (٥٠٧٢)، الترمذي (٣٣٨٩)',
    virtue: { en: 'It is a right upon Allah to please whoever says this 3 times morning and evening on the Day of Resurrection', ar: 'كان حقاً على الله أن يُرضيه يوم القيامة' },
  },
  {
    id: 'm13',
    arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
    english: 'O Ever-Living, O Sustainer of existence, by Your mercy I seek help — rectify for me all of my affairs and do not leave me to depend upon myself for even the blink of an eye.',
    name: { en: 'Yā Ḥayyu Yā Qayyūm', ar: 'يا حي يا قيوم' },
    count: 1,
    source: 'الحاكم (١/٥٤٥)',
    virtue: { en: 'Taught by the Prophet ﷺ to Fatimah to say each morning and evening', ar: 'علّمها النبي ﷺ لفاطمة تقولها صباحاً ومساءً' },
  },
  {
    id: 'm14',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ: فَتْحَهُ وَنَصْرَهُ وَنُورَهُ وَبَرَكَتَهُ وَهُدَاهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهِ وَشَرِّ مَا بَعْدَهُ',
    english: 'We have reached the morning and dominion belongs to Allah, Lord of the worlds. O Allah, I ask You for the best of this day: its opening, its victory, its light, its blessing, and its guidance; and I seek Your refuge from the evil within it and the evil of what follows it.',
    name: { en: 'Morning of the Lord of Worlds', ar: 'صباح رب العالمين' },
    count: 1,
    source: 'أبو داود (٥٠٨٤)',
    virtue: { en: 'Asking Allah for all the good of the day and seeking refuge from all its evil', ar: 'سؤال الله خير اليوم كاملاً والاستعاذة من شره' },
  },
  {
    id: 'm15',
    arabic: 'أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ',
    english: 'We have risen upon the fitrah of Islam, upon the word of sincere devotion, upon the religion of our Prophet Muhammad ﷺ, and upon the way of our forefather Ibrahim, who was upright, a Muslim, and was not of the polytheists.',
    name: { en: 'Upon the Fitrah of Islam', ar: 'على فطرة الإسلام' },
    count: 1,
    source: 'النسائي (٨٦٦٨)، أحمد (١٥٣٥٢)',
    virtue: { en: 'Affirming one\'s commitment to the pure religion of Islam, the Kalimah, and the way of Ibrahim ﷺ', ar: 'إقرار بالإسلام والتوحيد ودين إبراهيم عليه السلام' },
  },
  {
    id: 'm16',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    english: 'Glory and praise be to Allah.',
    name: { en: 'Tasbīḥ', ar: 'التسبيح' },
    count: 100,
    source: 'مسلم (٢٦٩١)',
    virtue: { en: 'Whoever says it 100 times in the morning: his sins will be forgiven even if they are like the foam of the sea', ar: 'من قالها مئة مرة حُطَّت خطاياه وإن كانت مثل زبد البحر' },
  },
  {
    id: 'm17',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    english: 'None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and all praise, and He is over all things omnipotent. (10 times — or once if tired)',
    name: { en: 'Tahlīl', ar: 'التهليل' },
    count: 10,
    source: 'النسائي (٩٨٣٧)، الطبراني',
    virtue: { en: 'Recited 10× morning and evening: reward of freeing 4 slaves, 100 good deeds written, 100 sins erased, protected from Satan all day', ar: '١٠ مرات = أجر عتق ٤ رقاب و١٠٠ حسنة ومحو ١٠٠ سيئة وحرز من الشيطان' },
  },
  {
    id: 'm18',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    english: 'None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and all praise, and He is over all things omnipotent. (100 times — each morning)',
    name: { en: 'Tahlīl — 100×', ar: 'التهليل المئة' },
    count: 100,
    source: 'مسلم (٢٦٩٢)',
    virtue: { en: 'Said 100 times in the morning: equal to freeing 10 slaves, 100 good deeds written, 100 sins erased; best deed that day except one who said more', ar: '١٠٠ مرة صباحاً = عتق ١٠ رقاب وأفضل عمل ذلك اليوم' },
  },
  {
    id: 'm19',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
    english: 'Glory be to Allah and all praise is due to Him as many as the number of His creation, in accordance with His good pleasure, equal to the weight of His Throne, and equal to the ink of His words.',
    name: { en: 'Comprehensive Tasbīḥ', ar: 'التسبيح الجامع' },
    count: 3,
    source: 'مسلم (٢٧٢٦)',
    virtue: { en: 'The Prophet ﷺ said: "None can say better than this except one who said the same or more"', ar: 'قال النبي ﷺ: لا يأتي أحد بأفضل مما قاله إلا أحد قال مثله أو زاد عليه' },
  },
  {
    id: 'm20',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    english: 'O Allah, I ask You for beneficial knowledge, wholesome provision, and accepted deeds.',
    name: { en: 'Morning Du\'ā for Knowledge', ar: 'دعاء الصباح للعلم' },
    count: 1,
    source: 'ابن ماجه (٩٢٥)',
    virtue: { en: 'Said each morning: asking for the three foundations of a blessed life', ar: 'يُقال كل صباح طلباً للعلم النافع والرزق الطيب والعمل المقبول' },
  },
  {
    id: 'm21',
    arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    english: 'I seek forgiveness from Allah and repent to Him.',
    name: { en: 'Istighfār', ar: 'الاستغفار' },
    count: 100,
    source: 'البخاري (٦٣٠٧)، مسلم (٢٧٠٢)',
    virtue: { en: 'The Prophet ﷺ used to seek forgiveness more than 70 times a day', ar: 'كان النبي ﷺ يستغفر في اليوم أكثر من سبعين مرة' },
  },
  {
    id: 'm22',
    arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    english: 'O Allah, send Your blessings and peace upon our Prophet Muhammad.',
    name: { en: 'Ṣalawāt on the Prophet', ar: 'الصلاة على النبي' },
    count: 10,
    source: 'الطبراني',
    virtue: { en: 'Whoever sends blessings upon the Prophet 10 times morning and evening will earn his intercession on the Day of Resurrection', ar: 'من صلى عليه ١٠ مرات صباحاً ومساءً نال شفاعته يوم القيامة' },
  },
]

const EVENING_ADHKAR = [
  {
    id: 'e0',
    arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\n﴿اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾',
    english: 'I seek refuge in Allah from the accursed Satan. "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and on the earth. Who can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great."',
    name: { en: 'Ayat al-Kursi', ar: 'آية الكرسي' },
    count: 1,
    source: 'البقرة: ٢٥٥',
    virtue: { en: 'Whoever recites it in the evening will be protected from jinn until morning', ar: 'من قرأها حين يمسي أُجير من الجن حتى يصبح' },
  },
  {
    id: 'e1',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\n﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾\nبِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\n﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾\nبِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\n﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ﴾',
    english: 'In the name of Allah, the Most Gracious, the Most Merciful. "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent." // "Say: I seek refuge in the Lord of daybreak, from the evil of what He has created, from the evil of darkness when it settles, from the evil of the blowers in knots, and from the evil of an envier when he envies." // "Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer — from among the jinn and mankind."',
    name: { en: 'Al-Muʿawwidhat', ar: 'المعوِّذات' },
    count: 3,
    source: 'أبو داود (٥٠٨٢)',
    virtue: { en: 'Sufficient as a protection from every evil when recited 3 times morning and evening', ar: 'تكفيك من كل شيء إذا قُرئت ثلاثاً صباحاً ومساءً' },
  },
  {
    id: 'e2',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
    english: 'We have reached the evening and at this very time unto Allah belongs all sovereignty. Praise is to Allah. None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and all praise, and He is over all things omnipotent. My Lord, I ask You for the good of this night and the good of what follows it; and I seek refuge in You from the evil of this night and the evil of what follows it. My Lord, I seek refuge in You from laziness and the deterioration of old age. My Lord, I seek refuge in You from the torment of the Fire and the torment of the grave.',
    name: { en: 'Evening Declaration', ar: 'دعاء المساء' },
    count: 1,
    source: 'مسلم (٢٧٢٣)',
    virtue: { en: 'A comprehensive evening supplication taught by the Prophet ﷺ', ar: 'من أذكار المساء الجامعة النبوية' },
  },
  {
    id: 'e3',
    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    english: 'O Allah, by Your leave we have reached the evening and by Your leave we reach the morning; by You we live and by You we die, and unto You is the final return.',
    name: { en: 'Evening by Allah\'s Leave', ar: 'افتتاح المساء' },
    count: 1,
    source: 'أبو داود (٥٠٦٨)، الترمذي (٣٣٩١)',
    virtue: { en: 'Affirming that all life and existence belongs to Allah alone', ar: 'إقرار بأن الحياة كلها لله' },
  },
  {
    id: 'e4',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    english: 'O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.',
    name: { en: 'Sayyid al-Istighfar', ar: 'سيد الاستغفار' },
    count: 1,
    source: 'البخاري (٦٣٠٦)',
    virtue: { en: 'Whoever says it with certainty in the evening and dies that night enters Paradise', ar: 'من قالها موقناً فمات من ليلته دخل الجنة' },
  },
  {
    id: 'e5',
    arabic: 'اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُكَ',
    english: 'O Allah, I have reached the evening calling upon You as my witness, and upon the bearers of Your Throne, Your angels, and all of Your creation, that You are Allah — none has the right to be worshipped except You — alone, without partner, and that Muhammad ﷺ is Your servant and Your Messenger.',
    name: { en: 'Evening Testimony', ar: 'شهادة المساء' },
    count: 4,
    source: 'أبو داود (٥٠٦٩)',
    virtue: { en: 'Allah will free a quarter of him from the Fire for each time he says it (4 times = fully freed)', ar: 'أعتقه الله ربع النار من قالها مرة، فمن قالها أربعاً أعتقه من النار' },
  },
  {
    id: 'e6',
    arabic: 'اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',
    english: 'O Allah, whatever blessing I or any of Your creation have reached the evening with, it is from You alone, without partner, so to You belongs all praise and to You all thanks.',
    name: { en: 'Evening Gratitude', ar: 'شكر النعمة مساءً' },
    count: 1,
    source: 'أبو داود (٥٠٧٣)',
    virtue: { en: 'Whoever says it in the evening has fulfilled the thanksgiving due for that night', ar: 'من قالها حين يمسي فقد أدى شكر ليلته' },
  },
  {
    id: 'e7',
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ',
    english: 'O Allah, grant well-being to my body. O Allah, grant well-being to my hearing. O Allah, grant well-being to my sight. None has the right to be worshipped except You. O Allah, I seek Your refuge from disbelief and poverty, and I seek Your refuge from the punishment of the grave. None has the right to be worshipped except You.',
    name: { en: 'Du\'ā for Well-being', ar: 'دعاء العافية' },
    count: 3,
    source: 'أبو داود (٥٠٩٠)',
    virtue: { en: 'Supplication for sound health in body, hearing, sight, faith, and from the punishment of the grave', ar: 'دعاء للعافية في البدن والسمع والبصر والإيمان والقبر' },
  },
  {
    id: 'e8',
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    english: 'Sufficient for me is Allah; none has the right to be worshipped except Him. Upon Him I rely, and He is the Lord of the Magnificent Throne.',
    name: { en: 'Allah is Sufficient for Me', ar: 'حسبي الله' },
    count: 7,
    source: 'أبو داود (٥٠٨١)',
    virtue: { en: 'Whoever says it 7 times morning and evening — Allah will take care of his affair in this world and the next', ar: 'كفاه الله ما أهمه من أمر الدنيا والآخرة من قالها سبع مرات' },
  },
  {
    id: 'e9',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي',
    english: 'O Allah, I ask You for pardon and well-being in this life and the next. O Allah, I ask You for pardon and well-being in my religion, my worldly affairs, my family, and my wealth. O Allah, conceal my faults and calm my fears. O Allah, protect me from what is before me and behind me, from my right and my left, and from above me; and I seek refuge in Your greatness from being struck down from beneath me.',
    name: { en: 'Du\'ā for Pardon & Well-being', ar: 'دعاء العفو والعافية' },
    count: 1,
    source: 'أبو داود (٥٠٧٤)، ابن ماجه (٣٨٧١)',
    virtue: { en: 'The Prophet ﷺ never abandoned this supplication morning or evening', ar: 'كان النبي ﷺ لا يدعها صباحاً ولا مساءً' },
  },
  {
    id: 'e10',
    arabic: 'اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ',
    english: 'O Allah, Knower of the unseen and the manifest, Creator of the heavens and the earth, Lord and Sovereign of all things, I bear witness that none has the right to be worshipped except You. I seek Your refuge from the evil within myself and from the evil of the devil and his snare, and from committing wrong against myself or bringing it upon a Muslim.',
    name: { en: 'Seeking Refuge in Allah', ar: 'الاستعاذة بالله' },
    count: 1,
    source: 'أبو داود (٥٠٦٧)، الترمذي (٣٣٩٢)',
    virtue: { en: 'Comprehensive protection from the evil of self, Satan, and oppressing others', ar: 'حماية شاملة من شر النفس والشيطان وظلم الآخرين' },
  },
  {
    id: 'e11',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    english: 'In the name of Allah with whose name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing.',
    name: { en: 'Protection by Allah\'s Name', ar: 'ذكر الحماية' },
    count: 3,
    source: 'أبو داود (٥٠٨٨)، الترمذي (٣٣٨٨)، ابن ماجه (٣٨٦٩)',
    virtue: { en: 'Whoever says it 3 times in the evening: nothing will harm him until morning', ar: 'من قالها ثلاثاً حين يمسي لم يضره شيء حتى يصبح' },
  },
  {
    id: 'e12',
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    english: 'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.',
    name: { en: 'Contentment with Allah', ar: 'الرضا بالله' },
    count: 3,
    source: 'أبو داود (٥٠٧٢)، الترمذي (٣٣٨٩)',
    virtue: { en: 'It is a right upon Allah to please whoever says this 3 times morning and evening on the Day of Resurrection', ar: 'كان حقاً على الله أن يُرضيه يوم القيامة' },
  },
  {
    id: 'e13',
    arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
    english: 'O Ever-Living, O Sustainer of existence, by Your mercy I seek help — rectify for me all of my affairs and do not leave me to depend upon myself for even the blink of an eye.',
    name: { en: 'Yā Ḥayyu Yā Qayyūm', ar: 'يا حي يا قيوم' },
    count: 1,
    source: 'الحاكم (١/٥٤٥)',
    virtue: { en: 'Taught by the Prophet ﷺ to Fatimah to say each morning and evening', ar: 'علّمها النبي ﷺ لفاطمة تقولها صباحاً ومساءً' },
  },
  {
    id: 'e14',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ: فَتْحَهَا وَنَصْرَهَا وَنُورَهَا وَبَرَكَتَهَا وَهُدَاهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهَا وَشَرِّ مَا بَعْدَهَا',
    english: 'We have reached the evening and dominion belongs to Allah, Lord of the worlds. O Allah, I ask You for the best of this night: its opening, its victory, its light, its blessing, and its guidance; and I seek Your refuge from the evil within it and the evil of what follows it.',
    name: { en: 'Evening of the Lord of Worlds', ar: 'مساء رب العالمين' },
    count: 1,
    source: 'أبو داود (٥٠٨٤)',
    virtue: { en: 'Asking Allah for all the good of the night and seeking refuge from all its evil', ar: 'سؤال الله خير الليلة كاملاً والاستعاذة من شرها' },
  },
  {
    id: 'e15',
    arabic: 'أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ',
    english: 'We have reached the evening upon the fitrah of Islam, upon the word of sincere devotion, upon the religion of our Prophet Muhammad ﷺ, and upon the way of our forefather Ibrahim, who was upright, a Muslim, and was not of the polytheists.',
    name: { en: 'Upon the Fitrah of Islam', ar: 'على فطرة الإسلام' },
    count: 1,
    source: 'النسائي (٨٦٦٨)، أحمد (١٥٣٥٢)',
    virtue: { en: 'Affirming one\'s commitment to the pure religion of Islam at the close of the day', ar: 'إقرار بالإسلام والتوحيد في ختام اليوم' },
  },
  {
    id: 'e16',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    english: 'Glory and praise be to Allah.',
    name: { en: 'Tasbīḥ', ar: 'التسبيح' },
    count: 100,
    source: 'مسلم (٢٦٩١)',
    virtue: { en: 'Whoever says it 100 times in the evening: his sins will be forgiven even if they are like the foam of the sea', ar: 'من قالها مئة مرة حُطَّت خطاياه وإن كانت مثل زبد البحر' },
  },
  {
    id: 'e17',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    english: 'None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and all praise, and He is over all things omnipotent.',
    name: { en: 'Tahlīl', ar: 'التهليل' },
    count: 10,
    source: 'النسائي (٩٨٣٧)، الطبراني',
    virtue: { en: 'Recited 10× morning and evening: reward of freeing 4 slaves, 100 good deeds, 100 sins erased, protected from Satan all night', ar: '١٠ مرات = أجر عتق ٤ رقاب و١٠٠ حسنة ومحو ١٠٠ سيئة وحرز من الشيطان' },
  },
  {
    id: 'e18',
    arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    english: 'I seek forgiveness from Allah and repent to Him.',
    name: { en: 'Istighfār', ar: 'الاستغفار' },
    count: 100,
    source: 'البخاري (٦٣٠٧)، مسلم (٢٧٠٢)',
    virtue: { en: 'The Prophet ﷺ used to seek forgiveness more than 70 times a day', ar: 'كان النبي ﷺ يستغفر في اليوم أكثر من سبعين مرة' },
  },
  {
    id: 'e19',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    english: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    name: { en: 'Evening Protection', ar: 'حماية المساء' },
    count: 3,
    source: 'مسلم (٢٧٠٩)',
    virtue: { en: 'Whoever says it 3 times when evening comes: no harmful creature will harm him that night', ar: 'من قالها ثلاثاً حين يمسي لم تضره حُمَة تلك الليلة' },
  },
  {
    id: 'e20',
    arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    english: 'O Allah, send Your blessings and peace upon our Prophet Muhammad.',
    name: { en: 'Ṣalawāt on the Prophet', ar: 'الصلاة على النبي' },
    count: 10,
    source: 'الطبراني',
    virtue: { en: 'Whoever sends blessings upon the Prophet 10 times morning and evening will earn his intercession on the Day of Resurrection', ar: 'من صلى عليه ١٠ مرات صباحاً ومساءً نال شفاعته يوم القيامة' },
  },
]

const SETS = { morning: MORNING_ADHKAR, evening: EVENING_ADHKAR }

export default function AdhkarSection() {
  const { language, t } = useApp()
  const { user } = useAuth()
  const isAr = language === 'ar'

  const [tab,          setTab]          = useState('morning')
  const [counts,       setCounts]       = useState({})
  const [expanded,     setExpanded]     = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction,    setDirection]    = useState(1)
  const saveTimer        = useRef(null)
  const autoAdvTimer     = useRef(null)
  const tabRef           = useRef(tab)
  const isArRef          = useRef(isAr)
  useEffect(() => { tabRef.current = tab }, [tab])
  useEffect(() => { isArRef.current = isAr }, [isAr])

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(
      doc(db, 'users', user.uid, 'adhkar', getTodayKey()),
      snap => { if (snap.exists()) setCounts(snap.data()) },
      err  => console.error('Adhkar listener:', err)
    )
    return unsub
  }, [user])

  // Reset to first item when switching tabs
  useEffect(() => {
    setCurrentIndex(0)
    setDirection(1)
  }, [tab])

  useEffect(() => () => {
    clearTimeout(saveTimer.current)
    clearTimeout(autoAdvTimer.current)
  }, [])

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
      const newCount = Math.min((prev[id] || 0) + 1, target)
      const next = { ...prev, [id]: newCount }
      persistCounts(next)
      if (newCount >= target) {
        clearTimeout(autoAdvTimer.current)
        autoAdvTimer.current = setTimeout(() => {
          const maxIndex = SETS[tabRef.current].length - 1
          setDirection(isArRef.current ? -1 : 1)
          setCurrentIndex(i => i < maxIndex ? i + 1 : i)
        }, 700)
      }
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

  const goTo = (idx) => {
    if (idx < 0 || idx >= list.length) return
    const forward = idx > currentIndex
    setDirection(isAr ? (forward ? -1 : 1) : (forward ? 1 : -1))
    setCurrentIndex(idx)
  }

  const list      = SETS[tab]
  const doneCount = list.filter(a => (counts[a.id] || 0) >= a.count).length
  const adhkar    = list[currentIndex]
  const current   = counts[adhkar?.id] || 0
  const isDone    = adhkar ? current >= adhkar.count : false

  return (
    <motion.div 
      className="glass-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginTop: '1.5rem',
        padding: '0',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          cursor: 'pointer',
          background: 'var(--v-glass-bg)', // Apply glass background to header
        }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="glass-icon-mizan" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🤲</div>
          <span style={{
            fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            fontFamily: 'var(--font-brand)',
          }}>
            {t('adhkarTitle')}
          </span>
          <span style={{
            fontSize: '0.7rem',
            background: doneCount === list.length ? 'rgba(0,201,255,0.1)' : 'rgba(108,71,255,0.1)',
            color:      doneCount === list.length ? 'var(--mizan-cyan)' : 'var(--mizan-purple)',
            border:     `1px solid ${doneCount === list.length ? 'rgba(0,201,255,0.2)' : 'rgba(108,71,255,0.2)'}`,
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
                    flex: 1, padding: '0.75rem',
                    background: tab === key ? 'rgba(108,71,255,0.1)' : 'transparent',
                    border: 'none',
                    borderBottom: tab === key ? '2px solid var(--mizan-purple)' : '2px solid transparent',
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

            {/* Navigation bar */}
            <div style={{
              display: 'flex', alignItems: 'center',
              padding: '0.6rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              gap: '0.75rem',
              direction: isAr ? 'rtl' : 'ltr',
            }}>
              {/* In LTR: prev on left (‹). In RTL: prev on right (›) — flex reversal handles position */}
              <button
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0}
                title={isAr ? 'السابق' : 'Previous'} // Navigation button
                style={{
                  width: 30, height: 30, borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-strong)',
                  background: 'transparent',
                  color: currentIndex === 0 ? 'var(--border-strong)' : 'var(--text-secondary)',
                  fontSize: '1.1rem', lineHeight: 1,
                  cursor: currentIndex === 0 ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all var(--transition)', flexShrink: 0,
                }}
              >{isAr ? '→' : '←'}</button>

              {/* Progress track */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', direction: 'ltr' }}>
                  {currentIndex + 1} / {list.length}
                </div>
                <div style={{ width: '100%', height: 3, borderRadius: 2, background: 'var(--border)' }}>
                  <div style={{
                    height: '100%',
                    width: `${(doneCount / list.length) * 100}%`, // Progress bar
                    background: 'var(--emerald)',
                    borderRadius: 2, transition: 'width 0.35s ease',
                  }} />
                </div>
              </div>

              {/* In LTR: next on right (›). In RTL: next on left (‹) */}
              <button
                onClick={() => goTo(currentIndex + 1)}
                disabled={currentIndex === list.length - 1}
                title={isAr ? 'التالي' : 'Next'} // Navigation button
                style={{
                  width: 30, height: 30, borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-strong)',
                  background: 'transparent',
                  color: currentIndex === list.length - 1 ? 'var(--border-strong)' : 'var(--text-secondary)',
                  fontSize: '1.1rem', lineHeight: 1,
                  cursor: currentIndex === list.length - 1 ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all var(--transition)', flexShrink: 0,
                }}
              >{isAr ? '←' : '→'}</button>
            </div>

            {/* Single dhikr card */}
            <AnimatePresence mode="wait">
              {adhkar && (
                <motion.div
                  key={`${tab}-${currentIndex}`}
                  initial={{ opacity: 0, x: direction * 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -28 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    padding: '1.5rem',
                    background: isDone ? 'rgba(74,222,128,0.04)' : 'transparent',
                    transition: 'background var(--transition)',
                  }}
                >
                  {/* Name row */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    marginBottom: '0.875rem', flexWrap: 'wrap',
                    flexDirection: isAr ? 'row-reverse' : 'row',
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      border: `1.5px solid ${isDone ? 'var(--mizan-cyan)' : 'var(--v-glass-border)'}`,
                      background: isDone ? 'rgba(0,201,255,0.1)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 600,
                      color: isDone ? 'var(--emerald)' : 'var(--text-muted)',
                    }}>
                      {isDone ? '✓' : currentIndex + 1}
                    </div>
                    <span style={{
                      fontSize: '0.85rem', fontWeight: 600,
                      color: isDone ? 'var(--emerald)' : 'var(--text-secondary)',
                      fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                    }}>
                      {adhkar.name[language] || adhkar.name.en}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      background: 'rgba(108,71,255,0.1)', color: 'var(--mizan-purple)',
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
                    fontSize: '1.1rem', lineHeight: 2.2,
                    color: isDone ? 'var(--emerald)' : 'var(--text-primary)',
                    opacity: isDone ? 0.75 : 1,
                    direction: 'rtl', textAlign: 'right',
                    margin: '0 0 0.75rem',
                    transition: 'color var(--transition)',
                    whiteSpace: 'pre-line',
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
                      margin: '0 0 0.75rem',
                      paddingLeft: '0.5rem',
                      borderLeft: '2px solid var(--border)',
                      direction: 'ltr', textAlign: 'left',
                    }}>
                      {adhkar.english}
                    </p>
                  )}

                  {/* Virtue */}
                  <p style={{
                    fontSize: '0.72rem', color: 'var(--gold)',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                    direction: isAr ? 'rtl' : 'ltr',
                    textAlign: isAr ? 'right' : 'left',
                    margin: '0 0 1.25rem', opacity: 0.85,
                  }}>
                    ✦ {adhkar.virtue[language] || adhkar.virtue.en}
                  </p>

                  {/* Counter */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '1rem', paddingTop: '1rem',
                    borderTop: '1px solid var(--border)',
                  }}>
                    <button
                      onClick={() => decrement(adhkar.id)}
                      disabled={current === 0}
                      style={{
                        width: 34, height: 34, borderRadius: '8px',
                        border: '1px solid var(--border-strong)', background: 'transparent',
                        color: current === 0 ? 'var(--border-strong)' : 'var(--text-muted)',
                        fontSize: '1.2rem', lineHeight: 1,
                        cursor: current === 0 ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all var(--transition)',
                      }}
                    >−</button>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', minWidth: 80 }}>
                      <div style={{
                        fontSize: '1.05rem', fontWeight: 600,
                        color: isDone ? 'var(--emerald)' : 'var(--text-primary)',
                        fontVariantNumeric: 'tabular-nums',
                        transition: 'color var(--transition)',
                      }}>
                        {current} / {adhkar.count}
                      </div>
                      <div style={{ width: '100%', height: 4, borderRadius: 2, background: 'var(--border)' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min((current / adhkar.count) * 100, 100)}%`, // Progress bar
                          background: isDone ? 'var(--emerald)' : 'var(--gold)',
                          borderRadius: 2, transition: 'width 0.2s ease, background 0.2s',
                        }} />
                      </div>
                    </div>

                    <button
                      onClick={() => increment(adhkar.id, adhkar.count)}
                      disabled={isDone}
                      style={{
                        width: 34, height: 34, borderRadius: '8px',
                        border: `1px solid ${isDone ? 'var(--mizan-cyan)' : 'var(--mizan-purple)'}`,
                        background: isDone ? 'rgba(0,201,255,0.1)' : 'rgba(108,71,255,0.1)',
                        color: isDone ? 'var(--emerald)' : 'var(--gold)',
                        fontSize: '1.2rem', lineHeight: 1,
                        cursor: isDone ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all var(--transition)',
                      }}
                    >+</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
