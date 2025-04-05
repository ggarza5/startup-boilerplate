'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Result } from '@/app/types';
import { Loader } from '@/components/ui/loader';
import { createClient } from '@/utils/supabase/client';
import { logErrorIfNotProduction, logIfNotProduction } from '../utils/helpers';
import { User } from '@supabase/supabase-js';
import { Navbar } from '../components/ui/Navbar';
import Sidebar from '../components/Sidebar';
import { QuestionsButton } from '../components/QuestionsButton';
import useFetchUser from '../hooks/useFetchUser';
import * as Constants from '../constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProgressPage: React.FC = () => {
  const router = useRouter();
  const [results, setResults] = useState<Result[]>([]);
  const [isCreatingSection, setIsCreatingSection] = useState(false);

  const { user, loading, setLoading, error, refetch } = useFetchUser();

  useEffect(() => {
    const fetchResults = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/results?userId=${user.id}`);
          const data = await response.json();
          if (!response.ok) {
            console.error(Constants.ERROR_FETCHING_RESULTS, data.error);
          }
          setResults(data);
        } catch (error) {
          console.error(Constants.ERROR_FETCHING_RESULTS, error);
        } finally {
          setLoading(false);
        }
      } else {
        // Removed log
      }
    };
    fetchResults();
  }, [user]);

  if (loading) {
    return <Loader className="h-screen" />;
  }

  const chartData = {
    labels: results.map((result) =>
      new Date(result.created_at).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Score',
        data: results.map((result) => result.score),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Progress Over Time'
      }
    }
  };

  const handleSelectSection = async (
    sectionId: string,
    sectionName?: string
  ) => {
    // console.log(`ProgressPage: handleSelectSection called with id: ${sectionId}, name: ${sectionName}`); // Removed log
    await router.push(`/questions?sectionId=${sectionId}`);
  };

  const handleAddSection = async (
    type: string,
    sectionName: string,
    category?: string
  ) => {
    // console.log(`ProgressPage: handleAddSection called with type: ${type}, sectionName: ${sectionName}, category: ${category}`); // Removed log
    let url = `/questions?addSection=true&type=${type}&sectionName=${sectionName}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    router.push(url);
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar user={user} />
      <div className="flex bg-muted/40">
        <Sidebar
          onSelectSection={handleSelectSection}
          onAddSection={handleAddSection}
          isCreatingSection={isCreatingSection}
          setIsCreatingSection={setIsCreatingSection}
        />
        <div className="container mx-auto p-4 overflow-y-scroll h-vh-minus-navbar">
          <h1 className="text-2xl font-bold mb-4">{Constants.YOUR_PROGRESS}</h1>
          <div className="mb-8">
            <Line data={chartData} options={chartOptions} />
          </div>
          <div className="overflow-x-auto overflow-y-scroll">
            <table className="w-full bg-white dark:bg-gray-800">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Score</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {results.map((result) => (
                  <tr
                    key={result.id}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() =>
                      router.push(`/questions?sectionId=${result.section_id}`)
                    }
                  >
                    <td className="py-2 px-4 border-b">
                      {new Date(result.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {result.score.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center mt-4">
              <QuestionsButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
