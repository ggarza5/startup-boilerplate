import { useEffect, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS
import { Section } from '../types'; // Import the Section type
import NewSectionButton from './NewSectionButton'; // Import the new component
import { Loader } from '@/components/ui/loader';
import Link from 'next/link';
import * as Constants from '../constants'; // Import constants
import { useSections } from '@/context/SectionsContext';
import { motion } from 'framer-motion'; // Import motion

interface SidebarProps {
  onSelectSection: (sectionId: string, sectionName: string) => Promise<void>;
  onAddSection: (
    type: string,
    sectionName: string,
    category?: string
  ) => Promise<void>; // Update to include category
  isCreatingSection: boolean;
  setIsCreatingSection: (isCreatingSection: boolean) => void;
  activeSectionId?: string | null; // NEW: Receive active ID as prop
}

// Helper function to get initials for shorthand
const getShorthand = (
  type: string,
  category: string | null | undefined
): string => {
  const typeInitial = type.charAt(0).toUpperCase();
  let categoryInitial = 'O'; // Default to 'O' for Other/None
  if (category) {
    // Simple split and take first letter of first word
    categoryInitial = category.split(' ')[0].charAt(0).toUpperCase();
    // Add more specific initials if needed:
    // if (category === Constants.PROBLEM_SOLVING_DATA_ANALYSIS) categoryInitial = 'P';
    // etc.
  }
  return `${typeInitial}-${categoryInitial}`;
};

const Sidebar: React.FC<SidebarProps> = ({
  onSelectSection,
  onAddSection,
  isCreatingSection,
  setIsCreatingSection,
  activeSectionId
}) => {
  const { sections, fetchSections, isLoadingSections } = useSections();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [ellipsis, setEllipsis] = useState<string>('...'); // Start with three dots
  const [flashId, setFlashId] = useState<string | null>(null); // Renamed state for clarity

  // Effect for ellipsis animation
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isCreatingSection) {
      setEllipsis('...'); // Reset to three dots when starting
      intervalId = setInterval(() => {
        setEllipsis((prev) => {
          switch (prev) {
            case '...':
              return '....'; // 3 -> 4
            case '....':
              return '.....'; // 4 -> 5
            case '.....':
              return '.'; // 5 -> 1
            case '.':
              return '..'; // 1 -> 2
            case '..':
              return '...'; // 2 -> 3
            default:
              return '...'; // Fallback just in case
          }
        });
      }, 600); // Adjust speed as needed
    } else {
      setEllipsis('...'); // Reset to three dots when not creating
    }

    // Cleanup function to clear interval
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isCreatingSection]);

  // Handler for clicking a section item
  const handleItemClick = (sectionId: string, sectionName: string) => {
    if (sectionId === activeSectionId) {
      // If already active, trigger flash effect
      setFlashId(sectionId);
      setTimeout(() => setFlashId(null), 200); // Reset after flash duration
    } else {
      // Otherwise, select the new section
      onSelectSection(sectionId, sectionName);
    }
  };

  const renderSections = () => {
    const sectionsWithDate = sections.filter(
      (section: Section) => section.created_at
    );
    const sortedSections = sectionsWithDate.sort((a: Section, b: Section) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    // --- Group by date for both views ---
    const sectionsByDate = sortedSections.reduce(
      (acc: Record<string, Section[]>, section: Section) => {
        const date = section.created_at?.split('T')[0];
        if (date) {
          if (!acc[date]) acc[date] = [];
          acc[date].push(section);
        }
        return acc;
      },
      {} as Record<string, Section[]>
    );
    const mostRecentDate = Object.keys(sectionsByDate)[0];

    // --- Render Collapsed View ---
    if (isCollapsed) {
      return (
        <>
          {Object.entries(sectionsByDate).map(([date, dateSections]) => (
            <div key={date} className="flex flex-col items-center w-full mb-3">
              {/* Minimal Date Label for Collapsed View */}
              <div className="text-gray-500 dark:text-gray-400 text-xs mb-1 font-mono">
                {new Date(date + 'T00:00:00Z') // Add time/zone for correct parsing
                  .toLocaleDateString('en-US', {
                    // Use numeric format
                    month: 'numeric',
                    day: 'numeric',
                    year: '2-digit'
                  })}
              </div>
              {/* Shorthand Buttons for this Date */}
              <div className="flex flex-col items-center space-y-2 w-full">
                {dateSections.map((section) => {
                  const isSelected = section.id === activeSectionId;
                  const isFlashing = flashId === section.id;
                  const shorthand = getShorthand(
                    section.section_type,
                    section.category
                  );
                  const fullTitle = `${section.name} (${section.section_type} - ${section.category || Constants.OTHER_CATEGORY})`;
                  return (
                    <div
                      key={section.id}
                      title={fullTitle}
                      className={`w-10 h-10 flex items-center justify-center rounded cursor-pointer font-mono text-xs transition-colors duration-150
                        ${
                          isFlashing
                            ? 'bg-brand-blue-hex/80 dark:bg-brand-blue-hex/90 text-white dark:text-gray-100 ring-1 ring-brand-blue-hex/60'
                            : isSelected
                              ? 'bg-brand-blue-hex/70 dark:bg-brand-blue-hex/80 text-white dark:text-gray-100 ring-1 ring-brand-blue-hex/50'
                              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300'
                        }`}
                      onClick={() => handleItemClick(section.id, section.name)}
                    >
                      {shorthand}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      );
    }

    // --- Render Expanded View ---
    return (
      <>
        {Object.entries(sectionsByDate).map(([date, dateSections]) => (
          <div key={date} className="mb-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 px-2">
              {new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>

            {/* Animate Generating Text for the most recent date */}
            {date === mostRecentDate && (
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isCreatingSection
                    ? 'max-h-10 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div
                  className={`${isCreatingSection ? 'mb-2 p-2' : ''} text-gray-500 dark:text-gray-400`}
                >
                  {isCreatingSection && `${Constants.GENERATING}${ellipsis}`}
                </div>
              </div>
            )}

            {/* Section List - Apply transition here */}
            <div className="transition-all duration-300 ease-in-out">
              {dateSections.map((section) => {
                const isSelected = section.id === activeSectionId;
                const isFlashing = flashId === section.id;
                const sectionType = section.section_type;
                const categoryDisplay =
                  section.category || Constants.OTHER_CATEGORY;
                // Format creation time
                let creationTime = '';
                if (section.created_at) {
                  try {
                    creationTime = new Date(
                      section.created_at
                    ).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });
                  } catch (e) {
                    console.error(
                      'Error formatting date:',
                      section.created_at,
                      e
                    );
                    // Handle potential invalid date string
                  }
                }

                return (
                  <div
                    key={section.id}
                    className={`mb-1 mx-1 px-2 py-2 cursor-pointer rounded-md transition-colors duration-150 flex items-center
                      ${
                        isFlashing
                          ? 'bg-brand-blue-hex/20 dark:bg-brand-blue-hex/30'
                          : isSelected
                            ? 'bg-brand-blue-hex/10 dark:bg-brand-blue-hex/20'
                            : 'hover:bg-gray-200 dark:hover:bg-muted/40 text-gray-800 dark:text-gray-300'
                      }`}
                    onClick={() => handleItemClick(section.id, section.name)}
                  >
                    {/* Text content (takes up available space) */}
                    <div className="flex-grow truncate mr-2">
                      {/* Use brand-blue-hex for text */}
                      <div
                        className={`font-medium ${isSelected ? 'text-brand-blue-hex dark:text-brand-blue-hex/90' : 'text-gray-900 dark:text-gray-100'}`}
                      >
                        {section.name}
                      </div>
                      <div
                        className={`text-xs mt-1 ${isSelected ? 'text-brand-blue-hex/80 dark:text-brand-blue-hex/70' : 'text-gray-600 dark:text-gray-400'}`}
                      >
                        {`${sectionType} - ${categoryDisplay}`}
                        {creationTime && ` - ${creationTime}`}
                      </div>
                    </div>
                    {/* Conditional Dot Indicator (pushes right) */}
                    {isSelected && (
                      // Use brand-blue-hex for dot color
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-blue-hex flex-shrink-0"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </>
    );
  };

  // Collapse button in the sidebar header
  const renderCollapseButton = () => {
    return (
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
    );
  };

  // Sidebar header on top of the sidebar content
  const renderSidebarHeader = () => {
    return (
      <div className="flex justify-between items-center p-4 border-b border-gray-700 dark:border-gray-800">
        {renderCollapseButton()}
        {!isCollapsed && (
          <NewSectionButton
            onAddSection={onAddSection}
            setIsCreatingSection={setIsCreatingSection}
          />
        )}
      </div>
    );
  };

  return (
    <div
      className={`bg-card text-card-foreground transition-all duration-300 ease-in-out border-r border-border/60 
                ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Header */}
      {renderSidebarHeader()}

      {/* Content */}
      <div className="p-2 overflow-y-auto h-[calc(100vh-8rem)] scrollbar-thin scrollbar-thumb-scrollbar-thumb-light scrollbar-track-scrollbar-track-light dark:scrollbar-thumb-scrollbar-thumb-dark dark:scrollbar-track-scrollbar-track-dark">
        {/* --- Add Progress Links (Expanded Only) --- */}
        {!isCollapsed && (
          <div className="mb-4 px-2 space-y-1">
            <Link
              href="/progress"
              className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 hover:text-brand-blue-hex dark:hover:text-brand-blue-hex p-2 rounded-md hover:bg-brand-blue-hex/10 dark:hover:bg-brand-blue-hex/20 transition-colors duration-150"
            >
              <i className="fas fa-chart-line w-4 h-4"></i>
              <span>{Constants.VIEW_YOUR_PROGRESS}</span>
            </Link>
            <Link
              href="/category-performance"
              className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 hover:text-brand-blue-hex dark:hover:text-brand-blue-hex p-2 rounded-md hover:bg-brand-blue-hex/10 dark:hover:bg-brand-blue-hex/20 transition-colors duration-150"
            >
              <i className="fas fa-tags w-4 h-4"></i>
              <span>{Constants.CATEGORY_PERFORMANCE}</span>
            </Link>
            {/* Divider */}
            <div className="pt-2">
              <hr className="border-border/60" />
            </div>
          </div>
        )}

        {/* --- Sections --- */}
        {isLoadingSections ? (
          <div className="flex justify-center items-center h-full">
            <Loader />
          </div>
        ) : (
          renderSections()
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/60">
        {isCollapsed ? (
          <Link
            href="/dashboard"
            title="Dashboard"
            className="flex justify-center items-center h-10 w-10 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
          >
            <i className="fas fa-tachometer-alt text-gray-600 dark:text-gray-400"></i>
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
          >
            <i className="fas fa-tachometer-alt w-4 h-4"></i>
            <span>Dashboard</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
