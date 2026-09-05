import { Lang } from './languages';

/**
 * Der zentrale Inhaltsdatensatz.
 *
 * Jeder Eintrag ist ein Begriff mit einer Uebersetzung in allen acht Sprachen.
 * Weil kein Eintrag an eine bestimmte Sprachrichtung gebunden ist, erzeugt die
 * App daraus jede Kombination aus Muttersprache und Lernsprache.
 */

export type TermKind = 'word' | 'phrase';

export type Term = { id: string; unit: string; kind: TermKind } & Record<Lang, string>;

export interface UnitInfo {
  id: string;
  icon: string;
  color: string;
  /** Titel in allen acht Sprachen */
  title: Record<Lang, string>;
}

export const UNITS: UnitInfo[] = [
  {
    id: 'greetings',
    icon: 'hand-wave',
    color: '#58CC02',
    title: {
      de: 'Begrüßung', en: 'Greetings', es: 'Saludos', ro: 'Salutări',
      ru: 'Приветствия', tr: 'Selamlaşma', hu: 'Köszönés', pl: 'Powitania',
    },
  },
  {
    id: 'people',
    icon: 'account-group',
    color: '#1CB0F6',
    title: {
      de: 'Menschen', en: 'People', es: 'Personas', ro: 'Oameni',
      ru: 'Люди', tr: 'İnsanlar', hu: 'Emberek', pl: 'Ludzie',
    },
  },
  {
    id: 'numbers',
    icon: 'numeric',
    color: '#CE82FF',
    title: {
      de: 'Zahlen', en: 'Numbers', es: 'Números', ro: 'Numere',
      ru: 'Числа', tr: 'Sayılar', hu: 'Számok', pl: 'Liczby',
    },
  },
  {
    id: 'family',
    icon: 'home-heart',
    color: '#FF9600',
    title: {
      de: 'Familie', en: 'Family', es: 'Familia', ro: 'Familie',
      ru: 'Семья', tr: 'Aile', hu: 'Család', pl: 'Rodzina',
    },
  },
  {
    id: 'food',
    icon: 'food-apple',
    color: '#FF4B4B',
    title: {
      de: 'Essen', en: 'Food', es: 'Comida', ro: 'Mâncare',
      ru: 'Еда', tr: 'Yemek', hu: 'Étel', pl: 'Jedzenie',
    },
  },
  {
    id: 'colors',
    icon: 'palette',
    color: '#2EC4B6',
    title: {
      de: 'Farben', en: 'Colors', es: 'Colores', ro: 'Culori',
      ru: 'Цвета', tr: 'Renkler', hu: 'Színek', pl: 'Kolory',
    },
  },
  {
    id: 'animals',
    icon: 'paw',
    color: '#8B5CF6',
    title: {
      de: 'Tiere', en: 'Animals', es: 'Animales', ro: 'Animale',
      ru: 'Животные', tr: 'Hayvanlar', hu: 'Állatok', pl: 'Zwierzęta',
    },
  },
  {
    id: 'home',
    icon: 'sofa',
    color: '#F59E0B',
    title: {
      de: 'Zuhause', en: 'Home', es: 'Casa', ro: 'Acasă',
      ru: 'Дом', tr: 'Ev', hu: 'Otthon', pl: 'Dom',
    },
  },
  {
    id: 'time',
    icon: 'clock-outline',
    color: '#0EA5E9',
    title: {
      de: 'Zeit', en: 'Time', es: 'Tiempo', ro: 'Timp',
      ru: 'Время', tr: 'Zaman', hu: 'Idő', pl: 'Czas',
    },
  },
  {
    id: 'travel',
    icon: 'airplane',
    color: '#EC4899',
    title: {
      de: 'Reisen', en: 'Travel', es: 'Viajes', ro: 'Călătorii',
      ru: 'Путешествия', tr: 'Seyahat', hu: 'Utazás', pl: 'Podróże',
    },
  },
  {
    id: 'verbs',
    icon: 'run-fast',
    color: '#10B981',
    title: {
      de: 'Verben', en: 'Verbs', es: 'Verbos', ro: 'Verbe',
      ru: 'Глаголы', tr: 'Fiiller', hu: 'Igék', pl: 'Czasowniki',
    },
  },
  {
    id: 'phrases',
    icon: 'comment-text-outline',
    color: '#6366F1',
    title: {
      de: 'Sätze', en: 'Phrases', es: 'Frases', ro: 'Propoziții',
      ru: 'Фразы', tr: 'Cümleler', hu: 'Mondatok', pl: 'Zdania',
    },
  },
];

const w = (id: string, unit: string, de: string, en: string, es: string, ro: string, ru: string, tr: string, hu: string, pl: string): Term =>
  ({ id, unit, kind: 'word', de, en, es, ro, ru, tr, hu, pl });

const p = (id: string, unit: string, de: string, en: string, es: string, ro: string, ru: string, tr: string, hu: string, pl: string): Term =>
  ({ id, unit, kind: 'phrase', de, en, es, ro, ru, tr, hu, pl });

export const TERMS: Term[] = [
  // ---------- Begrüßung ----------
  w('hello', 'greetings', 'Hallo', 'Hello', 'Hola', 'Bună', 'Привет', 'Merhaba', 'Szia', 'Cześć'),
  w('good_morning', 'greetings', 'Guten Morgen', 'Good morning', 'Buenos días', 'Bună dimineața', 'Доброе утро', 'Günaydın', 'Jó reggelt', 'Dzień dobry'),
  w('good_evening', 'greetings', 'Guten Abend', 'Good evening', 'Buenas noches', 'Bună seara', 'Добрый вечер', 'İyi akşamlar', 'Jó estét', 'Dobry wieczór'),
  w('goodbye', 'greetings', 'Auf Wiedersehen', 'Goodbye', 'Adiós', 'La revedere', 'До свидания', 'Hoşça kal', 'Viszontlátásra', 'Do widzenia'),
  w('thanks', 'greetings', 'Danke', 'Thank you', 'Gracias', 'Mulțumesc', 'Спасибо', 'Teşekkürler', 'Köszönöm', 'Dziękuję'),
  w('please', 'greetings', 'Bitte', 'Please', 'Por favor', 'Te rog', 'Пожалуйста', 'Lütfen', 'Kérem', 'Proszę'),
  w('yes', 'greetings', 'Ja', 'Yes', 'Sí', 'Da', 'Да', 'Evet', 'Igen', 'Tak'),
  w('no', 'greetings', 'Nein', 'No', 'No', 'Nu', 'Нет', 'Hayır', 'Nem', 'Nie'),
  w('excuse_me', 'greetings', 'Entschuldigung', 'Excuse me', 'Perdón', 'Scuze', 'Извините', 'Affedersiniz', 'Elnézést', 'Przepraszam'),
  w('welcome', 'greetings', 'Willkommen', 'Welcome', 'Bienvenido', 'Bine ai venit', 'Добро пожаловать', 'Hoş geldiniz', 'Üdvözöllek', 'Witamy'),
  w('see_you', 'greetings', 'Bis später', 'See you later', 'Hasta luego', 'Pe curând', 'До скорого', 'Görüşürüz', 'Viszlát később', 'Do zobaczenia'),
  w('how_are_you', 'greetings', 'Wie geht es dir?', 'How are you?', '¿Cómo estás?', 'Ce mai faci?', 'Как дела?', 'Nasılsın?', 'Hogy vagy?', 'Jak się masz?'),

  // ---------- Menschen ----------
  w('i', 'people', 'ich', 'I', 'yo', 'eu', 'я', 'ben', 'én', 'ja'),
  w('you', 'people', 'du', 'you', 'tú', 'tu', 'ты', 'sen', 'te', 'ty'),
  w('we', 'people', 'wir', 'we', 'nosotros', 'noi', 'мы', 'biz', 'mi', 'my'),
  w('they', 'people', 'sie', 'they', 'ellos', 'ei', 'они', 'onlar', 'ők', 'oni'),
  w('man', 'people', 'der Mann', 'the man', 'el hombre', 'bărbatul', 'мужчина', 'adam', 'a férfi', 'mężczyzna'),
  w('woman', 'people', 'die Frau', 'the woman', 'la mujer', 'femeia', 'женщина', 'kadın', 'a nő', 'kobieta'),
  w('child', 'people', 'das Kind', 'the child', 'el niño', 'copilul', 'ребёнок', 'çocuk', 'a gyerek', 'dziecko'),
  w('boy', 'people', 'der Junge', 'the boy', 'el chico', 'băiatul', 'мальчик', 'oğlan', 'a kisfiú', 'chłopiec'),
  w('girl', 'people', 'das Mädchen', 'the girl', 'la chica', 'fata', 'девочка', 'kız', 'a kislány', 'dziewczyna'),
  w('friend', 'people', 'der Freund', 'the friend', 'el amigo', 'prietenul', 'друг', 'arkadaş', 'a barát', 'przyjaciel'),
  w('teacher', 'people', 'der Lehrer', 'the teacher', 'el profesor', 'profesorul', 'учитель', 'öğretmen', 'a tanár', 'nauczyciel'),
  w('student', 'people', 'der Student', 'the student', 'el estudiante', 'studentul', 'студент', 'öğrenci', 'a diák', 'student'),

  // ---------- Zahlen ----------
  w('one', 'numbers', 'eins', 'one', 'uno', 'unu', 'один', 'bir', 'egy', 'jeden'),
  w('two', 'numbers', 'zwei', 'two', 'dos', 'doi', 'два', 'iki', 'kettő', 'dwa'),
  w('three', 'numbers', 'drei', 'three', 'tres', 'trei', 'три', 'üç', 'három', 'trzy'),
  w('four', 'numbers', 'vier', 'four', 'cuatro', 'patru', 'четыре', 'dört', 'négy', 'cztery'),
  w('five', 'numbers', 'fünf', 'five', 'cinco', 'cinci', 'пять', 'beş', 'öt', 'pięć'),
  w('six', 'numbers', 'sechs', 'six', 'seis', 'șase', 'шесть', 'altı', 'hat', 'sześć'),
  w('seven', 'numbers', 'sieben', 'seven', 'siete', 'șapte', 'семь', 'yedi', 'hét', 'siedem'),
  w('eight', 'numbers', 'acht', 'eight', 'ocho', 'opt', 'восемь', 'sekiz', 'nyolc', 'osiem'),
  w('nine', 'numbers', 'neun', 'nine', 'nueve', 'nouă', 'девять', 'dokuz', 'kilenc', 'dziewięć'),
  w('ten', 'numbers', 'zehn', 'ten', 'diez', 'zece', 'десять', 'on', 'tíz', 'dziesięć'),
  w('twenty', 'numbers', 'zwanzig', 'twenty', 'veinte', 'douăzeci', 'двадцать', 'yirmi', 'húsz', 'dwadzieścia'),
  w('hundred', 'numbers', 'hundert', 'hundred', 'cien', 'o sută', 'сто', 'yüz', 'száz', 'sto'),

  // ---------- Familie ----------
  w('mother', 'family', 'die Mutter', 'the mother', 'la madre', 'mama', 'мама', 'anne', 'az anya', 'matka'),
  w('father', 'family', 'der Vater', 'the father', 'el padre', 'tata', 'папа', 'baba', 'az apa', 'ojciec'),
  w('brother', 'family', 'der Bruder', 'the brother', 'el hermano', 'fratele', 'брат', 'erkek kardeş', 'a fiútestvér', 'brat'),
  w('sister', 'family', 'die Schwester', 'the sister', 'la hermana', 'sora', 'сестра', 'kız kardeş', 'a lánytestvér', 'siostra'),
  w('son', 'family', 'der Sohn', 'the son', 'el hijo', 'fiul', 'сын', 'oğul', 'a fiú', 'syn'),
  w('daughter', 'family', 'die Tochter', 'the daughter', 'la hija', 'fiica', 'дочь', 'kız evlat', 'a lány', 'córka'),
  w('grandmother', 'family', 'die Großmutter', 'the grandmother', 'la abuela', 'bunica', 'бабушка', 'büyükanne', 'a nagymama', 'babcia'),
  w('grandfather', 'family', 'der Großvater', 'the grandfather', 'el abuelo', 'bunicul', 'дедушка', 'büyükbaba', 'a nagypapa', 'dziadek'),
  w('family', 'family', 'die Familie', 'the family', 'la familia', 'familia', 'семья', 'aile', 'a család', 'rodzina'),
  w('husband', 'family', 'der Ehemann', 'the husband', 'el marido', 'soțul', 'муж', 'koca', 'a férj', 'mąż'),
  w('wife', 'family', 'die Ehefrau', 'the wife', 'la esposa', 'soția', 'жена', 'eş', 'a feleség', 'żona'),

  // ---------- Essen ----------
  w('water', 'food', 'das Wasser', 'the water', 'el agua', 'apa', 'вода', 'su', 'a víz', 'woda'),
  w('bread', 'food', 'das Brot', 'the bread', 'el pan', 'pâinea', 'хлеб', 'ekmek', 'a kenyér', 'chleb'),
  w('milk', 'food', 'die Milch', 'the milk', 'la leche', 'laptele', 'молоко', 'süt', 'a tej', 'mleko'),
  w('coffee', 'food', 'der Kaffee', 'the coffee', 'el café', 'cafeaua', 'кофе', 'kahve', 'a kávé', 'kawa'),
  w('tea', 'food', 'der Tee', 'the tea', 'el té', 'ceaiul', 'чай', 'çay', 'a tea', 'herbata'),
  w('apple', 'food', 'der Apfel', 'the apple', 'la manzana', 'mărul', 'яблоко', 'elma', 'az alma', 'jabłko'),
  w('cheese', 'food', 'der Käse', 'the cheese', 'el queso', 'brânza', 'сыр', 'peynir', 'a sajt', 'ser'),
  w('meat', 'food', 'das Fleisch', 'the meat', 'la carne', 'carnea', 'мясо', 'et', 'a hús', 'mięso'),
  w('fish', 'food', 'der Fisch', 'the fish', 'el pescado', 'peștele', 'рыба', 'balık', 'a hal', 'ryba'),
  w('rice', 'food', 'der Reis', 'the rice', 'el arroz', 'orezul', 'рис', 'pirinç', 'a rizs', 'ryż'),
  w('egg', 'food', 'das Ei', 'the egg', 'el huevo', 'oul', 'яйцо', 'yumurta', 'a tojás', 'jajko'),
  w('sugar', 'food', 'der Zucker', 'the sugar', 'el azúcar', 'zahărul', 'сахар', 'şeker', 'a cukor', 'cukier'),
  w('salt', 'food', 'das Salz', 'the salt', 'la sal', 'sarea', 'соль', 'tuz', 'a só', 'sól'),
  w('wine', 'food', 'der Wein', 'the wine', 'el vino', 'vinul', 'вино', 'şarap', 'a bor', 'wino'),
  w('soup', 'food', 'die Suppe', 'the soup', 'la sopa', 'supa', 'суп', 'çorba', 'a leves', 'zupa'),

  // ---------- Farben ----------
  w('red', 'colors', 'rot', 'red', 'rojo', 'roșu', 'красный', 'kırmızı', 'piros', 'czerwony'),
  w('blue', 'colors', 'blau', 'blue', 'azul', 'albastru', 'синий', 'mavi', 'kék', 'niebieski'),
  w('green', 'colors', 'grün', 'green', 'verde', 'verde', 'зелёный', 'yeşil', 'zöld', 'zielony'),
  w('yellow', 'colors', 'gelb', 'yellow', 'amarillo', 'galben', 'жёлтый', 'sarı', 'sárga', 'żółty'),
  w('black', 'colors', 'schwarz', 'black', 'negro', 'negru', 'чёрный', 'siyah', 'fekete', 'czarny'),
  w('white', 'colors', 'weiß', 'white', 'blanco', 'alb', 'белый', 'beyaz', 'fehér', 'biały'),
  w('orange', 'colors', 'orange', 'orange', 'naranja', 'portocaliu', 'оранжевый', 'turuncu', 'narancssárga', 'pomarańczowy'),
  w('brown', 'colors', 'braun', 'brown', 'marrón', 'maro', 'коричневый', 'kahverengi', 'barna', 'brązowy'),

  // ---------- Tiere ----------
  w('dog', 'animals', 'der Hund', 'the dog', 'el perro', 'câinele', 'собака', 'köpek', 'a kutya', 'pies'),
  w('cat', 'animals', 'die Katze', 'the cat', 'el gato', 'pisica', 'кошка', 'kedi', 'a macska', 'kot'),
  w('horse', 'animals', 'das Pferd', 'the horse', 'el caballo', 'calul', 'лошадь', 'at', 'a ló', 'koń'),
  w('bird', 'animals', 'der Vogel', 'the bird', 'el pájaro', 'pasărea', 'птица', 'kuş', 'a madár', 'ptak'),
  w('bear', 'animals', 'der Bär', 'the bear', 'el oso', 'ursul', 'медведь', 'ayı', 'a medve', 'niedźwiedź'),
  w('cow', 'animals', 'die Kuh', 'the cow', 'la vaca', 'vaca', 'корова', 'inek', 'a tehén', 'krowa'),

  // ---------- Zuhause ----------
  w('house', 'home', 'das Haus', 'the house', 'la casa', 'casa', 'дом', 'ev', 'a ház', 'dom'),
  w('door', 'home', 'die Tür', 'the door', 'la puerta', 'ușa', 'дверь', 'kapı', 'az ajtó', 'drzwi'),
  w('window', 'home', 'das Fenster', 'the window', 'la ventana', 'fereastra', 'окно', 'pencere', 'az ablak', 'okno'),
  w('table', 'home', 'der Tisch', 'the table', 'la mesa', 'masa', 'стол', 'masa', 'az asztal', 'stół'),
  w('chair', 'home', 'der Stuhl', 'the chair', 'la silla', 'scaunul', 'стул', 'sandalye', 'a szék', 'krzesło'),
  w('bed', 'home', 'das Bett', 'the bed', 'la cama', 'patul', 'кровать', 'yatak', 'az ágy', 'łóżko'),
  w('kitchen', 'home', 'die Küche', 'the kitchen', 'la cocina', 'bucătăria', 'кухня', 'mutfak', 'a konyha', 'kuchnia'),
  w('book', 'home', 'das Buch', 'the book', 'el libro', 'cartea', 'книга', 'kitap', 'a könyv', 'książka'),
  w('key', 'home', 'der Schlüssel', 'the key', 'la llave', 'cheia', 'ключ', 'anahtar', 'a kulcs', 'klucz'),

  // ---------- Zeit ----------
  w('today', 'time', 'heute', 'today', 'hoy', 'azi', 'сегодня', 'bugün', 'ma', 'dziś'),
  w('tomorrow', 'time', 'morgen', 'tomorrow', 'mañana', 'mâine', 'завтра', 'yarın', 'holnap', 'jutro'),
  w('yesterday', 'time', 'gestern', 'yesterday', 'ayer', 'ieri', 'вчера', 'dün', 'tegnap', 'wczoraj'),
  w('now', 'time', 'jetzt', 'now', 'ahora', 'acum', 'сейчас', 'şimdi', 'most', 'teraz'),
  w('day', 'time', 'der Tag', 'the day', 'el día', 'ziua', 'день', 'gün', 'a nap', 'dzień'),
  w('night', 'time', 'die Nacht', 'the night', 'la noche', 'noaptea', 'ночь', 'gece', 'az éjszaka', 'noc'),
  w('week', 'time', 'die Woche', 'the week', 'la semana', 'săptămâna', 'неделя', 'hafta', 'a hét', 'tydzień'),
  w('year', 'time', 'das Jahr', 'the year', 'el año', 'anul', 'год', 'yıl', 'az év', 'rok'),
  w('morning', 'time', 'der Morgen', 'the morning', 'la mañana', 'dimineața', 'утро', 'sabah', 'a reggel', 'rano'),

  // ---------- Reisen ----------
  w('train', 'travel', 'der Zug', 'the train', 'el tren', 'trenul', 'поезд', 'tren', 'a vonat', 'pociąg'),
  w('car', 'travel', 'das Auto', 'the car', 'el coche', 'mașina', 'машина', 'araba', 'az autó', 'samochód'),
  w('airport', 'travel', 'der Flughafen', 'the airport', 'el aeropuerto', 'aeroportul', 'аэропорт', 'havaalanı', 'a repülőtér', 'lotnisko'),
  w('hotel', 'travel', 'das Hotel', 'the hotel', 'el hotel', 'hotelul', 'отель', 'otel', 'a szálloda', 'hotel'),
  w('ticket', 'travel', 'die Fahrkarte', 'the ticket', 'el billete', 'biletul', 'билет', 'bilet', 'a jegy', 'bilet'),
  w('street', 'travel', 'die Straße', 'the street', 'la calle', 'strada', 'улица', 'sokak', 'az utca', 'ulica'),
  w('city', 'travel', 'die Stadt', 'the city', 'la ciudad', 'orașul', 'город', 'şehir', 'a város', 'miasto'),
  w('country', 'travel', 'das Land', 'the country', 'el país', 'țara', 'страна', 'ülke', 'az ország', 'kraj'),
  w('left', 'travel', 'links', 'left', 'izquierda', 'stânga', 'налево', 'sol', 'balra', 'lewo'),
  w('right', 'travel', 'rechts', 'right', 'derecha', 'dreapta', 'направо', 'sağ', 'jobbra', 'prawo'),

  // ---------- Verben ----------
  w('to_eat', 'verbs', 'essen', 'to eat', 'comer', 'a mânca', 'есть', 'yemek', 'enni', 'jeść'),
  w('to_drink', 'verbs', 'trinken', 'to drink', 'beber', 'a bea', 'пить', 'içmek', 'inni', 'pić'),
  w('to_speak', 'verbs', 'sprechen', 'to speak', 'hablar', 'a vorbi', 'говорить', 'konuşmak', 'beszélni', 'mówić'),
  w('to_read', 'verbs', 'lesen', 'to read', 'leer', 'a citi', 'читать', 'okumak', 'olvasni', 'czytać'),
  w('to_write', 'verbs', 'schreiben', 'to write', 'escribir', 'a scrie', 'писать', 'yazmak', 'írni', 'pisać'),
  w('to_learn', 'verbs', 'lernen', 'to learn', 'aprender', 'a învăța', 'учить', 'öğrenmek', 'tanulni', 'uczyć się'),
  w('to_go', 'verbs', 'gehen', 'to go', 'ir', 'a merge', 'идти', 'gitmek', 'menni', 'iść'),
  w('to_sleep', 'verbs', 'schlafen', 'to sleep', 'dormir', 'a dormi', 'спать', 'uyumak', 'aludni', 'spać'),
  w('to_work', 'verbs', 'arbeiten', 'to work', 'trabajar', 'a lucra', 'работать', 'çalışmak', 'dolgozni', 'pracować'),
  w('to_love', 'verbs', 'lieben', 'to love', 'amar', 'a iubi', 'любить', 'sevmek', 'szeretni', 'kochać'),
  w('to_buy', 'verbs', 'kaufen', 'to buy', 'comprar', 'a cumpăra', 'покупать', 'satın almak', 'venni', 'kupować'),
  w('to_see', 'verbs', 'sehen', 'to see', 'ver', 'a vedea', 'видеть', 'görmek', 'látni', 'widzieć'),

  // ---------- Sätze ----------
  p('ph_hungry', 'phrases', 'Ich habe Hunger', 'I am hungry', 'Tengo hambre', 'Mi-e foame', 'Я голоден', 'Açım', 'Éhes vagyok', 'Jestem głodny'),
  p('ph_drink_water', 'phrases', 'Ich trinke Wasser', 'I drink water', 'Bebo agua', 'Beau apă', 'Я пью воду', 'Su içiyorum', 'Vizet iszom', 'Piję wodę'),
  p('ph_man_reads', 'phrases', 'Der Mann liest ein Buch', 'The man reads a book', 'El hombre lee un libro', 'Bărbatul citește o carte', 'Мужчина читает книгу', 'Adam bir kitap okuyor', 'A férfi egy könyvet olvas', 'Mężczyzna czyta książkę'),
  p('ph_where_hotel', 'phrases', 'Wo ist das Hotel?', 'Where is the hotel?', '¿Dónde está el hotel?', 'Unde este hotelul?', 'Где отель?', 'Otel nerede?', 'Hol van a szálloda?', 'Gdzie jest hotel?'),
  p('ph_speak_little', 'phrases', 'Ich spreche ein wenig', 'I speak a little', 'Hablo un poco', 'Vorbesc puțin', 'Я говорю немного', 'Biraz konuşuyorum', 'Egy kicsit beszélek', 'Mówię trochę'),
  p('ph_child_milk', 'phrases', 'Das Kind trinkt Milch', 'The child drinks milk', 'El niño bebe leche', 'Copilul bea lapte', 'Ребёнок пьёт молоко', 'Çocuk süt içiyor', 'A gyerek tejet iszik', 'Dziecko pije mleko'),
  p('ph_how_much', 'phrases', 'Wie viel kostet das?', 'How much does it cost?', '¿Cuánto cuesta?', 'Cât costă?', 'Сколько это стоит?', 'Bu ne kadar?', 'Mennyibe kerül?', 'Ile to kosztuje?'),
  p('ph_want_coffee', 'phrases', 'Ich möchte einen Kaffee', 'I would like a coffee', 'Quisiera un café', 'Aș dori o cafea', 'Я хотел бы кофе', 'Bir kahve istiyorum', 'Kérek egy kávét', 'Poproszę kawę'),
  p('ph_family_big', 'phrases', 'Meine Familie ist groß', 'My family is big', 'Mi familia es grande', 'Familia mea este mare', 'Моя семья большая', 'Ailem büyük', 'A családom nagy', 'Moja rodzina jest duża'),
  p('ph_dont_understand', 'phrases', 'Ich verstehe nicht', 'I do not understand', 'No entiendo', 'Nu înțeleg', 'Я не понимаю', 'Anlamıyorum', 'Nem értem', 'Nie rozumiem'),
  p('ph_house_white', 'phrases', 'Das Haus ist weiß', 'The house is white', 'La casa es blanca', 'Casa este albă', 'Дом белый', 'Ev beyaz', 'A ház fehér', 'Dom jest biały'),
  p('ph_love_you', 'phrases', 'Ich liebe dich', 'I love you', 'Te amo', 'Te iubesc', 'Я люблю тебя', 'Seni seviyorum', 'Szeretlek', 'Kocham cię'),
  p('ph_good_luck', 'phrases', 'Viel Glück', 'Good luck', 'Buena suerte', 'Mult noroc', 'Удачи', 'İyi şanslar', 'Sok szerencsét', 'Powodzenia'),
  p('ph_go_city', 'phrases', 'Wir gehen in die Stadt', 'We go to the city', 'Vamos a la ciudad', 'Mergem în oraș', 'Мы идём в город', 'Şehre gidiyoruz', 'A városba megyünk', 'Idziemy do miasta'),
];

/** Alle Begriffe einer Einheit, in fester Reihenfolge. */
export function termsOfUnit(unitId: string): Term[] {
  return TERMS.filter((term) => term.unit === unitId);
}

export function termById(id: string): Term | undefined {
  return TERMS.find((term) => term.id === id);
}

/** Wie viele Begriffe eine Lektion umfasst. */
export const TERMS_PER_LESSON = 5;
