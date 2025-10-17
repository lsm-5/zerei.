import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Layers, ShoppingBag, Star, Users, Activity, ChevronLeft, ChevronRight, X } from 'lucide-react';

const tutorialSteps = [
  {
    title: "Bem-vindo ao Zerei! 🎮",
    description: "Uma plataforma para completar coleções de cards e acompanhar seu progresso. Aqui você pode adquirir coleções, raspar cards e compartilhar suas conquistas com amigos!",
    icon: Layers,
    color: "text-blue-500"
  },
  {
    title: "Loja de Coleções 🏪",
    description: "Navegue pela loja e adquira coleções gratuitas para começar sua jornada. Cada coleção contém vários cards únicos para você completar.",
    icon: ShoppingBag,
    color: "text-green-500"
  },
  {
    title: "Raspe e Complete Cards 🎴",
    description: "Clique em cada card para raspá-lo e marcar como completado. Adicione comentários pessoais e acompanhe seu progresso em tempo real!",
    icon: Star,
    color: "text-yellow-500"
  },
  {
    title: "Convide Amigos 👥",
    description: "Adicione amigos e convide-os para participar das suas coleções. Acompanhem o progresso juntos e vejam quem completa primeiro!",
    icon: Users,
    color: "text-purple-500"
  },
  {
    title: "Acompanhe as Atividades 📰",
    description: "Veja as conquistas suas e dos seus amigos no feed. Curta, comente e comemore juntos cada card completado!",
    icon: Activity,
    color: "text-orange-500"
  }
];

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };
  
  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const skipTutorial = () => {
    completeTutorial();
  };
  
  const completeTutorial = () => {
    localStorage.setItem('zerei_tutorial_completed', 'true');
    onClose();
  };
  
  const step = tutorialSteps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="relative">
          <DialogTitle className="text-center text-xl font-bold">
            Tutorial - Zerei
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              {/* Ícone */}
              <div className="flex justify-center">
                <div className={`p-4 rounded-full bg-gray-100 ${step.color}`}>
                  <Icon className="h-12 w-12" />
                </div>
              </div>
              
              {/* Título */}
              <h3 className="text-lg font-semibold">
                {step.title}
              </h3>
              
              {/* Descrição */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
              
              {/* Indicador de progresso */}
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {currentStep + 1} de {tutorialSteps.length}
                </p>
              </div>
              
              {/* Navegação */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="ghost"
                  onClick={skipTutorial}
                  className="text-sm"
                >
                  Pular Tutorial
                </Button>
                
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={previousStep}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                  )}
                  
                  <Button
                    onClick={nextStep}
                    size="sm"
                  >
                    {currentStep === tutorialSteps.length - 1 ? 'Finalizar' : 'Próximo'}
                    {currentStep < tutorialSteps.length - 1 && (
                      <ChevronRight className="h-4 w-4 ml-1" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

export default TutorialModal;
