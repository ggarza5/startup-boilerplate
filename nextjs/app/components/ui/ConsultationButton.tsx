import React from 'react';

const ConsultationButton: React.FC = () => {
  return (
    <a
      href="/sales"
      className="font-medium text-center py-2 rounded text-white px-4 duration-200 transition-colors bg-[#1fc0f1] hover:bg-[#03a3d7] dark:bg-[#03a3d7] dark:hover:bg-[#00688a]"
    >
      Book Consultation
    </a>
  );
};

export default ConsultationButton;
