import React, { useState, useEffect, useRef } from 'react';
import * as Constants from '@/app/constants'; // Import all constants

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
    console.log(
      `NewSectionButton: handleAddSection called with type: ${type}, category: ${category}`
    );
    setShowMenu(false);
    setShowMathSubmenu(false);
    setShowReadingSubmenu(false);
    setIsCreatingSection(true);
    const date = new Date();
    const uniqueId = `${type}-${date.toISOString()}`; // Keep initial unique ID for API call
    await onAddSection(type, uniqueId, category);
    // setIsCreatingSection(false); // Let parent handle this after API call
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
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-10">
          <button
            onClick={() => setShowMathSubmenu(!showMathSubmenu)}
            className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {Constants.NEW_MATH_SECTION}
          </button>
          {showMathSubmenu && (
            <div className="ml-4">
              <button
                onClick={() => handleAddSection('Math', Constants.ALGEBRA)}
                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {Constants.ALGEBRA}
              </button>
              <button
                onClick={() =>
                  handleAddSection('Math', Constants.ADVANCED_MATH)
                }
                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {Constants.ADVANCED_MATH}
              </button>
              <button
                onClick={() =>
                  handleAddSection(
                    'Math',
                    Constants.PROBLEM_SOLVING_DATA_ANALYSIS
                  )
                }
                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {Constants.PROBLEM_SOLVING_DATA_ANALYSIS}
              </button>
              <button
                onClick={() =>
                  handleAddSection('Math', Constants.GEOMETRY_TRIGONOMETRY)
                }
                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {Constants.GEOMETRY_TRIGONOMETRY}
              </button>
            </div>
          )}
          <button
            onClick={() => setShowReadingSubmenu(!showReadingSubmenu)}
            className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {Constants.NEW_READING_SECTION}
          </button>
          {showReadingSubmenu && (
            <div className="ml-4">
              <button
                onClick={() =>
                  handleAddSection('Reading', Constants.INFO_IDEAS)
                }
                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {Constants.INFO_IDEAS}
              </button>
              <button
                onClick={() =>
                  handleAddSection('Reading', Constants.CRAFT_STRUCTURE)
                }
                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {Constants.CRAFT_STRUCTURE}
              </button>
              <button
                onClick={() =>
                  handleAddSection('Reading', Constants.EXPRESSION_IDEAS)
                }
                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {Constants.EXPRESSION_IDEAS}
              </button>
              <button
                onClick={() =>
                  handleAddSection(
                    'Reading',
                    Constants.STANDARD_ENGLISH_CONVENTIONS
                  )
                }
                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {Constants.STANDARD_ENGLISH_CONVENTIONS}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewSectionButton;
