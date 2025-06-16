import { AnimatePresence, motion } from 'framer-motion';
import { CategoryItem } from './CategoryItem';

interface Category {
  name: string;
  value: string;
  count?: number;
  subcategories?: Category[];
}

interface SidebarProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryChange: (category: string, isSelected: boolean) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({
  categories,
  selectedCategories,
  onCategoryChange,
  isOpen,
  onToggle,
}: SidebarProps) => {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <motion.aside
        className={`
          fixed left-0 top-[calc(24px+64px)] bottom-0 w-64
          bg-white border-r border-gray-200
          transform lg:translate-x-0
          transition-transform duration-300 ease-in-out
          z-40 overflow-y-auto
        `}
        initial={false}
        animate={{ translateX: isOpen ? 0 : '-100%' }}
      >
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-semibold">Filters</h2>
            <button
              onClick={onToggle}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-full"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {categories.map((category) => (
              <CategoryItem
                key={category.value}
                category={category}
                isSelected={selectedCategories.includes(category.value)}
                onChange={onCategoryChange}
              />
            ))}
          </div>
        </div>
      </motion.aside>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`
          fixed left-0 top-1/2 -translate-y-1/2
          bg-white shadow-lg rounded-r-lg p-2
          transform transition-transform duration-300
          hover:bg-gray-50 z-40
          ${isOpen ? 'translate-x-64' : 'translate-x-0'}
        `}
      >
        {isOpen ? '←' : '→'}
      </button>
    </>
  );
};

export default Sidebar;
