export type IllustrationName = "cup" | "iced" | "croi" | "cake" | "bean";
export type Category = "Hot" | "Cold" | "Bakery" | "Tea";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  illustration: IllustrationName;
  category: Category;
  rating: number;
  reviews: number;
  minutes: number;
  tint: string;
};

export const menuItems: MenuItem[] = [
  {
    id: "caramel-latte",
    name: "Caramel Latte",
    description: "Espresso, steamed milk, caramel",
    price: 260,
    illustration: "cup",
    category: "Hot",
    rating: 4.8,
    reviews: 126,
    minutes: 5,
    tint: "#ECDCC2",
  },
  {
    id: "iced-americano",
    name: "Iced Americano",
    description: "Double shot over ice",
    price: 190,
    illustration: "iced",
    category: "Cold",
    rating: 4.7,
    reviews: 84,
    minutes: 4,
    tint: "#DFE6D3",
  },
  {
    id: "butter-croissant",
    name: "Butter Croissant",
    description: "Baked fresh every morning",
    price: 150,
    illustration: "croi",
    category: "Bakery",
    rating: 4.9,
    reviews: 210,
    minutes: 3,
    tint: "#DFE6D3",
  },
  {
    id: "choco-cake",
    name: "Choco Cake",
    description: "Dark chocolate, soft sponge",
    price: 280,
    illustration: "cake",
    category: "Bakery",
    rating: 4.6,
    reviews: 58,
    minutes: 3,
    tint: "#ECDCC2",
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    description: "Rich espresso, airy milk foam",
    price: 240,
    illustration: "cup",
    category: "Hot",
    rating: 4.7,
    reviews: 97,
    minutes: 5,
    tint: "#ECDCC2",
  },
  {
    id: "iced-latte",
    name: "Iced Latte",
    description: "Chilled espresso and milk",
    price: 260,
    illustration: "iced",
    category: "Cold",
    rating: 4.8,
    reviews: 143,
    minutes: 4,
    tint: "#DFE6D3",
  },
  {
    id: "espresso",
    name: "Espresso",
    description: "A bold, single origin shot",
    price: 160,
    illustration: "bean",
    category: "Hot",
    rating: 4.5,
    reviews: 64,
    minutes: 2,
    tint: "#ECDCC2",
  },
  {
    id: "green-tea",
    name: "Green Tea",
    description: "Steamed leaves, light and fresh",
    price: 180,
    illustration: "cup",
    category: "Tea",
    rating: 4.4,
    reviews: 39,
    minutes: 3,
    tint: "#DFE6D3",
  },
];

export const categories: Array<Category | "All"> = [
  "All",
  "Hot",
  "Cold",
  "Bakery",
  "Tea",
];

export const cafes = [
  {
    id: "gulshan-2",
    name: "Gulshan 2",
    address: "Road 11 · Open until 11 pm",
    distance: "0.8 km",
    tint: "#F6E8D3",
    selected: true,
  },
  {
    id: "banani",
    name: "Banani",
    address: "Road 27 · Open until 10 pm",
    distance: "2.1 km",
    tint: "#ECDCC2",
    selected: false,
  },
  {
    id: "dhanmondi",
    name: "Dhanmondi",
    address: "Road 8 · Open until 11 pm",
    distance: "4.6 km",
    tint: "#ECDCC2",
    selected: false,
  },
];

export const getItem = (id: string) => menuItems.find((item) => item.id === id);
