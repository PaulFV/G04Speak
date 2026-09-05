import { Lang } from './languages';

/**
 * Erfolge. Der Fortschritt wird nicht gespeichert, sondern bei jedem Aufruf
 * aus dem Zustand berechnet - so bleibt er auch nach Aenderungen konsistent.
 */

export interface AchievementSource {
  xp: number;
  streak: number;
  learnedWords: number;
  lessonsCompleted: number;
  level: number;
}

export interface Achievement {
  id: string;
  icon: string;
  color: string;
  target: number;
  value: (s: AchievementSource) => number;
  title: Record<Lang, string>;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    icon: 'shoe-print',
    color: '#58CC02',
    target: 1,
    value: (s) => s.lessonsCompleted,
    title: {
      de: 'Erste Schritte', en: 'First steps', es: 'Primeros pasos', ro: 'Primii pași',
      ru: 'Первые шаги', tr: 'İlk adımlar', hu: 'Első lépések', pl: 'Pierwsze kroki',
    },
  },
  {
    id: 'ten_lessons',
    icon: 'book-open-variant',
    color: '#1CB0F6',
    target: 10,
    value: (s) => s.lessonsCompleted,
    title: {
      de: 'Zehn Lektionen', en: 'Ten lessons', es: 'Diez lecciones', ro: 'Zece lecții',
      ru: 'Десять уроков', tr: 'On ders', hu: 'Tíz lecke', pl: 'Dziesięć lekcji',
    },
  },
  {
    id: 'streak_7',
    icon: 'fire',
    color: '#FF9600',
    target: 7,
    value: (s) => s.streak,
    title: {
      de: 'Eine Woche am Stück', en: 'One week straight', es: 'Una semana seguida', ro: 'O săptămână la rând',
      ru: 'Неделя подряд', tr: 'Bir hafta üst üste', hu: 'Egy hét zsinórban', pl: 'Tydzień z rzędu',
    },
  },
  {
    id: 'streak_30',
    icon: 'calendar-check',
    color: '#EC4899',
    target: 30,
    value: (s) => s.streak,
    title: {
      de: 'Ein Monat am Stück', en: 'One month straight', es: 'Un mes seguido', ro: 'O lună la rând',
      ru: 'Месяц подряд', tr: 'Bir ay üst üste', hu: 'Egy hónap zsinórban', pl: 'Miesiąc z rzędu',
    },
  },
  {
    id: 'xp_500',
    icon: 'lightning-bolt',
    color: '#FFC800',
    target: 500,
    value: (s) => s.xp,
    title: {
      de: '500 XP gesammelt', en: '500 XP earned', es: '500 XP ganados', ro: '500 XP adunate',
      ru: '500 XP набрано', tr: '500 XP kazanıldı', hu: '500 XP összegyűjtve', pl: '500 XP zdobyte',
    },
  },
  {
    id: 'words_50',
    icon: 'text-box-check',
    color: '#CE82FF',
    target: 50,
    value: (s) => s.learnedWords,
    title: {
      de: '50 Wörter gelernt', en: '50 words learned', es: '50 palabras aprendidas', ro: '50 de cuvinte învățate',
      ru: '50 слов выучено', tr: '50 kelime öğrenildi', hu: '50 szó megtanulva', pl: '50 słów nauczonych',
    },
  },
  {
    id: 'level_5',
    icon: 'star-circle',
    color: '#10B981',
    target: 5,
    value: (s) => s.level,
    title: {
      de: 'Level 5 erreicht', en: 'Reached level 5', es: 'Nivel 5 alcanzado', ro: 'Nivelul 5 atins',
      ru: 'Достигнут 5 уровень', tr: '5. seviyeye ulaşıldı', hu: 'Elérted az 5. szintet', pl: 'Osiągnięty poziom 5',
    },
  },
  {
    id: 'scholar',
    icon: 'school',
    color: '#6366F1',
    target: 40,
    value: (s) => s.lessonsCompleted,
    title: {
      de: 'Gelehrter', en: 'Scholar', es: 'Erudito', ro: 'Cărturar',
      ru: 'Знаток', tr: 'Bilgin', hu: 'Tudós', pl: 'Uczony',
    },
  },
];
