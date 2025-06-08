import { User, UserRole } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PersonIcon,
  GearIcon,
  CheckCircledIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";

interface UserStatisticsCardsProps {
  users: User[];
}

export const UserStatisticsCards = ({ users }: UserStatisticsCardsProps) => {
  // Расчет пользователей по ролям
  const userCountByRole = {
    admin: users.filter((user) => user.role === UserRole.ADMIN).length,
    teacher: users.filter((user) => user.role === UserRole.TEACHER).length,
    student: users.filter((user) => user.role === UserRole.STUDENT).length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="border border-border bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
        <CardHeader className="py-4 pb-0 relative">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <PersonIcon className="h-24 w-24 text-indigo-500 rotate-12" />
          </div>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-1 rounded-full">
              <PersonIcon className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            Всего пользователей
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 pb-4">
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
            {users.length}
          </div>
          <div className="flex gap-2 mt-2">
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
            >
              {userCountByRole.admin} администраторов
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
        <CardHeader className="py-4 pb-0 relative">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <GearIcon className="h-24 w-24 text-green-500 rotate-12" />
          </div>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full">
              <GearIcon className="h-3.5 w-3.5 text-green-500" />
            </div>
            Преподаватели
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 pb-4">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
            {userCountByRole.teacher}
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center">
            <CheckCircledIcon className="h-3 w-3 mr-1 text-green-500" />
            <span>Создатели тестов и заданий</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
        <CardHeader className="py-4 pb-0 relative">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <PersonIcon className="h-24 w-24 text-blue-500 rotate-12" />
          </div>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full">
              <PersonIcon className="h-3.5 w-3.5 text-blue-500" />
            </div>
            Студенты
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 pb-4">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
            {userCountByRole.student}
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center">
            <MagnifyingGlassIcon className="h-3 w-3 mr-1 text-blue-500" />
            <span>Проходят тестирование</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
