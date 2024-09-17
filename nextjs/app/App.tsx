import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import { User } from '@supabase/supabase-js';
import { Navbar } from './components/ui/Navbar';
import { createClient } from '@/utils/supabase/client';

const App = () => {
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();

    const getUser = async () => {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
    }
    useEffect(() => {
        getUser();
    }, []);

    return (
        <div className="flex">
            <div className="flex-1 p-4">
            <Navbar user={user} />
                {/* Main content goes here */}
            </div>
        </div>
    );
};

export default App;