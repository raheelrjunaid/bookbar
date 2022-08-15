export default interface BookProps {
  id: string;
  cover: string;
  title: string;
  authors: string;
  avgRating: number;
  link: string;
  description: string;
  handleRemove?: (id: string) => void;
}
