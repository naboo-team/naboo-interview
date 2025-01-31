import { PageTitle } from "@/components";
import { withAuth } from "@/hocs";
import { useAuth } from "@/hooks";
import { Avatar, Box, Flex, Text } from "@mantine/core";
import Head from "next/head";
import { SortableFavoriteActivitiesList } from "@/components/SortableFavoriteActivitiesList";
import {
  GetFavoriteActivitiesQuery,
  GetFavoriteActivitiesQueryVariables,
  ReorderFavoriteActivitiesMutation,
  ReorderFavoriteActivitiesMutationVariables,
} from "@/graphql/generated/types";
import GetFavoriteActivities from "@/graphql/queries/activity/getFavoriteActivities";
import { useMutation, useQuery } from "@apollo/client";
import ReorderFavoriteActivities from "@/graphql/mutations/activity/reorderFavoriteActivities";
import { useEffect } from "react";

const Profile = () => {
  const { user, setFavoriteActivities } = useAuth();

  const { data, refetch } = useQuery<
    GetFavoriteActivitiesQuery,
    GetFavoriteActivitiesQueryVariables
  >(GetFavoriteActivities);
  useEffect(() => {
    refetch();
  }, [user]);

  const [reorderFavoriteActivities] = useMutation<
    ReorderFavoriteActivitiesMutation,
    ReorderFavoriteActivitiesMutationVariables
  >(ReorderFavoriteActivities, {
    refetchQueries: [GetFavoriteActivities],
    update(
      _cache,
      {
        data: {
          reorderFavoriteActivities: { favoriteActivities: activities },
        },
      },
    ) {
      if (!activities) {
        // TODO: error state
        return;
      }
      setFavoriteActivities(activities);
    },
  });

  return (
    <>
      <Head>
        <title>Mon profil | CDTR</title>
      </Head>
      <PageTitle title="Mon profil" />
      <Flex align="center" gap="md">
        <Avatar color="cyan" radius="xl" size="lg">
          {user?.firstName[0]}
          {user?.lastName[0]}
        </Avatar>
        <Flex direction="column">
          <Text>{user?.email}</Text>
          <Text>{user?.firstName}</Text>
          <Text>{user?.lastName}</Text>
        </Flex>
      </Flex>
      <PageTitle title="Mes favoris" />
      <Box h={"500px"} mt="md">
        <SortableFavoriteActivitiesList
          activities={data?.getMe.favoriteActivities || []}
          onChange={(activityIds) =>
            reorderFavoriteActivities({
              variables: { reorderFavoriteActivitiesInput: { activityIds } },
            })
          }
        />
      </Box>
    </>
  );
};

export default withAuth(Profile);
