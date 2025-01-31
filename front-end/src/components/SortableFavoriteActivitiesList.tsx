import { List, ThemeIcon } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import { IconGripHorizontal } from "@tabler/icons-react";

export function arrayMove<T>(
  array: T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  const out = [...array];
  const startIndex = fromIndex < 0 ? out.length + fromIndex : fromIndex;

  if (startIndex >= 0 && startIndex < out.length) {
    const endIndex = toIndex < 0 ? out.length + toIndex : toIndex;

    const [item] = out.splice(fromIndex, 1);
    out.splice(endIndex, 0, item);
  }

  return out;
}

const SortableItem = SortableElement<{ item: ActivityItem }>(
  ({ item }: { item: ActivityItem }) => (
    <List.Item>
      {item.name} - {item.id}
    </List.Item>
  ),
);

const SortableList = SortableContainer<{ items: ActivityItem[] }>(
  ({ items }: { items: ActivityItem[] }) => {
    return (
      <List
        mt="md"
        spacing="xs"
        icon={
          <ThemeIcon size={24} color="gray">
            <IconGripHorizontal stroke={2} />
          </ThemeIcon>
        }
      >
        {items.map((item, index) => (
          <SortableItem key={`item-${item.id}`} index={index} item={item} />
        ))}
      </List>
    );
  },
);
type ActivityItem = { id: string; name: string };
interface Props {
  activities: ActivityItem[];
  onChange: (activityIds: string[]) => void;
}

export function SortableFavoriteActivitiesList({
  activities,
  onChange,
}: Props) {
  const [items, setItems] = useState(activities || []);
  useEffect(() => {
    setItems(activities);
  }, [activities]);

  const onSortEnd = ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number;
    newIndex: number;
  }) => {
    const nextOrder = arrayMove(items, oldIndex, newIndex);
    setItems(nextOrder);
    onChange(nextOrder.map(({ id }) => id));
  };

  return <SortableList items={items} onSortEnd={onSortEnd} />;
}
