import gql from "graphql-tag";

const GetUser = gql`
  query GetUser {
    getMe {
      id
      firstName
      lastName
      email
      favoriteActivities {
        id
      }
    }
  }
`;

export default GetUser;
