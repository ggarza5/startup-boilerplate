import React, { useEffect, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS
import { Section } from '../types'; // Import the Section type

interface SidebarProps {
	sections: Section[];
	onSelectSection: (sectionName: string) => Promise<void>;
}

const Sidebar: React.FC<SidebarProps> = ({ sections, onSelectSection }) => {
	const [isCollapsed, setIsCollapsed] = useState(false);

	return (
		<div className={`h-full bg-background text-white dark:bg-background ${isCollapsed ? 'w-16' : 'w-64'} transition-width duration-300 border-r border-gray-700 dark:border-gray-800`}>
			<div className="flex justify-between items-center p-4 border-b border-gray-700 dark:border-gray-800">
				<button onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-900 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300">
					{isCollapsed ? '>' : '<'}
				</button>
				<button className="bg-gray-900 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded dark:bg-blue-600 dark:hover:bg-blue-800">
					<i className="fas fa-plus"></i> {/* Plus icon */}
				</button>
			</div>
			<div className="p-4">
				{sections.map((section) => (
					<div 
						key={section.id} 
						className="mb-2 p-2 cursor-pointer text-black hover:bg-gray-300 hover:rounded-2xl dark:hover:bg-gray-800" 
						onClick={() => onSelectSection(section.name)}
					>
						{section.name}
					</div>
				))}
			</div>
		</div>
	);
};

export default Sidebar;