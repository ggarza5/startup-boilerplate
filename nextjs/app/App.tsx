import React from 'react';
import Sidebar from './components/Sidebar';

const App = () => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-4">
                {/* Main content goes here */}
            </div>
        </div>
    );
};

export default App;