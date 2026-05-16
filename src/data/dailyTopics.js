const TOPICS = {
  en: [
    'Octopus', 'Black hole', 'Byzantine Empire', 'Jazz', 'DNA',
    'Pompeii', 'Quantum entanglement', 'Cleopatra', 'Fibonacci sequence',
    'Great Barrier Reef', 'Nikola Tesla', 'Bioluminescence', 'Silk Road',
    'Fermentation', 'Aurora borealis', 'Marie Curie', 'Plate tectonics',
    'Salvador Dalí', 'Alan Turing', 'Stonehenge', 'Photosynthesis',
    'Roman Empire', 'Deep sea fish', 'Albert Einstein',
    'Amazon rainforest', 'Morse code', 'Chess', 'Bermuda Triangle',
    'Vincent van Gogh', 'Space exploration', 'Chocolate',
    'Leonardo da Vinci', 'Volcanoes', 'Honey bee', 'Ancient Egypt',
    'Cryptography', 'Dinosaurs', 'Coffee', 'Supernova',
    'Language', 'Pirate', 'Mars', 'The Beatles', 'Gravity',
    'Philosophy', 'Renaissance', 'Viking', 'Weimaraner', 'Machu Picchu',
    'Coral reef', 'Desperate Housewives', 'Romeo', 'Gaia', 'Stanley Tucci',
    'Biganos', 'Paris', 'Montreal', 'Alchemy',
  ],
  fr: [
    'Pieuvre', 'Trou noir', 'Empire byzantin', 'Jazz', 'ADN',
    'Pompéi', 'Intrication quantique', 'Cléopâtre', 'Suite de Fibonacci',
    'Grande Barrière de corail', 'Nikola Tesla', 'Bioluminescence', 'Route de la soie',
    'Fermentation', 'Aurore polaire', 'Marie Curie', 'Tectonique des plaques',
    'Salvador Dalí', 'Alan Turing', 'Stonehenge', 'Photosynthèse',
    'Empire romain', 'Poisson abyssal', 'Albert Einstein',
    'Forêt amazonienne', 'Code Morse', 'Échecs', 'Triangle des Bermudes',
    'Vincent van Gogh', 'Exploration spatiale', 'Chocolat',
    'Léonard de Vinci', 'Volcan', 'Abeille', 'Égypte antique',
    'Cryptographie', 'Dinosaure', 'Café', 'Supernova',
    'Langage', 'Pirate', 'Mars', 'The Beatles', 'Gravité',
    'Philosophie', 'Renaissance', 'Viking', 'Braque de Weimar', 'Machu Picchu',
    'Récif corallien', 'Desperate Housewives', 'Roméo et Juliette', 'Gaïa', 'Stanley Tucci',
    'Biganos', 'Paris', 'Montréal', 'Alchimie',
  ],
  es: [
    'Pulpo', 'Agujero negro', 'Imperio bizantino', 'Jazz', 'ADN',
    'Pompeya', 'Entrelazamiento cuántico', 'Cleopatra', 'Sucesión de Fibonacci',
    'Gran Barrera de Coral', 'Nikola Tesla', 'Bioluminiscencia', 'Ruta de la Seda',
    'Fermentación', 'Aurora boreal', 'Marie Curie', 'Tectónica de placas',
    'Salvador Dalí', 'Alan Turing', 'Stonehenge', 'Fotosíntesis',
    'Imperio romano', 'Pez abisal', 'Albert Einstein',
    'Selva amazónica', 'Código Morse', 'Ajedrez', 'Triángulo de las Bermudas',
    'Vincent van Gogh', 'Exploración espacial', 'Chocolate',
    'Leonardo da Vinci', 'Volcán', 'Abeja melífera', 'Antiguo Egipto',
    'Criptografía', 'Dinosaurio', 'Café', 'Supernova',
    'Lenguaje', 'Piratería', 'Marte', 'The Beatles', 'Gravedad',
    'Filosofía', 'Renacimiento', 'Vikingos', 'Weimaraner', 'Machu Picchu',
    'Arrecife de coral', 'Desperate Housewives', 'Romeo y Julieta', 'Gea', 'Stanley Tucci',
    'Biganos', 'París', 'Montreal', 'Alquimia',
  ],
};

export function getDailyTopic(lang = 'en') {
  const list = TOPICS[lang] ?? TOPICS.en;
  const start = new Date(new Date().getFullYear(), 0, 0).getTime();
  const day   = Math.floor((Date.now() - start) / 86400000);
  return list[day % list.length];
}
