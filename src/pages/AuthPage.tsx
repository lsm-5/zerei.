import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers } from "lucide-react";

const AuthPage = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Layers className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-heading">Zerei.</CardTitle>
          </div>
          <CardDescription>Entre ou crie sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary))',
                    brandButtonText: 'white',
                    defaultButtonBackground: 'hsl(var(--secondary))',
                    defaultButtonBackgroundHover: 'hsl(var(--secondary))',
                    defaultButtonBorder: 'hsl(var(--border))',
                    defaultButtonText: 'hsl(var(--foreground))',
                    dividerBackground: 'hsl(var(--border))',
                    inputBackground: 'hsl(var(--background))',
                    inputBorder: 'hsl(var(--border))',
                    inputBorderHover: 'hsl(var(--ring))',
                    inputBorderFocus: 'hsl(var(--ring))',
                    inputText: 'hsl(var(--foreground))',
                    inputLabelText: 'hsl(var(--foreground))',
                    inputPlaceholder: 'hsl(var(--muted-foreground))',
                    messageText: 'hsl(var(--foreground))',
                    messageTextDanger: 'hsl(var(--destructive))',
                    anchorTextColor: 'hsl(var(--primary))',
                    anchorTextHoverColor: 'hsl(var(--primary))',
                  },
                },
              },
            }}
            providers={[]}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Endereço de email',
                  password_label: 'Sua senha',
                  button_label: 'Entrar',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Já tem uma conta? Entre',
                  loading_button_label: 'Entrando...',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Sua senha',
                },
                sign_up: {
                  email_label: 'Endereço de email',
                  password_label: 'Crie uma senha',
                  button_label: 'Cadastrar',
                  social_provider_text: 'Cadastrar com {{provider}}',
                  link_text: 'Não tem uma conta? Cadastre-se',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Sua senha',
                  loading_button_label: 'Cadastrando...',
                },
                forgotten_password: {
                  email_label: 'Endereço de email',
                  button_label: 'Enviar instruções',
                  link_text: 'Esqueceu sua senha?',
                  email_input_placeholder: 'seu@email.com',
                  loading_button_label: 'Enviando instruções para seu email...',
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;