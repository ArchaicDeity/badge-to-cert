import { useState } from 'react';
import { useAuth } from '@/lib/use-auth';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Users,
  Calendar,
  Upload,
  Download,
  FileText,
  Shield,
  LogOut,
  Plus,
  BarChart3,
  Palette
} from 'lucide-react';
import {
  mockCohorts,
  getCohortEnrollments,
  getEnterpriseById,
  getCoursesForEnterprise,
} from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import useEnterpriseBranding from '@/hooks/use-enterprise-branding';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCohort] = useState(mockCohorts[0]);
  const enterprise = getEnterpriseById(selectedCohort.enterpriseId);
  useEnterpriseBranding(enterprise);
  const courses = getCoursesForEnterprise(selectedCohort.enterpriseId);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const enrollments = getCohortEnrollments(selectedCohort.id);

  const stats = enrollments.reduce(
    (acc, e) => {
      acc.total += 1;
      switch (e.status) {
        case 'NOT_STARTED':
          acc.notStarted += 1;
          break;
        case 'THEORY_PASS':
          acc.theoryPass += 1;
          break;
        case 'PRACTICAL_PASS':
          acc.certified += 1;
          break;
        case 'NYC':
          acc.nyc += 1;
          break;
      }
      return acc;
    },
    { total: 0, notStarted: 0, theoryPass: 0, certified: 0, nyc: 0 }
  );

  const handleUploadRoster = () => {
    toast({
      title: "Feature Demo",
      description: "CSV roster upload would be implemented here",
    });
  };

  const handleCreateCohort = () => {
    toast({
      title: "Feature Demo", 
      description: "Create new cohort form would open here",
    });
  };

  const handleDownloadResults = () => {
    toast({
      title: "Downloading Results",
      description: "CSV and certificate ZIP would be generated here",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {enterprise?.brandLogoPath ? (
              <img
                src={enterprise.brandLogoPath}
                alt={enterprise.name}
                className="h-10 w-10 object-contain rounded-lg"
              />
            ) : (
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold">{enterprise?.name || 'First Aid Training'}</h1>
              <p className="text-sm text-muted-foreground">
                {enterprise?.brandLoginMessage || 'Training Management'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <Badge variant="outline" className="text-xs">
                {user.role}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Quick Actions */}
        {['ADMIN', 'ENTERPRISE'].includes(user.role) && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="border-primary/20 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCreateCohort}>
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Create Cohort</h3>
                <p className="text-sm text-muted-foreground">Set up new training session</p>
              </CardContent>
            </Card>
            
            <Card className="border-warning/20 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleUploadRoster}>
              <CardContent className="p-6 text-center">
                <Upload className="h-8 w-8 text-warning mx-auto mb-2" />
                <h3 className="font-semibold">Upload Roster</h3>
                <p className="text-sm text-muted-foreground">Import learner CSV file</p>
              </CardContent>
            </Card>
            
            <Card className="border-success/20 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleDownloadResults}>
              <CardContent className="p-6 text-center">
                <Download className="h-8 w-8 text-success mx-auto mb-2" />
                <h3 className="font-semibold">Results Pack</h3>
                <p className="text-sm text-muted-foreground">Download CSV + certificates</p>
              </CardContent>
            </Card>
            
            <Card className="border-accent/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-accent mx-auto mb-2" />
                <h3 className="font-semibold">Certificate Register</h3>
                <p className="text-sm text-muted-foreground">Manage issued certificates</p>
              </CardContent>
            </Card>

            <Card
              className="border-secondary/20 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/enterprise/${selectedCohort.enterpriseId}`)}
            >
              <CardContent className="p-6 text-center">
                <Palette className="h-8 w-8 text-secondary mx-auto mb-2" />
                <h3 className="font-semibold">Enterprise Branding</h3>
                <p className="text-sm text-muted-foreground">Logo & colors</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Learners</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">{stats.notStarted}</div>
              <div className="text-sm text-muted-foreground">Not Started</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">{stats.theoryPass}</div>
              <div className="text-sm text-muted-foreground">Theory Pass</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{stats.certified}</div>
              <div className="text-sm text-muted-foreground">Certified</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive">{stats.nyc}</div>
              <div className="text-sm text-muted-foreground">NYC</div>
            </CardContent>
          </Card>
        </div>

        {courses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                {courses.map(c => (
                  <li key={c.id}>{c.title}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Today's Cohort */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today's Cohort - {selectedCohort.venue}
                </CardTitle>
                <CardDescription>
                  {new Date(selectedCohort.date).toLocaleDateString()} • 
                  Instructor: {selectedCohort.instructor} • 
                  Assessor: {selectedCohort.assessor}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`/kiosk/${selectedCohort.id}?t=demo123`, '_blank')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Kiosk View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`/assessor/${selectedCohort.id}`, '_blank')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Assessor View
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {enrollments.map((enrollment) => (
                <div 
                  key={enrollment.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-mono text-muted-foreground">
                      {enrollment.learner?.badgeId}
                    </div>
                    <div>
                      <div className="font-medium">{enrollment.learner?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {enrollment.learner?.company} • {enrollment.learner?.idNumber}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {enrollment.theoryScore !== undefined && (
                      <div className="text-sm">
                        Theory: <span className="font-medium">{enrollment.theoryScore}%</span>
                      </div>
                    )}
                    <StatusBadge status={enrollment.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;