import { useEffect, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS
import { Section } from '../types'; // Import the Section type
import NewSectionButton from './NewSectionButton'; // Import the new component
import { Loader } from '@/components/ui/loader';
import Link from 'next/link';

interface SidebarProps {
  onSelectSection: (sectionId: string, sectionName: string) => Promise<void>;
  onAddSection: (type: string, sectionName: string) => Promise<void>; // Add onAddSection prop
  isCreatingSection: boolean;
  setIsCreatingSection: (isCreatingSection: boolean) => void;
}

import { useSections } from '@/context/SectionsContext';

interface SidebarProps {
  onSelectSection: (sectionId: string, sectionName: string) => Promise<void>;
  onAddSection: (type: string, sectionName: string) => Promise<void>;
  isCreatingSection: boolean;
  setIsCreatingSection: (isCreatingSection: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onSelectSection,
  onAddSection,
  isCreatingSection,
  setIsCreatingSection
}) => {
  const { sections, fetchSections, isLoadingSections } = useSections();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    fetchSections();
  }, [isCreatingSection]);

  const renderSections = () => {
    const sectionsWithDate = sections.filter(
      (section: Section) => section.createdAt
    );

    const sortedSections = sectionsWithDate.sort((a: Section, b: Section) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    const sectionsByDate = sortedSections.reduce(
      (acc: Record<string, Section[]>, section: Section) => {
        const date = section.createdAt?.split('T')[0];
        if (date) {
          if (!acc[date]) acc[date] = [];
          acc[date].push(section);
        }
        return acc;
      },
      {} as Record<string, Section[]>
    );

    const mostRecentDate = Object.keys(sectionsByDate)[0];

    return (
      <>
        {Object.entries(sectionsByDate).map(([date, sections]) => (
          <div key={date}>
            {!isCollapsed && <h3 className="text-gray-400">{date}</h3>}
            {isCreatingSection && date === mostRecentDate && (
              <div className="mb-2 p-2 text-gray-500 dark:text-gray-400">
                Generating...
              </div>
            )}
            {sections.map((section) => {
              const datePart = section.name.split('-').slice(1, 4).join('-');
              const formattedDate = new Date(datePart).toLocaleDateString();
              const sectionName = section.name.split('-')[0];
              return (
                <div
                  key={section.id}
                  className="mb-2 p-2 cursor-pointer hover:bg-gray-300 hover:rounded-2xl dark:hover:bg-gray-800 text-gray-800 dark:text-gray-300"
                  onClick={() => onSelectSection(section.name, section.id)}
                >
                  {`${sectionName} (${formattedDate})`}{' '}
                </div>
              );
            })}
          </div>
        ))}
      </>
    );
  };

  return (
    <div
      className={`bg-muted/40 text-white border-r border-gray-700 dark:border-gray-800 ${isCollapsed ? 'w-16' : ''}`}
      style={{
        height: 'calc(100vh - 57px)',
        minWidth: isCollapsed ? '' : '230px'
      }}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-700 dark:border-gray-800">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`text-black hover:text-gray-500 dark:text-white dark:hover:text-gray-400 font-bold py-1 rounded transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
        >
          <svg
            className="w-6 h-6 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
          </svg>
        </button>
        {!isCollapsed && (
          <NewSectionButton
            onAddSection={onAddSection}
            setIsCreatingSection={setIsCreatingSection}
          />
        )}
      </div>
      {!isCollapsed && (
        <div
          className="px-4 py-1 scrollbar-thin scrollbar-thumb-scrollbar-thumb-light scrollbar-track-scrollbar-track-light dark:scrollbar-thumb-scrollbar-thumb-dark dark:scrollbar-track-scrollbar-track-dark"
          style={{ overflowY: 'auto', height: 'calc(100vh - 130px)' }}
        >
          {isLoadingSections ? (
            <Loader className="margin-auto h-full" />
          ) : (
            <>
              {renderSections()}
              <Link href="/progress">
                <span className="block mb-2 p-2 cursor-pointer hover:bg-gray-300 hover:rounded-2xl dark:hover:bg-gray-800 text-gray-800 dark:text-gray-300">
                  Progress
                </span>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
