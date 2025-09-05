import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  getEnterpriseById,
  updateEnterprise,
} from '@/lib/mockData';
import useEnterpriseBranding from '@/hooks/use-enterprise-branding';

const Enterprise = () => {
  const { enterpriseId } = useParams();
  const { toast } = useToast();
  const enterprise = getEnterpriseById(enterpriseId);
  useEnterpriseBranding(enterprise);
  const [logo, setLogo] = useState(enterprise?.brandLogoPath || '');
  const [primary, setPrimary] = useState(enterprise?.brandPrimaryColor || '');
  const [secondary, setSecondary] = useState(enterprise?.brandSecondaryColor || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enterprise) return;
    updateEnterprise(enterprise.id, {
      brandLogoPath: logo,
      brandPrimaryColor: primary,
      brandSecondaryColor: secondary,
    });
    toast({ title: 'Enterprise updated' });
  };

  if (!enterprise) {
    return <div className="p-4">Enterprise not found</div>;
  }

  return (
    <div className="container py-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Enterprise Branding</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input id="logo" value={logo} onChange={e => setLogo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary">Primary Color</Label>
              <Input
                id="primary"
                value={primary}
                onChange={e => setPrimary(e.target.value)}
                placeholder="194 87% 32%"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary">Secondary Color</Label>
              <Input
                id="secondary"
                value={secondary}
                onChange={e => setSecondary(e.target.value)}
                placeholder="210 17% 95%"
              />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Enterprise;
