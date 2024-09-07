import React, { useState, useEffect, useRef } from 'react';

interface NewSectionButtonProps {
  onAddSection: (type: string, sectionName: string) => void;
  setIsCreatingSection: (isCreatingSection: boolean) => void;
}

const NewSectionButton: React.FC<NewSectionButtonProps> = ({ onAddSection, setIsCreatingSection }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleAddSection = (type: string) => {
	setIsCreatingSection(true);
    const date = new Date();
    const uniqueId = `${type}-${date.toISOString()}`;
    onAddSection(type, uniqueId);
	// setIsCreatingSection(false);
    setShowMenu(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowMenu(false);
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
        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded dark:bg-gray-600 dark:hover:bg-gray-400"
      >
        <i className="fas fa-plus"></i>
      </button>
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg">
          <button 
            onClick={() => handleAddSection('Math')} 
            className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            New Math Section
          </button>
          <button 
            onClick={() => handleAddSection('Reading')} 
            className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            New Reading Section
          </button>
        </div>
      )}
    </div>
  );
};

export default NewSectionButton;