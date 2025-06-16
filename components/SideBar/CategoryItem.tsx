interface CategoryItemProps {
  category: { name: string; value: string };
  isSelected: boolean;
  onChange: (category: string, isSelected: boolean) => void;
}

export const CategoryItem = ({ category, isSelected, onChange }: CategoryItemProps) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={category.value}
        checked={isSelected}
        onChange={(e) => onChange(category.value, e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary transition-colors duration-200"
      />
      <label htmlFor={category.value} className="text-sm font-light text-gray-700">
        {category.name || "Unknown Category"}
      </label>
    </div>
  );
};
