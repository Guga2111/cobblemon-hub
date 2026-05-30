export type ItemCategory =
  | "ball"
  | "medicine"
  | "berry"
  | "held-item"
  | "evolution-item"
  | "ingredient"
  | "other";

export type ObtainMethod =
  | "crafting"
  | "brewing_stand"
  | "campfire_pot"
  | "smelting"
  | "stonecutting"
  | "drop"
  | "held"
  | "bag"
  | null;

export interface RecipeIngredient {
  type: "item" | "tag";
  id: string;
}

export interface ItemRecipe {
  type: string;
  ingredients: RecipeIngredient[];
  resultCount: number;
  sourceFile: string;
}

export interface Item {
  id: string;
  name: string;
  displayName: string;
  category: ItemCategory;
  description: string;
  sprite: string | null;
  droppedBy: string[]; // pokemon IDs
  obtainMethod: ObtainMethod;
  recipe: ItemRecipe | null;
  effect: string | null;
  sourceFile?: string;
}
