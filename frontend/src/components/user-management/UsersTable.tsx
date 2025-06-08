import { User, UserRole } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PersonIcon,
  GearIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";

interface UsersTableProps {
  users: User[];
}

export const UsersTable = ({ users }: UsersTableProps) => {
  return (
    <Card className="border border-border bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
      <CardHeader>
        <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <PersonIcon className="h-32 w-32 text-blue-500 rotate-12" />
        </div>
        <CardTitle className="flex items-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <div className="bg-blue-100 p-2 rounded-full mr-2 dark:bg-blue-900">
            <PersonIcon className="h-5 w-5 text-blue-500" />
          </div>
          Пользователи
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <MagnifyingGlassIcon className="h-3.5 w-3.5 text-muted-foreground" />
          Список всех пользователей в системе
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-blue-100 dark:border-blue-800/30">
          <Table>
            <TableHeader className="bg-blue-50/50 dark:bg-blue-950/50">
              <TableRow className="hover:bg-blue-100/50 dark:hover:bg-blue-900/20">
                <TableHead className="text-blue-700 dark:text-blue-300">
                  Имя
                </TableHead>
                <TableHead className="text-blue-700 dark:text-blue-300">
                  Имя пользователя
                </TableHead>
                <TableHead className="text-blue-700 dark:text-blue-300">
                  Роль
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                >
                  <TableCell className="font-medium">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || user.lastName || user.username}
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === UserRole.ADMIN
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                          : user.role === UserRole.TEACHER
                          ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                      }`}
                    >
                      {user.role === UserRole.ADMIN && (
                        <div className="bg-purple-200 dark:bg-purple-800 p-1 rounded-full mr-1.5">
                          <PersonIcon className="h-2 w-2 text-purple-700 dark:text-purple-300" />
                        </div>
                      )}
                      {user.role === UserRole.TEACHER && (
                        <div className="bg-green-200 dark:bg-green-800 p-1 rounded-full mr-1.5">
                          <GearIcon className="h-2 w-2 text-green-700 dark:text-green-300" />
                        </div>
                      )}
                      {user.role === UserRole.STUDENT && (
                        <div className="bg-blue-200 dark:bg-blue-800 p-1 rounded-full mr-1.5">
                          <PersonIcon className="h-2 w-2 text-blue-700 dark:text-blue-300" />
                        </div>
                      )}
                      {user.role === UserRole.ADMIN
                        ? "Администратор"
                        : user.role === UserRole.TEACHER
                        ? "Преподаватель"
                        : "Студент"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <PersonIcon className="h-10 w-10 mb-2 text-muted-foreground/30" />
                      Пользователи не найдены
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="bg-gradient-to-r from-blue-50/50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50 border-t border-blue-100 dark:border-blue-800/30">
        <Button
          variant="outline"
          className="w-full border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
        >
          <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
          Поиск пользователей
        </Button>
      </CardFooter>
    </Card>
  );
};
