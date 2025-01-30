import gql from "graphql-tag";

const AddFavoriteActivity = gql`
  mutation addFavoriteActivity(
    $addFavoriteActivityInput: AddFavoriteActivityInput!
  ) {
    addFavoriteActivity(addFavoriteActivityInput: $addFavoriteActivityInput) {
      id
      favoriteActivities {
        id
      }
    }
  }
`;

export default AddFavoriteActivity;
