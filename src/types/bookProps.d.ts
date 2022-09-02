export default interface BookProps {
  id: string;
  title: string;
  cover_key?: string;
  author?: string;
  subtitle?: string;
  handleRemove?: (id: string) => void;
}
