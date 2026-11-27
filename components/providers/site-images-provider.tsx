'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_SITE_IMAGES, mergeSiteImages, type SiteImageMap } from '@/lib/siteImages';

interface SiteImagesContextValue {
  images: SiteImageMap;
  refresh: () => Promise<void>;
}

const SiteImagesContext = createContext<SiteImagesContextValue>({
  images: DEFAULT_SITE_IMAGES,
  refresh: async () => {},
});

export function SiteImagesProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<SiteImageMap>({});

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/site-images', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      if (data && typeof data.images === 'object' && data.images !== null) {
        setOverrides(data.images as SiteImageMap);
      }
    } catch {
      // En cas d'erreur réseau, les images par défaut restent affichées.
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const images = useMemo(() => mergeSiteImages(overrides), [overrides]);

  return (
    <SiteImagesContext.Provider value={{ images, refresh }}>{children}</SiteImagesContext.Provider>
  );
}

export function useSiteImages() {
  return useContext(SiteImagesContext);
}
