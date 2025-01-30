import { ActivityFragment } from "@/graphql/generated/types";
import { useGlobalStyles } from "@/utils";
import {
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Image,
  Text,
  ActionIcon,
} from "@mantine/core";
import { IconStar } from "@tabler/icons-react";
import Link from "next/link";

interface ActivityProps {
  activity: ActivityFragment;
  favorite: {
    isVisible: boolean;
    isFavorite: boolean;
    onChange: (activityId: string, nextState: boolean) => Promise<void>;
  };
}

export function Activity({ activity, favorite }: ActivityProps) {
  const { classes } = useGlobalStyles();

  return (
    <Grid.Col span={4}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Image
            src="https://dummyimage.com/480x4:3"
            height={160}
            alt="random image of city"
          />
        </Card.Section>

        <Group position="apart" mt="md" mb="xs">
          <Text weight={500} className={classes.ellipsis}>
            {activity.name}
          </Text>
          <ActionIcon
            display={favorite.isVisible ? "inherit" : "none"}
            onClick={() => favorite.onChange(activity.id, !favorite.isFavorite)}
          >
            <IconStar fill={favorite.isFavorite ? "yellow" : "none"} />
          </ActionIcon>
        </Group>

        <Group mt="md" mb="xs">
          <Badge color="pink" variant="light">
            {activity.city}
          </Badge>
          <Badge color="yellow" variant="light">
            {`${activity.price}€/j`}
          </Badge>
        </Group>

        <Text size="sm" color="dimmed" className={classes.ellipsis}>
          {activity.description}
        </Text>

        <Link href={`/activities/${activity.id}`} className={classes.link}>
          <Button variant="light" color="blue" fullWidth mt="md" radius="md">
            Voir plus
          </Button>
        </Link>
      </Card>
    </Grid.Col>
  );
}
