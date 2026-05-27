export type ItemCategory =
  | "ball"
  | "medicine"
  | "berry"
  | "held-item"
  | "evolution-item"
  | "ingredient"
  | "other";

export interface Item {
  id: string;
  name: string;
  displayName: string;
  category: ItemCategory;
  description: string;
  sprite: string | null;
  droppedBy: string[]; // pokemon IDs
}
