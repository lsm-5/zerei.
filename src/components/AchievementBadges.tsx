import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Gamepad2, Film, BookOpen, Globe, Award, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  percentage: number;
  timestamp: string;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  totalCount: number;
  tags?: string[];
}

const getIconForTags = (tags: string[] = []) => {
  if (tags.includes("Jogos")) return Gamepad2;
  if (tags.includes("Filmes")) return Film;
  if (tags.includes("Livros")) return BookOpen;
  if (tags.includes("Viagens")) return Globe;
  return Award;
};

const getColorForPercent = (percent: number) => {
  switch (percent) {
    case 100: return "text-amber-500";
    case 75: return "text-amber-500"; // Gold
    case 50: return "text-slate-400"; // Silver
    case 25: return "text-orange-700"; // Bronze
    default: return "text-muted-foreground";
  }
};

const AchievementBadges = ({ achievements, totalCount, tags }: AchievementBadgesProps) => {
  const allPossibleAchievements = [25, 50, 75, 100];
  const earnedPercentages = new Set(achievements.map(a => a.percentage));
  
  // Lógica de conquistas progressivas: se conquistou 50%, automaticamente conquistou 25%
  const actualEarnedPercentages = new Set();
  earnedPercentages.forEach(percentage => {
    actualEarnedPercentages.add(percentage);
    if (percentage >= 50) actualEarnedPercentages.add(25);
    if (percentage >= 75) actualEarnedPercentages.add(50);
    if (percentage >= 100) {
      actualEarnedPercentages.add(25);
      actualEarnedPercentages.add(50);
      actualEarnedPercentages.add(75);
    }
  });
  
  const BaseIcon = getIconForTags(tags);

  if (totalCount === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conquistas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 text-center">
          {allPossibleAchievements.map(percent => {
            const isEarned = actualEarnedPercentages.has(percent);
            const Icon = percent === 100 ? Trophy : BaseIcon;
            const colorClass = isEarned ? getColorForPercent(percent) : "text-muted-foreground opacity-50";
            
            return (
              <TooltipProvider key={percent}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "flex flex-col items-center gap-2 p-2 rounded-md transition-all",
                      colorClass
                    )}>
                      <Icon className="h-8 w-8" />
                      <span className="font-bold text-sm">{percent}%</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isEarned ? (
                      <p>Conquista de {percent}% desbloqueada!</p>
                    ) : (
                      <p>Complete {percent}% da coleção para desbloquear.</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementBadges;