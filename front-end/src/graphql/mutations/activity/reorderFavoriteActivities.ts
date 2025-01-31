import gql from "graphql-tag";

const ReorderFavoriteActivities = gql`
  mutation ReorderFavoriteActivities(
    $reorderFavoriteActivitiesInput: ReorderFavoriteActivitiesInput!
  ) {
    reorderFavoriteActivities(
      reorderFavoriteActivitiesInput: $reorderFavoriteActivitiesInput
    ) {
      id
      favoriteActivities {
        id
        name
      }
    }
  }
`;

export default ReorderFavoriteActivities;
