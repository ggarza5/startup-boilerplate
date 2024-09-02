import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import QuestionSection from '../components/QuestionSection';
import Timer from '../components/Timer';
import { generateQuestionSection } from '../api/ai';

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
    const section = await generateQuestionSection();
    setCurrentSection(section);
    setStartTimer(true);
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