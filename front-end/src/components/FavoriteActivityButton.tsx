import {
  AddFavoriteActivityMutation,
  AddFavoriteActivityMutationVariables,
  RemoveFavoriteActivityMutation,
  RemoveFavoriteActivityMutationVariables,
} from "@/graphql/generated/types";
import AddFavoriteActivity from "@/graphql/mutations/activity/addFavoriteActivity";
import RemoveFavoriteActivity from "@/graphql/mutations/activity/removeFavoriteActivity";
import { useAuth } from "@/hooks";
import { useMutation } from "@apollo/client";
import { ActionIcon } from "@mantine/core";
import { IconStar } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface FavoriteActivityButtonProps {
  activityId: string;
}

export default function FavoriteActivityButton({
  activityId,
}: FavoriteActivityButtonProps) {
  const { user, setFavoriteActivities } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  useEffect(() => {
    const nextVal = !!user?.favoriteActivities.find((a) => a.id === activityId);
    setIsFavorite(nextVal);
  }, [user]);
  const [addFavoriteActivity] = useMutation<
    AddFavoriteActivityMutation,
    AddFavoriteActivityMutationVariables
  >(AddFavoriteActivity, {
    // refetchQueries: [GetUser],
    update(
      _cache,
      {
        data: {
          addFavoriteActivity: { favoriteActivities },
        },
      },
    ) {
      setFavoriteActivities(favoriteActivities);
    },
  });
  const [removeFavoriteActivity] = useMutation<
    RemoveFavoriteActivityMutation,
    RemoveFavoriteActivityMutationVariables
  >(RemoveFavoriteActivity, {
    // refetchQueries: [GetUser],
    update(
      _cache,
      {
        data: {
          removeFavoriteActivity: { favoriteActivities },
        },
      },
    ) {
      setFavoriteActivities(favoriteActivities);
    },
  });
  const handleChange = (nextState: boolean) => {
    if (nextState) {
      addFavoriteActivity({
        variables: {
          addFavoriteActivityInput: { activityId },
        },
      });
    } else {
      removeFavoriteActivity({
        variables: {
          removeFavoriteActivityInput: { activityId },
        },
      });
    }
  };
  return (
    <ActionIcon
      display={!!user ? "inherit" : "none"}
      onClick={() => handleChange(!isFavorite)}
    >
      <IconStar fill={isFavorite ? "yellow" : "none"} />
    </ActionIcon>
  );
}
