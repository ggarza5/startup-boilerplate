"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import QuestionSection from '../components/QuestionSection';
import Timer from '../components/Timer';
import { Section } from '../types'; // Import the Section type

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
      { id: 1, name: 'Math', type: 'subject', questions: [] },
      { id: 2, name: 'Reading', type: 'subject', questions: [] },
      // ... other sections
    ]);
  }, []);
  
  const handleSelectSection = async (sectionName: string) => {
    console.log('we are about to call')
    try {
      const response = await fetch('/api/ai/generateQuestionSection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sectionName }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      if (data && typeof data === 'object' && 'answer' in data) {
        setCurrentSection({ questions: [{ id: 1, text: data.answer, options: [] }] }); // Modify this according to your question format
        setStartTimer(true);
      } else {
        console.error('Invalid section data received');
      }
    } catch (error) {
      console.error('Error fetching section:', error);
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
          <Timer startTimer={startTimer} />
          <QuestionSection questions={currentSection.questions} onSubmit={handleSubmitAnswers} />
        </div>
      )}
    </div>
  );
};

export default IndexPage;