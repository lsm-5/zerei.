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

// Store collections data
export const storeCollections = [
  {
    id: 8,
    title: "Fotografia de Rua",
    subtitle: "Capturando a essência da vida urbana",
    cover: "https://images.pexels.com/photos/161984/street-scene-people-street-scene-161984.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    cards: createCards(streetPhotographyTitles),
    tags: ["Fotografia", "Arte", "Grátis"],
    price: 0,
    likes: 0,
    acquisitions: 0,
    createdAt: daysAgo(0),
  },
  {
    id: 4,
    title: "Top 10 Jogos de Todos os Tempos",
    subtitle: "Uma seleção dos maiores clássicos",
    cover: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    cards: createCards(gameTitles),
    tags: ["Jogos", "Grátis"],
    price: 0,
    likes: 0,
    acquisitions: 0,
    createdAt: daysAgo(3),
  },
  {
    id: 5,
    title: "Clássicos do Cinema",
    subtitle: "Filmes que marcaram gerações",
    cover: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    cards: createCards(movieTitles),
    tags: ["Filmes", "Cultura"],
    price: 9.99,
    likes: 0,
    acquisitions: 0,
    createdAt: daysAgo(10),
  },
  {
    id: 6,
    title: "Maravilhas do Mundo",
    subtitle: "Destinos que você precisa conhecer",
    cover: "https://images.pexels.com/photos/21014/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    cards: createCards(worldWondersTitles),
    tags: ["Viagens", "Aventura", "Grátis"],
    price: 0,
    likes: 0,
    acquisitions: 0,
    createdAt: daysAgo(30),
  },
  {
    id: 7,
    title: "Ficção Científica Essencial",
    subtitle: "Livros que expandiram o universo",
    cover: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    cards: createCards(sciFiBooksTitles),
    tags: ["Livros", "Cultura"],
    price: 14.99,
    likes: 0,
    acquisitions: 0,
    createdAt: daysAgo(1),
  }
];