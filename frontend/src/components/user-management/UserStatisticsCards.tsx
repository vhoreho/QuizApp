import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PersonIcon,
  GearIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";

interface UserStatisticsCardsProps {
  total: number;
}

export function UserStatisticsCards({ total }: UserStatisticsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-gradient-to-br from-background to-muted">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            Всего пользователей
          </CardTitle>
          <PersonIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Активных пользователей в системе
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-background to-muted">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Активны сегодня</CardTitle>
          <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.floor(total * 0.6)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Пользователей за последние 24 часа
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-background to-muted">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            Новые пользователи
          </CardTitle>
          <GearIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.floor(total * 0.1)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Новых пользователей за неделю
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
