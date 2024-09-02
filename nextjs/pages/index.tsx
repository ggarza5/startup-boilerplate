import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Timer from '../components/Timer';
import QuestionSection from '../components/QuestionSection';
import Results from '../components/Results';

const Home = () => {
  const [section, setSection] = useState(null);
  const [sessionData, setSessionData] = useState<any>(null);

  const startSection = async (sectionType: string) => {
    const response = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionType }),
    });
    const questions = await response.json();
    setSection({ type: sectionType, questions } as any);
  };

  const saveSession = async (data: any) => {
    await fetch('/api/save-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };

  return (
    <div className="app">
      <Sidebar startSection={startSection} />
      {section && <Timer />}
      {section && <QuestionSection section={section} saveSession={saveSession} />}
      {sessionData && <Results sessionData={sessionData} />}
    </div>
  );
};

export default Home;