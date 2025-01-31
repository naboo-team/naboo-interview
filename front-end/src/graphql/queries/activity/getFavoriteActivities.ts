import gql from "graphql-tag";

const GetFavoriteActivities = gql`
  query GetFavoriteActivities {
    getMe {
      id
      favoriteActivities {
        id
        name
      }
    }
  }
`;

export default GetFavoriteActivities;
