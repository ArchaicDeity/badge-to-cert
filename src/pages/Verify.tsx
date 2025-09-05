import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  Shield, 
  Calendar,
  User,
  Building2,
  FileText,
  Download,
  AlertTriangle
} from 'lucide-react';

interface Certificate {
  id: string;
  certificateCode: string;
  learnerName: string;
  idNumber: string;
  company: string;
  cohortDate: string;
  venue: string;
  assessor: string;
  issueDate: string;
  expiryDate: string;
  voided: boolean;
  voidReason?: string;
}

const Verify = () => {
  const { certificateCode } = useParams();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock certificate lookup
    const mockCertificate: Certificate = {
      id: '1',
      certificateCode: certificateCode || 'CERT-20240905-0001',
      learnerName: 'Sarah Johnson',
      idNumber: '8801010123081',
      company: 'Sasol Synfuels',
      cohortDate: '2024-09-05',
      venue: 'Secunda Training Centre',
      assessor: 'John Assessor',
      issueDate: '2024-09-05',
      expiryDate: '2027-09-05',
      voided: false
    };

    // Simulate API call
    setTimeout(() => {
      if (certificateCode && certificateCode.startsWith('CERT-')) {
        setCertificate(mockCertificate);
      } else {
        setError('Certificate not found');
      }
      setLoading(false);
    }, 1000);
  }, [certificateCode]);

  const isExpired = certificate && new Date(certificate.expiryDate) < new Date();
  const isValid = certificate && !certificate.voided && !isExpired;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying certificate...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 via-background to-destructive/10">
        <Card className="w-full max-w-md border-destructive/20">
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Certificate Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The certificate code "{certificateCode}" could not be verified.
            </p>
            <p className="text-sm text-muted-foreground">
              Please check the certificate code and try again, or contact the training administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Certificate Verification</h1>
              <p className="text-muted-foreground">SASOL First Aid Training System</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {isValid && (
                <div className="h-16 w-16 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
              )}
              {certificate.voided && (
                <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              )}
              {isExpired && !certificate.voided && (
                <div className="h-16 w-16 bg-warning/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-warning" />
                </div>
              )}
            </div>
            
            <CardTitle className="text-2xl mb-2">
              First Aid Refresher Certificate
            </CardTitle>
            <CardDescription className="text-lg">
              US 119567 - Provide Treatment for Shock, Wounds, Bleeding, Burns and Fractures
            </CardDescription>

            <div className="flex justify-center mt-4">
              {isValid && (
                <Badge className="bg-success/10 text-success border-success/20">
                  Valid Certificate
                </Badge>
              )}
              {certificate.voided && (
                <Badge variant="destructive">
                  Certificate Voided
                </Badge>
              )}
              {isExpired && !certificate.voided && (
                <Badge className="bg-warning/10 text-warning border-warning/20">
                  Certificate Expired
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Certificate Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">{certificate.learnerName}</div>
                    <div className="text-sm text-muted-foreground">ID: {certificate.idNumber}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">{certificate.company}</div>
                    <div className="text-sm text-muted-foreground">Company</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">
                      {new Date(certificate.cohortDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">{certificate.venue}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold font-mono text-sm">{certificate.certificateCode}</div>
                    <div className="text-sm text-muted-foreground">Certificate Code</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-success" />
                  <div>
                    <div className="font-semibold">
                      {new Date(certificate.issueDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Issue Date</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className={`h-5 w-5 ${isExpired ? 'text-destructive' : 'text-warning'}`} />
                  <div>
                    <div className={`font-semibold ${isExpired ? 'text-destructive' : ''}`}>
                      {new Date(certificate.expiryDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Expiry Date</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assessor Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Assessment Details</h3>
              <p className="text-sm text-muted-foreground">
                Practical assessment completed by: <span className="font-medium">{certificate.assessor}</span>
              </p>
            </div>

            {/* Void Information */}
            {certificate.voided && (
              <div className="border-t pt-4">
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <h3 className="font-semibold text-destructive mb-1">Certificate Voided</h3>
                  <p className="text-sm text-destructive-foreground">
                    {certificate.voidReason || 'This certificate has been voided and is no longer valid.'}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-4 pt-4">
              <Button variant="outline" onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Print Verification
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                Return to Portal
              </Button>
            </div>

            {/* Verification Footer */}
            <div className="text-center text-xs text-muted-foreground pt-6 border-t">
              <p>This verification was generated on {new Date().toLocaleString()}</p>
              <p>For questions about this certificate, contact SASOL Training Administration</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verify;