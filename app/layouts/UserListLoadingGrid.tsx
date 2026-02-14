export default function UserListLoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-xl animate-pulse border bg-white border-gray-200 dark:bg-[#1e1e1e] dark:border-[#333]"
        />
      ))}
    </div>
  );
}
