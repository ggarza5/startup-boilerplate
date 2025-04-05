'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Result, Section } from '@/app/types';
import { Loader } from '@/components/ui/loader';
import { createClient } from '@/utils/supabase/client';
import { logErrorIfNotProduction, logIfNotProduction } from '../utils/helpers';
import { User } from '@supabase/supabase-js';
import { Navbar } from '../components/ui/Navbar';
import Sidebar from '../components/Sidebar';
import { QuestionsButton } from '../components/QuestionsButton';
import useFetchUser from '../hooks/useFetchUser';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CategoryStats {
  category: string;
  attempts: number;
  avgScore: number;
  sections: Array<{
    id: string;
    name: string;
    score: number;
    createdAt: string;
  }>;
}

const CategoryPerformancePage: React.FC = () => {
  const router = useRouter();
  const [results, setResults] = useState<Result[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { user, loading: userLoading, error, refetch } = useFetchUser();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          // Fetch results
          const resultsResponse = await fetch(`/api/results?userId=${user.id}`);
          const resultsData = await resultsResponse.json();
          setResults(resultsData);

          // Fetch sections
          const supabase = createClient();
          const { data: sectionsData, error: sectionsError } = await supabase
            .from('sections')
            .select('*');

          if (sectionsError) {
            console.error('Error fetching sections:', sectionsError);
          } else {
            setSections(sectionsData || []);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (results.length && sections.length) {
      // Calculate stats by category
      const statsByCategory: Record<string, CategoryStats> = {};

      // Process each result
      results.forEach((result) => {
        const section = sections.find((s) => s.id === result.section_id);
        if (section && section.category) {
          if (!statsByCategory[section.category]) {
            statsByCategory[section.category] = {
              category: section.category,
              attempts: 0,
              avgScore: 0,
              sections: []
            };
          }

          statsByCategory[section.category].attempts++;
          statsByCategory[section.category].sections.push({
            id: section.id,
            name: section.name,
            score: result.score,
            createdAt: result.created_at
          });
        }
      });

      // Calculate average scores
      Object.values(statsByCategory).forEach((stat) => {
        stat.avgScore =
          stat.sections.reduce((sum, section) => sum + section.score, 0) /
          stat.attempts;
      });

      setCategoryStats(Object.values(statsByCategory));
    }
  }, [results, sections]);

  const handleSelectSection = async (
    sectionName: string,
    sectionId: string
  ) => {
    await router.push(`/questions?sectionId=${sectionId}`);
  };

  const handleAddSection = async (
    type: string,
    sectionName: string,
    category?: string
  ) => {
    console.log(
      `CategoryPerformancePage: handleAddSection called with type: ${type}, sectionName: ${sectionName}, category: ${category}`
    );
    let url = `/questions?addSection=true&type=${type}&sectionName=${sectionName}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    router.push(url);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  if (userLoading || loading) {
    return <Loader className="h-screen" />;
  }

  const chartData = {
    labels: categoryStats.map((stat) => stat.category),
    datasets: [
      {
        label: 'Average Score (%)',
        data: categoryStats.map((stat) => stat.avgScore),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Number of Attempts',
        data: categoryStats.map((stat) => stat.attempts),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Performance by Category'
      }
    }
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
          <h1 className="text-2xl font-bold mb-4">Category Performance</h1>
          <div className="mb-8">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {categoryStats.map((stat) => (
              <div
                key={stat.category}
                className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer ${selectedCategory === stat.category ? 'ring-2 ring-orange-500' : ''}`}
                onClick={() => handleCategoryClick(stat.category)}
              >
                <h2 className="text-xl font-semibold mb-2">{stat.category}</h2>
                <div className="text-gray-700 dark:text-gray-300">
                  <p>Attempts: {stat.attempts}</p>
                  <p>Average Score: {stat.avgScore.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>

          {selectedCategory && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">
                {selectedCategory} - Section History
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full bg-white dark:bg-gray-800">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Date</th>
                      <th className="py-2 px-4 border-b">Section</th>
                      <th className="py-2 px-4 border-b">Score</th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    {categoryStats
                      .find((stat) => stat.category === selectedCategory)
                      ?.sections.sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                      .map((section) => (
                        <tr
                          key={section.id}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() =>
                            router.push(`/questions?sectionId=${section.id}`)
                          }
                        >
                          <td className="py-2 px-4 border-b">
                            {new Date(section.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {section.name.split('-')[0]}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {section.score.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-center mt-8">
            <QuestionsButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPerformancePage;
