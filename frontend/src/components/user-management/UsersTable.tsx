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
  PersonIcon,
  IdCardIcon,
  AvatarIcon,
  GearIcon,
} from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";

interface UsersTableProps {
  onUserSelect?: (user: User) => void;
}

const ROLE_TRANSLATIONS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Администратор",
  [UserRole.TEACHER]: "Преподаватель",
  [UserRole.STUDENT]: "Студент",
};

const ROLE_COLORS: Record<
  UserRole,
  { bg: string; text: string; border: string }
> = {
  [UserRole.ADMIN]: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/20",
  },
  [UserRole.TEACHER]: {
    bg: "bg-violet-500/10",
    text: "text-violet-500",
    border: "border-violet-500/20",
  },
  [UserRole.STUDENT]: {
    bg: "bg-green-500/10",
    text: "text-green-500",
    border: "border-green-500/20",
  },
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
    return sortOrder === "ASC" ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-500 mb-4">
          <GearIcon className="w-6 h-6" />
        </div>
        <p className="text-sm text-muted-foreground">
          Ошибка загрузки пользователей: {error.message}
        </p>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / 10) : 0;

  const getUserFullName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || "-";
  };

  return (
    <div>
      <div className="relative">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors w-[100px]"
                onClick={() => handleSort("id")}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-blue-500/10">
                    <IdCardIcon className="h-4 w-4 text-blue-500" />
                  </div>
                  ID {renderSortIcon("id")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort("username")}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-violet-500/10">
                    <AvatarIcon className="h-4 w-4 text-violet-500" />
                  </div>
                  Логин {renderSortIcon("username")}
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-green-500/10">
                    <PersonIcon className="h-4 w-4 text-green-500" />
                  </div>
                  Полное имя
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort("role")}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-amber-500/10">
                    <GearIcon className="h-4 w-4 text-amber-500" />
                  </div>
                  Роль {renderSortIcon("role")}
                </div>
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
                      onUserSelect
                        ? "cursor-pointer hover:bg-muted/50 transition-colors"
                        : "hover:bg-muted/50 transition-colors"
                    }
                    onClick={() => onUserSelect?.(user)}
                  >
                    <TableCell className="font-mono text-sm">
                      <span className="text-blue-500">
                        #{user.id.toString().padStart(3, "0")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-violet-500">{user.username}</span>
                    </TableCell>
                    <TableCell>{getUserFullName(user)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${ROLE_COLORS[user.role as UserRole].bg} ${
                          ROLE_COLORS[user.role as UserRole].text
                        } ${ROLE_COLORS[user.role as UserRole].border}`}
                      >
                        {ROLE_TRANSLATIONS[user.role as UserRole]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 py-4 border-t border-border bg-muted/30">
        <div className="text-sm text-muted-foreground">
          {data ? `Всего ${data.total} пользователей` : ""}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="h-8 w-8 p-0 flex items-center justify-center bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20 hover:text-blue-600 disabled:bg-muted disabled:text-muted-foreground"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground">
            Страница {page} из {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
            className="h-8 w-8 p-0 flex items-center justify-center bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20 hover:text-blue-600 disabled:bg-muted disabled:text-muted-foreground"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
