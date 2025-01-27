import { PageTitle } from '@/components';
import { graphqlClient } from '@/graphql/apollo';
import { withAuth } from '@/hocs';
import { useAuth } from '@/hooks';
import { Avatar, Flex, Text } from '@mantine/core';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

interface ProfileProps {
  favoriteActivities: {
    id: string;
    name: string;
  }[];
}

const Profile = (props: ProfileProps) => {
  const { user } = useAuth();

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
    </>
  );
};

export default withAuth(Profile);
