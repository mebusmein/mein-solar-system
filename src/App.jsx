import React, { useState } from 'react';
import { useTheme } from './libs/theme';
import { useSetTheme } from './libs/theme';
import SolarSystem from './components/solarsystem/SolarSystem';
import UI from './components/ui/UI';

function App() {
    const [selectedBody, setSelectedBody] = useState(0);
    const theme = useTheme();
    const { toggleTheme } = useSetTheme();

    return (
        <div className='h-full relative'>
            <SolarSystem selectedBody={selectedBody} setSelectedBody={setSelectedBody} />
            <UI  />
        </div>
    );
}

export default App;
