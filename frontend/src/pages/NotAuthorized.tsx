import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldXIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotAuthorized() {
  return (
    <div className="flex h-screen flex-col items-center justify-center ">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <ShieldXIcon className="h-12 w-12 text-destructive mb-2" />
          <CardTitle className="text-2xl font-bold text-destructive">
            Доступ запрещен
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            У вас нет необходимых прав для доступа к запрошенной странице.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link to="/">Вернуться на главную</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
