'use client'; // Mark this as a Client Component

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Section } from '@/app/types';
import { logErrorIfNotProduction } from '@/app/utils/helpers';

interface SectionsContextProps {
  sections: Section[];
  fetchSections: () => void;
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

  const fetchSections = async () => {
    setIsLoadingSections(true);
    try {
      const response = await fetch('/api/sections');
      const data = await response.json();
      setSections(data);
    } catch (error: any) {
      logErrorIfNotProduction(error);
    } finally {
      setIsLoadingSections(false);
    }
  };

  useEffect(() => {
    fetchSections();
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
