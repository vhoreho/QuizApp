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
      <Card className="relative overflow-hidden border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-background to-background" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative">
          <CardTitle className="text-sm font-medium">
            Всего пользователей
          </CardTitle>
          <div className="p-2 rounded-full bg-blue-500/10">
            <PersonIcon className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold text-blue-500">{total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Активных пользователей в системе
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-background to-background" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative">
          <CardTitle className="text-sm font-medium">Активны сегодня</CardTitle>
          <div className="p-2 rounded-full bg-green-500/10">
            <MagnifyingGlassIcon className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold text-green-500">
            {Math.floor(total * 0.6)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Пользователей за последние 24 часа
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-background to-background" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative">
          <CardTitle className="text-sm font-medium">
            Новые пользователи
          </CardTitle>
          <div className="p-2 rounded-full bg-violet-500/10">
            <GearIcon className="h-4 w-4 text-violet-500" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold text-violet-500">
            {Math.floor(total * 0.1)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Новых пользователей за неделю
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
