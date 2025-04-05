// components/RecentSectionCard.tsx
import React from 'react';
import { Section } from '@/app/types';
import * as Constants from '@/app/constants';

interface RecentSectionCardProps {
  section: Section;
  onSelect: (sectionId: string, sectionName: string) => void;
}

const RecentSectionCard: React.FC<RecentSectionCardProps> = ({
  section,
  onSelect
}) => {
  const sectionType = section.section_type;
  const categoryDisplay = section.category || Constants.OTHER_CATEGORY;
  let creationDate = '';
  if (section.created_at) {
    try {
      creationDate = new Date(section.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      /* Handle error silently or log */
    }
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer 
                 hover:shadow-lg transition-all duration-200 ease-in-out 
                 border border-gray-200 dark:border-gray-700 
                 hover:border-brand-blue/80 dark:hover:border-brand-blue 
                 w-full max-w-sm"
      onClick={() => onSelect(section.id, section.name)}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
        {section.name}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {sectionType} - {categoryDisplay}
      </p>
      {creationDate && (
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Created: {creationDate}
        </p>
      )}
    </div>
  );
};

export default RecentSectionCard;
