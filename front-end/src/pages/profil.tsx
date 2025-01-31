import { PageTitle } from "@/components";
import { graphqlClient } from "@/graphql/apollo";
import { withAuth } from "@/hocs";
import { useAuth } from "@/hooks";
import { Avatar, Box, Flex, Text } from "@mantine/core";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { SortableComponent } from "@/components/Sortable";
import {
  GetFavoriteActivitiesQuery,
  GetFavoriteActivitiesQueryVariables,
  ReorderFavoriteActivitiesMutation,
  ReorderFavoriteActivitiesMutationVariables,
} from "@/graphql/generated/types";
import GetFavoriteActivities from "@/graphql/queries/activity/getFavoriteActivities";
import { useMutation } from "@apollo/client";
import ReorderFavoriteActivities from "@/graphql/mutations/activity/reorderFavoriteActivities";
import { useState } from "react";

interface ProfileProps {
  favoriteActivities: {
    id: string;
    name: string;
  }[];
}

export const getServerSideProps: GetServerSideProps<
  ProfileProps
> = async () => {
  const response = await graphqlClient.query<
    GetFavoriteActivitiesQuery,
    GetFavoriteActivitiesQueryVariables
  >({
    query: GetFavoriteActivities,
  });

  return {
    props: {
      favoriteActivities: response.data.getMe.favoriteActivities.map(
        ({ id, name }) => ({ id, name }),
      ),
    },
  };
};

const Profile = ({ favoriteActivities }: ProfileProps) => {
  const { user, setFavoriteActivities } = useAuth();
  const [activities, setActivities] = useState(favoriteActivities);

  const [reorderFavoriteActivities] = useMutation<
    ReorderFavoriteActivitiesMutation,
    ReorderFavoriteActivitiesMutationVariables
  >(ReorderFavoriteActivities, {
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
      console.log(activities);
      setFavoriteActivities(activities);
      setActivities(activities.map(({ id, name }) => ({ id, name })));
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
        <SortableComponent
          activities={activities}
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
