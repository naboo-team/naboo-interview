import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export const graphqlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri:
      typeof window === 'undefined'
        ? process.env.GRAPH_QL_URL_SERVER
        : process.env.GRAPH_QL_URL,
    credentials: 'include',
  }),
  ssrMode: typeof window === 'undefined',
});
