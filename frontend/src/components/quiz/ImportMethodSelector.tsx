import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileTextIcon,
  UploadIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";

interface ImportMethodSelectorProps {
  onSelectImportFile: () => void;
  onSelectManualCreate: () => void;
  onBack: () => void;
  createdQuizId: number | null;
}

export function ImportMethodSelector({
  onSelectImportFile,
  onSelectManualCreate,
  onBack,
  createdQuizId,
}: ImportMethodSelectorProps) {
  return (
    <Card className="border border-border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 shadow-md hover:shadow-lg transition-all">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
            <MagnifyingGlassIcon className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <CardTitle>Выберите способ добавления вопросов</CardTitle>
            <CardDescription>
              Вы можете импортировать вопросы из файла или создать их вручную
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 shadow hover:shadow-md transition-all cursor-pointer group">
            <Button
              variant="ghost"
              className="h-full w-full flex flex-col items-center justify-center p-6 group-hover:bg-transparent"
              onClick={onSelectImportFile}
            >
              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <UploadIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">
                Импортировать из файла
              </div>
              <div className="text-sm text-blue-600/70 dark:text-blue-400/70">
                Загрузите JSON или CSV файл с готовыми вопросами
              </div>
            </Button>
          </div>

          <div className="border rounded-xl p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 shadow hover:shadow-md transition-all cursor-pointer group">
            <Button
              variant="ghost"
              className="h-full w-full flex flex-col items-center justify-center p-6 group-hover:bg-transparent"
              onClick={onSelectManualCreate}
              disabled={!createdQuizId}
            >
              <div className="bg-amber-100 dark:bg-amber-900 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <FileTextIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-lg font-medium text-amber-700 dark:text-amber-300 mb-2">
                Создать вручную
              </div>
              <div className="text-sm text-amber-600/70 dark:text-amber-400/70">
                Добавьте вопросы один за другим в редакторе
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/10 border-t pt-4 flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-primary/20 hover:bg-primary/5"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Назад
        </Button>
      </CardFooter>
    </Card>
  );
}
