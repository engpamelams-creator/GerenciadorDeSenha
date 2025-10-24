import { Mail, Users, Wifi, Settings } from 'lucide-react';

export type CategoryType = 'email' | 'social' | 'wifi' | 'custom';

interface CategoryNavProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
}

const categories = [
  { id: 'email' as const, label: 'E-mail', icon: Mail },
  { id: 'social' as const, label: 'Rede Social', icon: Users },
  { id: 'wifi' as const, label: 'Wi-Fi', icon: Wifi },
  { id: 'custom' as const, label: 'Outros', icon: Settings },
];

export function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                relative p-6 rounded-lg border transition-all duration-200
                ${
                  isActive
                    ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/50'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }
              `}
            >
              <div className="flex flex-col items-center gap-3">
                <Icon size={32} />
                <span className="font-semibold text-sm">{category.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
