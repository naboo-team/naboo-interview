import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export const graphqlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri:
      typeof window === 'undefined'
        ? process.env.NEXT_PUBLIC_GRAPH_QL_URL_SERVER
        : process.env.NEXT_PUBLIC_GRAPH_QL_URL,
    credentials: 'include',
  }),
  ssrMode: typeof window === 'undefined',
});
