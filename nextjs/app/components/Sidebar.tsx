import React from 'react';

interface Section {
  id: number;
  name: string;
}

interface SidebarProps {
  sections: Section[];
  onSelectSection: (sectionId: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sections, onSelectSection }) => {
  return (
    <div className="sidebar">
      {sections.map((section) => (
        <div key={section.id}>
          <button onClick={() => onSelectSection(section.id)}>
            {section.name}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;