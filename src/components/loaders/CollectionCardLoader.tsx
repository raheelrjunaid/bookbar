export const CollectionCardLoader = () => {
  return (
    <div className="flex flex-col h-40 gap-4 shadow-lg shadow-gray-200">
      <div className="h-20 bg-gray-200" />
      <div className="flex gap-2 animate-pulse px-4">
        <div className="rounded-full h-10 w-10 bg-gray-200" />
        <div className="grow h-5 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
};
