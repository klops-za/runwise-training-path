
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Home, Calendar, BookOpen, User, Menu, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been logged out.",
    });
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/schedule', label: 'Schedule', icon: Calendar },
    { path: '/knowledge', label: 'Knowledge', icon: BookOpen },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const NavContent = () => (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Button
            key={item.path}
            variant={isActive ? "default" : "ghost"}
            className={`w-full justify-start ${
              isActive 
                ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
            onClick={() => {
              navigate(item.path);
              setIsOpen(false);
            }}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        );
      })}
      
      {user && (
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          onClick={() => {
            handleSignOut();
            setIsOpen(false);
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      )}
    </nav>
  );

  return (
    <>
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full"></div>
              <h1 
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent cursor-pointer"
                onClick={() => navigate(user ? '/dashboard' : '/')}
              >
                RunWise
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <ThemeToggle />

              {user && (
                <>
                  {/* Desktop Navigation */}
                  <div className="hidden md:flex items-center space-x-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      
                      return (
                        <Button
                          key={item.path}
                          variant={isActive ? "default" : "ghost"}
                          className={`${
                            isActive 
                              ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white" 
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          }`}
                          onClick={() => navigate(item.path)}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>

                  {/* Mobile Navigation */}
                  <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="md:hidden">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-64">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full"></div>
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                          RunWise
                        </span>
                      </div>
                      <NavContent />
                    </SheetContent>
                  </Sheet>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navigation;
