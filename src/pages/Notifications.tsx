import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, CheckCheck, Bell, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { showSuccess, showError } from '@/utils/toast';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

const NotificationsPage = () => {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  const fetchNotifications = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_notifications', {
        p_user_id: session.user.id,
        p_limit: 100, // Buscar mais notificações na página completa
        p_offset: 0
      });

      if (error) {
        console.error('Error fetching notifications:', error);
        showError('Erro ao carregar notificações');
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error:', error);
      showError('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        showError('Erro ao marcar notificação como lida');
        return;
      }

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error:', error);
      showError('Erro ao marcar notificação como lida');
    }
  };

  const markAllAsRead = async () => {
    if (!session) return;

    setMarkingAsRead(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', session.user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        showError('Erro ao marcar todas as notificações como lidas');
        return;
      }

      // Atualizar estado local
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showSuccess('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Error:', error);
      showError('Erro ao marcar todas as notificações como lidas');
    } finally {
      setMarkingAsRead(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [session]);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando notificações...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Notificações</h1>
              <p className="text-muted-foreground">
                {notifications.length} notificações • {unreadCount} não lidas
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead} 
              disabled={markingAsRead}
              variant="outline"
              size="sm"
            >
              {markingAsRead ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
              ) : (
                <CheckCheck className="h-4 w-4 mr-2" />
              )}
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
              <p className="text-muted-foreground">
                Você não possui notificações no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    !notification.read ? 'border-primary/20 bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-sm truncate">
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <Badge variant="default" className="text-xs">
                              Nova
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {notification.link && (
                          <Button asChild size="sm" variant="outline">
                            <Link to={notification.link}>
                              Ver
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage;
