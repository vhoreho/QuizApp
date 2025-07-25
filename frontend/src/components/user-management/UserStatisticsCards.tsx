import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonIcon, GearIcon } from "@radix-ui/react-icons";

interface UserStatisticsCardsProps {
  total: number;
}

export function UserStatisticsCards({ total }: UserStatisticsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Всего пользователей
          </CardTitle>
          <PersonIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">
            Активных пользователей в системе
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
