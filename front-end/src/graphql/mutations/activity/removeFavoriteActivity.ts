import gql from "graphql-tag";

const RemoveFavoriteActivity = gql`
  mutation RemoveFavoriteActivity(
    $removeFavoriteActivityInput: RemoveFavoriteActivityInput!
  ) {
    removeFavoriteActivity(
      removeFavoriteActivityInput: $removeFavoriteActivityInput
    ) {
      id
      favoriteActivities {
        id
      }
    }
  }
`;

export default RemoveFavoriteActivity;
