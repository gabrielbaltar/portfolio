import type { ContentListItem } from "@portfolio/core";

export type ListItemPath = number[];

export function createEmptyListItem(): ContentListItem {
  return {
    text: "",
    children: [],
  };
}

function cloneListItems(items: ContentListItem[]): ContentListItem[] {
  return items.map((item) => ({
    ...item,
    children: cloneListItems(item.children ?? []),
  }));
}

function getChildListAtPath(items: ContentListItem[], path: ListItemPath) {
  let current = items;

  for (const index of path) {
    const currentItem = current[index];
    if (!currentItem) return current;
    currentItem.children = [...(currentItem.children ?? [])];
    current = currentItem.children;
  }

  return current;
}

function getItemAtPath(items: ContentListItem[], path: ListItemPath) {
  if (path.length === 0) return null;
  const siblings = getChildListAtPath(items, path.slice(0, -1));
  return siblings[path[path.length - 1]] ?? null;
}

export function updateListItemText(items: ContentListItem[], path: ListItemPath, text: string) {
  const nextItems = cloneListItems(items);
  const item = getItemAtPath(nextItems, path);
  if (!item) return items;
  item.text = text;
  return nextItems;
}

export function insertSiblingListItem(items: ContentListItem[], path: ListItemPath) {
  const nextItems = cloneListItems(items);
  const siblings = getChildListAtPath(nextItems, path.slice(0, -1));
  siblings.splice(path[path.length - 1] + 1, 0, createEmptyListItem());
  return nextItems;
}

export function appendChildListItem(items: ContentListItem[], path: ListItemPath) {
  const nextItems = cloneListItems(items);
  const item = getItemAtPath(nextItems, path);
  if (!item) return items;
  item.children = [...(item.children ?? []), createEmptyListItem()];
  return nextItems;
}

export function removeListItem(items: ContentListItem[], path: ListItemPath) {
  const nextItems = cloneListItems(items);
  const siblings = getChildListAtPath(nextItems, path.slice(0, -1));
  siblings.splice(path[path.length - 1], 1);
  return nextItems;
}

export function outdentListItem(items: ContentListItem[], path: ListItemPath) {
  if (path.length < 2) return items;

  const nextItems = cloneListItems(items);
  const parentPath = path.slice(0, -1);
  const grandParentPath = path.slice(0, -2);
  const parentIndex = path[path.length - 2];
  const itemIndex = path[path.length - 1];

  const currentSiblings = getChildListAtPath(nextItems, parentPath);
  const [movedItem] = currentSiblings.splice(itemIndex, 1);
  if (!movedItem) return items;

  const parentSiblings = getChildListAtPath(nextItems, grandParentPath);
  parentSiblings.splice(parentIndex + 1, 0, movedItem);

  return nextItems;
}

export function countListItems(items: ContentListItem[]): number {
  return items.reduce((total, item) => total + 1 + countListItems(item.children ?? []), 0);
}
