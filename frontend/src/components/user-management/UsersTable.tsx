import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { User, UserRole } from "@/lib/types";
import { useUsers } from "@/hooks/queries/useUsers";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";

interface UsersTableProps {
  onUserSelect?: (user: User) => void;
}

const ROLE_TRANSLATIONS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Администратор",
  [UserRole.TEACHER]: "Преподаватель",
  [UserRole.STUDENT]: "Студент",
};

export function UsersTable({ onUserSelect }: UsersTableProps) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<keyof User>("id");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  const { data, isLoading, error } = useUsers({
    page,
    limit: 10,
    sortBy,
    sortOrder,
  });

  const handleSort = (column: keyof User) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  };

  const renderSortIcon = (column: keyof User) => {
    if (sortBy !== column) return null;
    return sortOrder === "ASC" ? <ChevronUpIcon /> : <ChevronDownIcon />;
  };

  if (error) {
    return <div>Ошибка загрузки пользователей: {error.message}</div>;
  }

  const totalPages = data ? Math.ceil(data.total / 10) : 0;

  const getUserFullName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || "-";
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("id")}
            >
              ID {renderSortIcon("id")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("username")}
            >
              Логин {renderSortIcon("username")}
            </TableHead>
            <TableHead>Полное имя</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("role")}
            >
              Роль {renderSortIcon("role")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                </TableRow>
              ))
            : data?.users.map((user) => (
                <TableRow
                  key={user.id}
                  className={
                    onUserSelect ? "cursor-pointer hover:bg-muted" : ""
                  }
                  onClick={() => onUserSelect?.(user)}
                >
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{getUserFullName(user)}</TableCell>
                  <TableCell>
                    {ROLE_TRANSLATIONS[user.role as UserRole] || user.role}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {data ? `Всего ${data.total} пользователей` : ""}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div className="text-sm">
            Страница {page} из {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
