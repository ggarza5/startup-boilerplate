import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import QuestionSection from '../components/QuestionSection';
import Timer from '../components/Timer';
import { generateQuestionSection } from '../../pages/api/ai'; // Adjust the import path to go up one level from the current directory

interface Section {
  id: number;
  name: string;
}

interface Question {
  id: number;
  text: string;
  options: string[];
}

const IndexPage: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState<{ questions: Question[] } | null>(null);
  const [startTimer, setStartTimer] = useState(false);

  useEffect(() => {
    // Fetch sections from API or database
    setSections([
      { id: 1, name: 'Math' },
      { id: 2, name: 'Reading' },
      // ... other sections
    ]);
  }, []);

  const handleSelectSection = async (sectionId: number) => {
    const section = await generateQuestionSection("Math");
    if (section && typeof section === 'object' && 'questions' in section) {
      setCurrentSection(section as { questions: Question[] });
      setStartTimer(true);
    } else {
      console.error('Invalid section data received');
      // Optionally, you can handle the error case here, e.g., show an error message to the user
    }
  };

  const handleSubmitAnswers = (answers: Record<number, string>) => {
    // Handle answer submission
    setStartTimer(false);
  };

  return (
    <div>
      <Sidebar sections={sections} onSelectSection={handleSelectSection} />
      {currentSection && (
        <div>
          <Timer start={startTimer} />
          <QuestionSection questions={currentSection.questions} onSubmit={handleSubmitAnswers} />
        </div>
      )}
    </div>
  );
};

export default IndexPage;