import { useEffect, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS
import { Section } from '../types'; // Import the Section type
import NewSectionButton from './NewSectionButton'; // Import the new component
import { Loader } from '@/components/ui/loader';

interface SidebarProps {
  sections: Section[];
  onSelectSection: (sectionId: string, sectionName: string) => Promise<void>;
  onAddSection: (type: string, sectionName: string) => Promise<void>; // Add onAddSection prop
  isCreatingSection: boolean;
  setIsCreatingSection: (isCreatingSection: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sections, 
  onSelectSection, 
  onAddSection, 
  isCreatingSection, 
  setIsCreatingSection 
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [dynamicSections, setDynamicSections] = useState<Section[]>(sections);
  const [isLoadingSections, setIsLoadingSections] = useState<boolean>(false);
  const fetchSections = async () => {
	setIsLoadingSections(true); // Set loading state to true
	const response = await fetch('/api/sections');
	const data = await response.json();
	setDynamicSections(data);
	setIsLoadingSections(false); // Reset loading state
  };

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (!isCreatingSection) {
      fetchSections();
    }
  }, [isCreatingSection]);
  const renderSections = () => {
    const sectionsWithDate = dynamicSections.filter((section: Section) => section.createdAt);
    const sortedSections = sectionsWithDate.sort((a: Section, b: Section) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    const sectionsByDate = sortedSections.reduce((acc: Record<string, Section[]>, section: Section) => {
      const date = section.createdAt?.split('T')[0];
      if (date) {
        if (!acc[date]) acc[date] = [];
        acc[date].push(section);
      }
      return acc;
    }, {} as Record<string, Section[]>);

    const mostRecentDate = Object.keys(sectionsByDate)[0]; // Get the most recent date

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
              const datePart = section.name.split('-').slice(1, 4).join('-'); // Extract date part
              const formattedDate = new Date(datePart).toLocaleDateString(); // Format date
              const sectionName = section.name.split('-')[0]; // Extract section name
              return (
                <div 
                  key={section.id} 
                  className="mb-2 p-2 cursor-pointer hover:bg-gray-300 hover:rounded-2xl dark:hover:bg-gray-800 text-gray-800 dark:text-gray-300" 
                  onClick={() => onSelectSection(section.name, section.id)}
                >
                  {`${sectionName} (${formattedDate})`} {/* Display section name with formatted date */}
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
      className={`bg-muted/40 text-white transition-width duration-300 border-r border-gray-700 dark:border-gray-800 ${isCollapsed ? 'w-16' : ''}`}
      style={{ height: 'calc(100vh - 57px)', width: isCollapsed ? '':'250px' }} 
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-700 dark:border-gray-800">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="py-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          {isCollapsed ? '>' : '<'}
        </button>
        {!isCollapsed && <NewSectionButton onAddSection={onAddSection} setIsCreatingSection={setIsCreatingSection} />} {/* Pass handleAddSection */}
      </div>
      {!isCollapsed && (
        <div
          className="px-4 py-1 scrollbar-thin scrollbar-thumb-scrollbar-thumb-light scrollbar-track-scrollbar-track-light dark:scrollbar-thumb-scrollbar-thumb-dark dark:scrollbar-track-scrollbar-track-dark"
          style={{ overflowY: 'auto', height: 'calc(100vh - 130px)' }}
        >
          {isLoadingSections ? (
            <Loader className='margin-auto h-full'/>
          ) : (
            renderSections()
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;