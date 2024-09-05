"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import QuestionSection from './components/QuestionSection';
import Timer from './components/Timer';
import { Section } from './types'; // Import the Section type

interface Question {
  id: number;
  text: string;
  options: string[];
}

const IndexPage: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState<Section | null>(null); // Update type to Section
  const [startTimer, setStartTimer] = useState(false);

  useEffect(() => {
    // Fetch sections from API or database
    setSections([
      { id: 1, name: 'Math', type: 'subject', questions: [] },
      { id: 2, name: 'Reading', type: 'subject', questions: [] },
      // ... other sections
    ]);
  }, []);

  const handleSelectSection = async (sectionName: string) => {
    console.log("selected a section: ", sectionName);
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
          <Timer startTimer={startTimer} />
          <QuestionSection 
            questions={currentSection.questions}
            onSubmit={handleSubmitAnswers}
          />
        </div>
      )}
    </div>
  );
};

export default IndexPage;