import axios from 'axios';

export const generateQuestionSection = async () => {
  const response = await axios.post('https://api.example.com/generate', {
    // API payload
  });
  return response.data;
};