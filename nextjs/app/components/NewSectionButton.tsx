import React, { useState, useEffect, useRef } from 'react';

interface NewSectionButtonProps {
  onAddSection: (
    type: string,
    sectionName: string,
    category?: string
  ) => Promise<void>; // Add category parameter
  setIsCreatingSection: (isCreatingSection: boolean) => void;
}

const NewSectionButton: React.FC<NewSectionButtonProps> = ({
  onAddSection,
  setIsCreatingSection
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showMathSubmenu, setShowMathSubmenu] = useState(false);
  const [showReadingSubmenu, setShowReadingSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleAddSection = async (type: string, category: string) => {
    setShowMenu(false);
    setShowMathSubmenu(false);
    setShowReadingSubmenu(false);
    setIsCreatingSection(true);
    const date = new Date();
    const uniqueId = `${type}-${date.toISOString()}`;
    await onAddSection(type, uniqueId, category);
    setIsCreatingSection(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowMenu(false);
      setShowMathSubmenu(false);
      setShowReadingSubmenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="text-gray-800 hover:text-gray-400 font-bold py-2 px-4 rounded dark:bg-muted dark:hover:bg-muted/40"
      >
        <i className="fas fa-plus"></i>
      </button>
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg">
          <button
            onClick={() => setShowMathSubmenu(!showMathSubmenu)}
            className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            New Math Section
          </button>
          {showMathSubmenu && (
            <div className="ml-4">
              <button
                onClick={() => handleAddSection('Math', 'Algebra')}
                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Algebra
              </button>
              <button
                onClick={() => handleAddSection('Math', 'Advanced Math')}
                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Advanced Math
              </button>
              <button
                onClick={() =>
                  handleAddSection('Math', 'Problem-Solving and Data Analysis')
                }
                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Problem-Solving and Data Analysis
              </button>
              <button
                onClick={() =>
                  handleAddSection('Math', 'Geometry and Trigonometry')
                }
                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Geometry and Trigonometry
              </button>
            </div>
          )}
          <button
            onClick={() => setShowReadingSubmenu(!showReadingSubmenu)}
            className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            New Reading Section
          </button>
          {showReadingSubmenu && (
            <div className="ml-4">
              <button
                onClick={() =>
                  handleAddSection('Reading', 'Information and Ideas')
                }
                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Information and Ideas
              </button>
              <button
                onClick={() =>
                  handleAddSection('Reading', 'Craft and Structure')
                }
                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Craft and Structure
              </button>
              <button
                onClick={() =>
                  handleAddSection('Reading', 'Expression of Ideas')
                }
                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Expression of Ideas
              </button>
              <button
                onClick={() =>
                  handleAddSection('Reading', 'Standard English Conventions')
                }
                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Standard English Conventions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewSectionButton;
