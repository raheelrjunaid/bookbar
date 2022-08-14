import { Rating } from "react-simple-star-rating";

export const RatingComp = ({ ratingValue }: { ratingValue: number }) => (
  <div className="flex items-start gap-1">
    <p className="font-medium text-yellow-700 mt-1">{ratingValue}</p>
    <Rating
      ratingValue={ratingValue}
      allowHalfIcon
      readonly
      size={20}
      emptyColor="#e6e6e6"
      className="mt-0.5"
    />
  </div>
);

export default RatingComp;
