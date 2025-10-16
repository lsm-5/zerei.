import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { CollectionStoreProvider } from "./contexts/CollectionStoreContext";

import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import FeedPage from "./pages/Feed";
import CollectionsPage from "./pages/Collections";
import CollectionDetailPage from "./pages/CollectionDetail";
import StorePage from "./pages/Store";
import FriendsPage from "./pages/Friends";
import SettingsPage from "./pages/Settings";
import ProfilePage from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CollectionStoreProvider>
              <Routes>
                <Route path="/login" element={<AuthPage />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<FeedPage />} />
                  <Route path="/colecoes" element={<CollectionsPage />} />
                  <Route path="/colecoes/:id" element={<CollectionDetailPage />} />
                  <Route path="/loja" element={<StorePage />} />
                  <Route path="/amigos" element={<FriendsPage />} />
                  <Route path="/config" element={<SettingsPage />} />
                  <Route path="/perfil/:id" element={<ProfilePage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </CollectionStoreProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;