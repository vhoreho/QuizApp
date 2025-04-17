import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { studentApi } from "@/api/quizApi";

const HomePage = () => {
  const {
    data: quizzes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["quizzes"],
    queryFn: studentApi.getAvailableQuizzes,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p>Загрузка викторин...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-destructive">Ошибка загрузки викторин</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Доступные викторины
        </h1>
        <Link to="/create">
          <Button>Создать викторину</Button>
        </Link>
      </div>

      {quizzes && quizzes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {quiz.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Автор:{" "}
                  {quiz.createdById
                    ? `ID: ${quiz.createdById}`
                    : "Неизвестный пользователь"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to={`/quiz/${quiz.id}`}>
                  <Button>Пройти викторину</Button>
                </Link>
                <Link to={`/results/${quiz.id}`}>
                  <Button variant="outline">Посмотреть результаты</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-muted rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">Викторины не найдены</h3>
          <p className="text-muted-foreground mb-4">
            Начните с создания своей первой викторины!
          </p>
          <Link to="/create">
            <Button>Создать викторину</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;
