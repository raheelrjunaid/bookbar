import { Rating } from "react-simple-star-rating";
import { ComponentProps } from "react";

interface Props extends ComponentProps<typeof Rating> {
  className?: string;
}

export const RatingComp = ({ ratingValue, className, ...props }: Props) => (
  <div className="flex items-start gap-1">
    {ratingValue ? (
      <p className={`font-medium text-yellow-700 mt-1 ${className}`}>
        {ratingValue.toFixed(1)}
      </p>
    ) : null}
    <Rating
      ratingValue={ratingValue * 20}
      allowHalfIcon
      size={20}
      emptyColor="#e6e6e6"
      className="mt-0.5"
      {...props}
    />
  </div>
);

export default RatingComp;
