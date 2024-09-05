import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Sidebar = () => {
	const [sections, setSections] = useState([]);
	const [isCollapsed, setIsCollapsed] = useState(false);

	useEffect(() => {
		const getSections = async () => {
			try {
				const response = await axios.get('/api/sections');
				setSections(response.data);
			} catch (error) {
				console.error('Error fetching sections:', error);
			}
		};
		getSections();
	}, []);

	return (
		<div className={`fixed top-0 left-0 h-full bg-gray-800 text-white ${isCollapsed ? 'w-16' : 'w-64'} transition-width duration-300`}>
			<div className="flex justify-between items-center p-4 border-b border-gray-700">
				<button onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-400 hover:text-white">
					{isCollapsed ? '>' : '<'}
				</button>
				<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
					New Section
				</button>
			</div>
			<div className="p-4">
				{sections.map((section: { id: string; name: string }) => (
					<div key={section.id} className="mb-2 p-2 bg-gray-700 rounded">
						{section.name}
					</div>
				))}
			</div>
		</div>
	);
};

export default Sidebar;