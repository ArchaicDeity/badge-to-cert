import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, Eye } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, login, isLoading } = useAuth();
  const { toast } = useToast();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Login successful",
        description: "Welcome to First Aid Training System",
      });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid credentials. Try password 'password' or 'admin123'",
        variant: "destructive",
      });
    }
  };

  const quickLogin = (role: 'admin' | 'assessor' | 'viewer') => {
    const credentials = {
      admin: { email: 'admin@sasol.com', password: 'admin123' },
      assessor: { email: 'assessor@sasol.com', password: 'password' },
      viewer: { email: 'viewer@sasol.com', password: 'password' }
    };
    
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">First Aid Training</h1>
          <p className="text-muted-foreground mt-2">SASOL Safety Management System</p>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Access your training dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@sasol.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 space-y-2">
              <p className="text-sm text-muted-foreground text-center">Quick Login (Demo)</p>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => quickLogin('admin')}
                  className="flex items-center gap-1"
                >
                  <Shield className="h-3 w-3" />
                  Admin
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => quickLogin('assessor')}
                  className="flex items-center gap-1"
                >
                  <Users className="h-3 w-3" />
                  Assessor
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => quickLogin('viewer')}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  Viewer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 SASOL Limited. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;