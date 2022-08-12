import Marquee from "react-fast-marquee";

interface CollectionCardProps {
  bookCovers: string[];
  title: string;
  author: string;
  profilePic?: string;
  collectionId: string;
  favouritedByUser: boolean;
}

export const CollectionCard = ({
  bookCovers,
  title,
  author,
  profilePic,
  collectionId,
  favouritedByUser,
}: CollectionCardProps) => {
  return (
    <div className="grid grid-rows-2 justify-items-stretch">
      <div></div>
      <div></div>
    </div>
  );
};
