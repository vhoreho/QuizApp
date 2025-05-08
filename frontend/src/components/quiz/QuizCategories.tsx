import { QuizCategory, QuizCategoryInfo, QUIZ_CATEGORIES } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuizCategoriesProps {
  selectedCategory?: QuizCategory;
  onCategorySelect: (category: QuizCategory) => void;
  className?: string;
}

export function QuizCategories({
  selectedCategory,
  onCategorySelect,
  className,
}: QuizCategoriesProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {QUIZ_CATEGORIES.map((category) => (
        <Card
          key={category.id}
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            selectedCategory === category.id && "border-primary"
          )}
          onClick={() => onCategorySelect(category.id)}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{category.icon}</span>
              <CardTitle className="text-lg">{category.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>{category.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
