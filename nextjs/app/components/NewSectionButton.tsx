import React, { useState, useEffect, useRef } from 'react';

interface NewSectionButtonProps {
	onAddSection: (type: string, sectionName: string) => void;
}

const NewSectionButton: React.FC<NewSectionButtonProps> = ({ onAddSection }) => {
	const [showMenu, setShowMenu] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	const handleAddSection = (type: string) => {
		const date = new Date();
		const uniqueId = `${type}-${date.toISOString()}`;
		onAddSection(type, uniqueId); // Pass type and uniqueId
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
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded dark:bg-blue-600 dark:hover:bg-blue-800"
			>
				<i className="fas fa-plus"></i> {/* Plus icon */}
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