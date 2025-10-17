import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/utils/avatarHelpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { useSettingsStore } from "@/hooks/useSettingsStore";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

const SettingsPage = () => {
  const { session } = useAuth();
  const user = session?.user;
  const { theme, setTheme } = useTheme();
  const { settings, setNotificationSetting } = useSettingsStore();

  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata.name || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user || !name.trim()) {
      showError("O nome não pode estar vazio.");
      return;
    }
    setIsSaving(true);

    // Update both auth user metadata and public profile table
    const { data: authData, error: authError } = await supabase.auth.updateUser({
      data: { name: name.trim() }
    });

    if (authError) {
      showError("Não foi possível atualizar seu nome. Tente novamente.");
      console.error("Auth update error:", authError);
      setIsSaving(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ name: name.trim() })
      .eq('id', user.id);

    if (profileError) {
      showError("Não foi possível atualizar seu perfil público. Tente novamente.");
      console.error("Profile update error:", profileError);
    } else {
      showSuccess("Perfil atualizado com sucesso!");
    }
    
    setIsSaving(false);
  };


  return (
    <Layout>
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            {/* <TabsTrigger value="data">Dados</TabsTrigger> */}
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Perfil Público</CardTitle>
                <CardDescription>Estas informações serão exibidas publicamente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback>{getInitials(name)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email || ''} disabled />
                  </div>
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Gerencie como você recebe notificações.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label htmlFor="store-updates">Atualizações da Loja</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações sobre novas coleções na loja.</p>
                  </div>
                  <Switch id="store-updates" checked={settings.notifications.storeUpdates} onCheckedChange={(checked) => setNotificationSetting('storeUpdates', checked)} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label htmlFor="collection-invites">Convites de Coleção</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações quando um amigo te convidar para uma coleção.</p>
                  </div>
                  <Switch id="collection-invites" checked={settings.notifications.collectionInvites} onCheckedChange={(checked) => setNotificationSetting('collectionInvites', checked)} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label htmlFor="friend-requests">Pedidos de Amizade</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações para novos pedidos de amizade.</p>
                  </div>
                  <Switch id="friend-requests" checked={settings.notifications.friendRequests} onCheckedChange={(checked) => setNotificationSetting('friendRequests', checked)} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label htmlFor="friend-activity">Atividade de Amigos</Label>
                    <p className="text-sm text-muted-foreground">Notificações sobre o que seus amigos estão completando.</p>
                  </div>
                  <Switch id="friend-activity" checked={settings.notifications.friendActivity} onCheckedChange={(checked) => setNotificationSetting('friendActivity', checked)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>Personalize a aparência do aplicativo.</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={theme} onValueChange={setTheme} className="space-y-2">
                  <Label className="flex items-center justify-between p-4 rounded-lg border cursor-pointer">
                    <span>Claro</span>
                    <RadioGroupItem value="light" />
                  </Label>
                  <Label className="flex items-center justify-between p-4 rounded-lg border cursor-pointer">
                    <span>Escuro</span>
                    <RadioGroupItem value="dark" />
                  </Label>
                  <Label className="flex items-center justify-between p-4 rounded-lg border cursor-pointer">
                    <span>Padrão do Sistema</span>
                    <RadioGroupItem value="system" />
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="data" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Dados</CardTitle>
                <CardDescription>Apague sua conta permanentemente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">Apagar Conta</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso irá apagar permanentemente sua conta e remover seus dados de nossos servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive hover:bg-destructive/90">Sim, apagar conta</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;