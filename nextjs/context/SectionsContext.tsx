'use client'; // Mark this as a Client Component

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Section } from '@/app/types';
import { logErrorIfNotProduction } from '@/app/utils/helpers';

interface SectionsContextProps {
  sections: Section[];
  fetchSections: (options?: { showLoader?: boolean }) => Promise<void>;
  isLoadingSections: boolean;
}

const SectionsContext = createContext<SectionsContextProps | undefined>(
  undefined
);

export const SectionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState<boolean>(false);

  const fetchSections = async (options?: { showLoader?: boolean }) => {
    const showLoader = options?.showLoader ?? false;
    console.log(
      `SectionsContext: fetchSections CALLED (showLoader: ${showLoader})`
    );

    if (showLoader) {
      setIsLoadingSections(true);
    }

    try {
      const response = await fetch('/api/sections');
      const data = await response.json();
      setSections(data);
    } catch (error: any) {
      logErrorIfNotProduction(error);
      setSections([]);
    } finally {
      setIsLoadingSections(false);
    }
  };

  useEffect(() => {
    console.log(
      'SectionsContext: useEffect[] mount - calling fetchSections (with loader)'
    );
    fetchSections({ showLoader: true });
  }, []);

  return (
    <SectionsContext.Provider
      value={{ sections, fetchSections, isLoadingSections }}
    >
      {children}
    </SectionsContext.Provider>
  );
};

export const useSections = (): SectionsContextProps => {
  const context = useContext(SectionsContext);
  if (!context) {
    throw new Error('useSections must be used within a SectionsProvider');
  }
  return context;
};
