import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { getTodayKey } from '../utils/dateUtils'

// ─── Authentic adhkar from Hisn al-Muslim (حصن المسلم) ───────────────────────
// Source: Dr. Sa'id ibn Ali al-Qahtani — based on Sahih hadiths

const MORNING_ADHKAR = [
  {
    id: 'm0',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    name: { en: 'Ayat al-Kursi', ar: 'آية الكرسي' },
    count: 1,
    source: 'البقرة: ٢٥٥',
    virtue: { en: 'Whoever recites it in the morning is protected from jinn until evening', ar: 'من قرأها حين يصبح أُجير من الجن حتى يمسي' },
  },
  {
    id: 'm1',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    name: { en: 'Surat Al-Ikhlas', ar: 'سورة الإخلاص' },
    count: 3,
    source: 'القرآن الكريم',
    virtue: { en: 'Equivalent to reciting a third of the Quran', ar: 'تعدل ثلث القرآن' },
  },
  {
    id: 'm2',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    name: { en: 'Surat Al-Falaq', ar: 'سورة الفلق' },
    count: 3,
    source: 'القرآن الكريم',
    virtue: { en: 'Sufficient protection against all harm', ar: 'كافية من كل شر' },
  },
  {
    id: 'm3',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    name: { en: 'Surat An-Nas', ar: 'سورة الناس' },
    count: 3,
    source: 'القرآن الكريم',
    virtue: { en: 'Sufficient protection against all harm', ar: 'كافية من كل شر' },
  },
  {
    id: 'm4',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
    name: { en: 'Morning Declaration', ar: 'دعاء الصباح' },
    count: 1,
    source: 'مسلم (٢٧٢٣)',
    virtue: { en: 'A comprehensive morning supplication', ar: 'من أذكار الصباح الجامعة' },
  },
  {
    id: 'm5',
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    name: { en: 'Morning Beginning', ar: 'افتتاح الصباح' },
    count: 1,
    source: 'أبو داود (٥٠٦٨)، الترمذي (٣٣٩١)',
    virtue: { en: 'Affirming complete dependence on Allah', ar: 'إقرار بالتوكل على الله' },
  },
  {
    id: 'm6',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    name: { en: 'Sayyid al-Istighfar', ar: 'سيد الاستغفار' },
    count: 1,
    source: 'البخاري (٦٣٠٦)',
    virtue: { en: 'Whoever says it with certainty in the morning and dies that day enters Paradise', ar: 'من قالها موقناً فمات من يومه دخل الجنة' },
  },
  {
    id: 'm7',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    name: { en: 'Tahlil', ar: 'التهليل' },
    count: 10,
    source: 'النسائي (٣/٢٤٨)، الطبراني',
    virtue: { en: '10× morning/evening = reward of freeing 4 slaves, 100 good deeds, 100 sins erased', ar: '١٠ مرات صباحاً ومساءً = أجر عتق ٤ رقاب وكتب له ١٠٠ حسنة' },
  },
  {
    id: 'm8',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ',
    name: { en: 'Protection', ar: 'ذكر الحماية' },
    count: 3,
    source: 'أبو داود (٥٠٨٨)، الترمذي (٣٣٨٨)',
    virtue: { en: 'Nothing will harm him', ar: 'لم يضره شيء' },
  },
  {
    id: 'm9',
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    name: { en: 'Contentment with Allah', ar: 'الرضا بالله' },
    count: 3,
    source: 'أبو داود (٥٠٧٢)، الترمذي (٣٣٨٩)',
    virtue: { en: 'Allah will please him on the Day of Judgement', ar: 'كان حقاً على الله أن يُرضيه يوم القيامة' },
  },
  {
    id: 'm10',
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    name: { en: 'Du\'a for Well-being', ar: 'دعاء العافية' },
    count: 3,
    source: 'أبو داود (٥٠٩٠)',
    virtue: { en: 'Supplication for health of body, hearing, and sight', ar: 'دعاء للعافية في البدن والسمع والبصر' },
  },
  {
    id: 'm11',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    name: { en: 'Tasbih', ar: 'التسبيح' },
    count: 100,
    source: 'مسلم (٢٦٩١)',
    virtue: { en: 'Sins forgiven even if they are like sea foam', ar: 'حُطَّت خطاياه وإن كانت مثل زبد البحر' },
  },
]

const EVENING_ADHKAR = [
  {
    id: 'e0',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    name: { en: 'Ayat al-Kursi', ar: 'آية الكرسي' },
    count: 1,
    source: 'البقرة: ٢٥٥',
    virtue: { en: 'Whoever recites it in the evening is protected from jinn until morning', ar: 'من قرأها حين يمسي أُجير من الجن حتى يصبح' },
  },
  {
    id: 'e1',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    name: { en: 'Surat Al-Ikhlas', ar: 'سورة الإخلاص' },
    count: 3,
    source: 'القرآن الكريم',
    virtue: { en: 'Equivalent to reciting a third of the Quran', ar: 'تعدل ثلث القرآن' },
  },
  {
    id: 'e2',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    name: { en: 'Surat Al-Falaq', ar: 'سورة الفلق' },
    count: 3,
    source: 'القرآن الكريم',
    virtue: { en: 'Sufficient protection against all harm', ar: 'كافية من كل شر' },
  },
  {
    id: 'e3',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    name: { en: 'Surat An-Nas', ar: 'سورة الناس' },
    count: 3,
    source: 'القرآن الكريم',
    virtue: { en: 'Sufficient protection against all harm', ar: 'كافية من كل شر' },
  },
  {
    id: 'e4',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
    name: { en: 'Evening Declaration', ar: 'دعاء المساء' },
    count: 1,
    source: 'مسلم (٢٧٢٣)',
    virtue: { en: 'A comprehensive evening supplication', ar: 'من أذكار المساء الجامعة' },
  },
  {
    id: 'e5',
    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    name: { en: 'Evening Beginning', ar: 'افتتاح المساء' },
    count: 1,
    source: 'أبو داود (٥٠٦٨)، الترمذي (٣٣٩١)',
    virtue: { en: 'Affirming complete dependence on Allah', ar: 'إقرار بالتوكل على الله' },
  },
  {
    id: 'e6',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    name: { en: 'Sayyid al-Istighfar', ar: 'سيد الاستغفار' },
    count: 1,
    source: 'البخاري (٦٣٠٦)',
    virtue: { en: 'Whoever says it with certainty in the evening and dies that night enters Paradise', ar: 'من قالها موقناً فمات من ليلته دخل الجنة' },
  },
  {
    id: 'e7',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    name: { en: 'Tahlil', ar: 'التهليل' },
    count: 10,
    source: 'النسائي (٣/٢٤٨)، الطبراني',
    virtue: { en: '10× morning/evening = reward of freeing 4 slaves, 100 good deeds, 100 sins erased', ar: '١٠ مرات = أجر عتق ٤ رقاب وكُتب له ١٠٠ حسنة ومُحيت ١٠٠ سيئة' },
  },
  {
    id: 'e8',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ',
    name: { en: 'Protection', ar: 'ذكر الحماية' },
    count: 3,
    source: 'أبو داود (٥٠٨٨)، الترمذي (٣٣٨٨)',
    virtue: { en: 'Nothing will harm him', ar: 'لم يضره شيء' },
  },
  {
    id: 'e9',
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    name: { en: 'Du\'a for Well-being', ar: 'دعاء العافية' },
    count: 3,
    source: 'أبو داود (٥٠٩٠)',
    virtue: { en: 'Supplication for health of body, hearing, and sight', ar: 'دعاء للعافية في البدن والسمع والبصر' },
  },
  {
    id: 'e10',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي',
    name: { en: 'Du\'a for Pardon', ar: 'دعاء العفو والعافية' },
    count: 1,
    source: 'أبو داود (٥٠٧٤)، ابن ماجه (٣٨٧١)',
    virtue: { en: 'The Prophet ﷺ never abandoned this supplication', ar: 'كان النبي ﷺ لا يدعها' },
  },
  {
    id: 'e11',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    name: { en: 'Tasbih', ar: 'التسبيح' },
    count: 100,
    source: 'مسلم (٢٦٩١)',
    virtue: { en: 'Sins forgiven even if they are like sea foam', ar: 'حُطَّت خطاياه وإن كانت مثل زبد البحر' },
  },
]

const SETS = {
  morning: MORNING_ADHKAR,
  evening: EVENING_ADHKAR,
}

export default function AdhkarSection() {
  const { language, t } = useApp()
  const { user } = useAuth()
  const isAr = language === 'ar'

  const [tab, setTab]           = useState('morning')
  const [done, setDone]         = useState({})
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid, 'adhkar', getTodayKey()))
      if (snap.exists()) setDone(snap.data())
    }
    load()
  }, [user])

  const toggle = async (id) => {
    const next = { ...done, [id]: !done[id] }
    setDone(next)
    if (user) {
      await setDoc(
        doc(db, 'users', user.uid, 'adhkar', getTodayKey()),
        next,
        { merge: true }
      )
    }
  }

  const list    = SETS[tab]
  const doneCount = list.filter(a => done[a.id]).length

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
          borderBottom: '1px solid var(--border)',
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
            color: doneCount === list.length ? 'var(--emerald)' : 'var(--gold)',
            border: `1px solid ${doneCount === list.length ? 'rgba(74,222,128,0.2)' : 'rgba(212,175,106,0.2)'}`,
            borderRadius: 'var(--radius-full)',
            padding: '0.1rem 0.5rem',
          }}>
            {doneCount}/{list.length}
          </span>
        </div>
        <span style={{
          color: 'var(--text-muted)', fontSize: '0.8rem',
          transition: 'transform 0.2s',
          transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
          display: 'inline-block',
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
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border)',
            }}>
              {['morning', 'evening'].map(t2 => (
                <button
                  key={t2}
                  onClick={(e) => { e.stopPropagation(); setTab(t2) }}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    background: tab === t2 ? 'var(--gold-dim)' : 'transparent',
                    border: 'none',
                    borderBottom: tab === t2 ? '2px solid var(--gold)' : '2px solid transparent',
                    color: tab === t2 ? 'var(--gold)' : 'var(--text-muted)',
                    fontSize: '0.82rem',
                    fontWeight: tab === t2 ? 500 : 400,
                    cursor: 'pointer',
                    transition: 'all var(--transition)',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  }}
                >
                  {t2 === 'morning' ? (isAr ? 'أذكار الصباح ☀️' : '☀️ Morning') : (isAr ? 'أذكار المساء 🌙' : '🌙 Evening')}
                </button>
              ))}
            </div>

            {/* Adhkar list */}
            <div style={{ padding: '0.25rem 0' }}>
              {list.map((adhkar, i) => {
                const isDone = !!done[adhkar.id]
                return (
                  <motion.div
                    key={adhkar.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.875rem',
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid var(--border)',
                      background: isDone ? 'var(--emerald-dim)' : 'transparent',
                      transition: 'background var(--transition)',
                    }}
                  >
                    {/* Number */}
                    <div style={{
                      flexShrink: 0,
                      width: 24, height: 24,
                      borderRadius: '50%',
                      border: `1.5px solid ${isDone ? 'var(--emerald)' : 'var(--border-strong)'}`,
                      background: isDone ? 'var(--emerald-dim)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem',
                      color: isDone ? 'var(--emerald)' : 'var(--text-muted)',
                      fontWeight: 600,
                      marginTop: '0.2rem',
                    }}>
                      {i + 1}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Name + count badge */}
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap',
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
                          background: 'var(--gold-dim)',
                          color: 'var(--gold)',
                          border: '1px solid rgba(212,175,106,0.2)',
                          borderRadius: 'var(--radius-full)',
                          padding: '0.05rem 0.45rem',
                        }}>
                          ×{adhkar.count}
                        </span>
                        <span style={{
                          fontSize: '0.65rem', color: 'var(--text-muted)',
                          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                        }}>
                          {adhkar.source}
                        </span>
                      </div>

                      {/* Arabic text */}
                      <p style={{
                        fontFamily: 'var(--font-arabic)',
                        fontSize: '1.1rem',
                        lineHeight: 2,
                        color: isDone ? 'var(--emerald)' : 'var(--text-primary)',
                        direction: 'rtl',
                        textAlign: 'right',
                        margin: '0 0 0.5rem',
                        transition: 'color var(--transition)',
                        textDecoration: isDone ? 'none' : 'none',
                        opacity: isDone ? 0.75 : 1,
                      }}>
                        {adhkar.arabic}
                      </p>

                      {/* Virtue */}
                      <p style={{
                        fontSize: '0.72rem',
                        color: 'var(--gold)',
                        fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                        direction: isAr ? 'rtl' : 'ltr',
                        margin: 0,
                        opacity: 0.85,
                      }}>
                        ✦ {adhkar.virtue[language] || adhkar.virtue.en}
                      </p>
                    </div>

                    {/* Checkmark button */}
                    <button
                      onClick={() => toggle(adhkar.id)}
                      title={isDone ? (isAr ? 'إلغاء' : 'Unmark') : (isAr ? 'تم' : 'Mark done')}
                      style={{
                        flexShrink: 0,
                        width: 32, height: 32,
                        borderRadius: '50%',
                        border: isDone ? '1.5px solid var(--emerald)' : '1.5px solid var(--border-strong)',
                        background: isDone ? 'var(--emerald-dim)' : 'transparent',
                        color: isDone ? 'var(--emerald)' : 'var(--text-muted)',
                        fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all var(--transition)',
                        marginTop: '0.15rem',
                      }}
                      onMouseEnter={e => {
                        if (isDone) {
                          e.currentTarget.style.borderColor = 'var(--ruby)'
                          e.currentTarget.style.color = 'var(--ruby)'
                          e.currentTarget.style.background = 'var(--ruby-dim)'
                        } else {
                          e.currentTarget.style.borderColor = 'var(--emerald)'
                          e.currentTarget.style.color = 'var(--emerald)'
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = isDone ? 'var(--emerald)' : 'var(--border-strong)'
                        e.currentTarget.style.color = isDone ? 'var(--emerald)' : 'var(--text-muted)'
                        e.currentTarget.style.background = isDone ? 'var(--emerald-dim)' : 'transparent'
                      }}
                    >
                      {isDone ? '✓' : '○'}
                    </button>
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
