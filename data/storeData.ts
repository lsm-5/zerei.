// Helper function to generate cards with unique images from a placeholder service
const createCards = (titles: string[]) => {
  return titles.map((title, index) => ({
    id: Math.floor(Math.random() * 100000 + index),
    title: title,
    // The seed ensures the image is consistent for the same title
    image: `https://picsum.photos/seed/${title.replace(/\s/g, '')}${index}/400/560`,
  }));
};

// Helper to get a date `days` ago in ISO format
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Titles for each collection
const gameTitles = [
  "The Legend of Zelda: Ocarina of Time", "Super Mario 64", "Chrono Trigger",
  "Final Fantasy VII", "Half-Life 2", "Portal 2", "Red Dead Redemption 2",
  "The Witcher 3: Wild Hunt", "Minecraft", "Tetris"
];

const movieTitles = [
  "The Godfather", "Pulp Fiction", "The Shawshank Redemption", "The Dark Knight",
  "Forrest Gump", "Inception", "The Matrix", "Goodfellas", "Fight Club",
  "Star Wars: Episode V", "Casablanca", "Citizen Kane"
];

const worldWondersTitles = [
  "Grande Muralha da China", "Petra", "Coliseu de Roma", "Chichén Itzá",
  "Machu Picchu", "Cristo Redentor", "Taj Mahal"
];

const sciFiBooksTitles = [
  "Duna", "Fundação", "Neuromancer", "O Guia do Mochileiro das Galáxias",
  "1984", "Admirável Mundo Novo", "Fahrenheit 451", "Eu, Robô",
  "O Jogo do Exterminador", "Snow Crash", "Hyperion", "Ubik",
  "Androides Sonham com Ovelhas Elétricas?", "A Mão Esquerda da Escuridão", "Contato"
];

const streetPhotographyTitles = [
  "O Momento Decisivo", "A Alma de uma Cidade", "Sombras e Luzes", "Reflexos Urbanos",
  "Retratos Anônimos", "Geometria das Ruas", "Cotidiano em Foco", "A Poesia do Acaso"
];

// Store collections data - Only one collection available
export const storeCollections = [
  {
    id: 1,
    title: "Top 10 Jogos de Todos os Tempos",
    subtitle: "Uma seleção dos maiores clássicos",
    cover: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    cards: createCards(gameTitles),
    tags: ["Jogos", "Grátis"],
    price: 0,
    likes: 0,
    acquisitions: 0,
    createdAt: daysAgo(0),
  }
];