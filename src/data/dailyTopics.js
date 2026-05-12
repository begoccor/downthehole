const TOPICS = [
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
  'Philosophy', 'Renaissance', 'Viking', 'Weimaraner' ,'Machu Picchu',
  'Coral reef', 'Desperate Housewives','Romeo','Gaia' ,'Stanley Tucci' ,'Biganos' ,'Paris' , 'Montreal' , 'Alchemy',
];

export function getDailyTopic() {
  const start = new Date(new Date().getFullYear(), 0, 0).getTime();
  const day   = Math.floor((Date.now() - start) / 86400000);
  return TOPICS[day % TOPICS.length];
}
