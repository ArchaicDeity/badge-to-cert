import { useEffect } from 'react';
import type { Enterprise } from '@/lib/mockData';

export const useEnterpriseBranding = (enterprise?: Enterprise) => {
  useEffect(() => {
    if (!enterprise) return;
    const root = document.documentElement.style;
    const prevPrimary = root.getPropertyValue('--primary');
    const prevSecondary = root.getPropertyValue('--secondary');
    if (enterprise.brandPrimaryColor) {
      root.setProperty('--primary', enterprise.brandPrimaryColor);
    }
    if (enterprise.brandSecondaryColor) {
      root.setProperty('--secondary', enterprise.brandSecondaryColor);
    }
    return () => {
      root.setProperty('--primary', prevPrimary);
      root.setProperty('--secondary', prevSecondary);
    };
  }, [enterprise]);
};

export default useEnterpriseBranding;
