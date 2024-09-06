import React, { useEffect, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS
import { Section } from '../types'; // Import the Section type
import NewSectionButton from './NewSectionButton'; // Import the new component
import '../styles/customScrollbar.css'; // Import custom scrollbar styles

interface SidebarProps {
	sections: Section[];
	onSelectSection: (sectionId: string, sectionName: string) => Promise<void>;
}

const Sidebar: React.FC<SidebarProps> = ({ sections, onSelectSection }) => {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [dynamicSections, setDynamicSections] = useState<Section[]>(sections);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingSections, setIsLoadingSections] = useState(false);
	const [newSectionName, setNewSectionName] = useState<string>(''); // Track new section name
	const [sectionCreationDate, setSectionCreationDate] = useState<Date | null>(null); // Track section creation date

	useEffect(() => {	
		// Fetch sections from the database when the component mounts
		const fetchSections = async () => {
			setIsLoadingSections(true); // Set loading state to true
			const response = await fetch('/api/sections');
			const data = await response.json();
			//conver the data into my type			
			setDynamicSections(data);
			setIsLoadingSections(false); // Reset loading state
		};
		fetchSections();
	}, []);

	const handleAddSection = async (type: string, sectionName: string) => {
		
		//generate section
		const response = await fetch('/api/ai/generateSection', {
			method: 'POST',
			body: JSON.stringify({ name: sectionName, type: type }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const data = await response.json();
		//serialize into Section type from something like this:
		// {
		// 	"id": "93b686e0-ccc4-4610-bd96-fc778f203064",
		// 	"name": "default_name",
		// 	"section_type": "Math",
		// 	"questions": [],
		// 	"created_at": "2024-09-04T23:27:36.951657+00:00"
		// },
		const newSection = {
			id: data.id,
			name: data.name,
			type: data.section_type,
			questions: data.questions,
			created_at: data.created_at
		};

		setDynamicSections([newSection, ...dynamicSections]); // Add new section at the top
		await onSelectSection(newSection.name, newSection.id); // Use sectionName to select the new section
	};

	// Render date separators
	const renderSections = () => {
		// Filter out sections that don't have a createdAt date
		const sectionsWithDate = dynamicSections.filter((section) => section.createdAt);
		// Sort sections by createdAt date in descending order
		const sortedSections = sectionsWithDate.sort((a, b) => {
			const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
			const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
			return dateB - dateA;
		});
		const sectionsByDate = sortedSections.reduce((acc, section) => {
			const date = section.createdAt?.split('T')[0]; // Assuming createdAt is in ISO format
			if (date) { // Ensure date is defined
				if (!acc[date]) acc[date] = [];
				acc[date].push(section);
			}
			return acc;
		}, {} as Record<string, Section[]>);

		return Object.entries(sectionsByDate).map(([date, sections]) => (
			<div key={date}>
				{!isCollapsed && <h3 className="text-gray-400">{date}</h3>}
				{sections.map((section) => (
					<div 
						key={section.id} 
						className="mb-2 p-2 cursor-pointer hover:bg-gray-300 hover:rounded-2xl dark:hover:bg-gray-800 text-black dark:text-gray-300" 
						onClick={() => onSelectSection(section.name, section.id)}
					>
						{section.name}
					</div>
				))}
			</div>
		));
	};

	return (
		<div
			className={`bg-gray-100 text-white dark:bg-gray-900 transition-width duration-300 border-r border-gray-700 dark:border-gray-800 ${isCollapsed ? 'w-16' : 'w-64'}`}
			style={{ height: 'calc(100vh - 57px)' }}
		>
			<div className="flex justify-between items-center p-4 border-b border-gray-700 dark:border-gray-800">
				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="py-2 text-gray-400 hover:text-white dark:text-gray-500 dark:hover:text-gray-300"
				>
					{isCollapsed ? '>' : '<'}
				</button>
				{!isCollapsed && <NewSectionButton onAddSection={handleAddSection} />}
			</div>
			{!isCollapsed && (
				<div
					className="px-4 py-1 scrollbar-thin scrollbar-thumb-scrollbar-thumb-light scrollbar-track-scrollbar-track-light dark:scrollbar-thumb-scrollbar-thumb-dark dark:scrollbar-track-scrollbar-track-dark"
					style={{ overflowY: 'auto', height: 'calc(100vh - 130px)' }}
				>
					{isLoadingSections ? (
						<div className="text-gray-500 dark:text-gray-400">Loading...</div>
					) : (
						renderSections()
					)}
				</div>
			)}
		</div>
	);
};

export default Sidebar;