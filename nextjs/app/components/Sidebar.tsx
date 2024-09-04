import React from 'react';
import { Section } from '../types'; // Import the Section type

interface SidebarProps {
  sections: Section[];
  onSelectSection: (sectionName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sections, onSelectSection }) => {
  return (
    <div className="sidebar">
      {sections.map((section) => (
        <div key={section.id}>
          <button onClick={() => onSelectSection(section.name)}>
            {section.name}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;