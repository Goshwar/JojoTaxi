import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen?: boolean;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer, isOpen = false }) => {
  const [expanded, setExpanded] = useState(isOpen);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="w-full flex justify-between items-center py-4 text-left focus:outline-none"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-medium text-gray-900">{question}</h3>
        {expanded ? (
          <ChevronUp size={20} className="text-turquoise" />
        ) : (
          <ChevronDown size={20} className="text-gray-500" />
        )}
      </button>

      <div 
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? 'max-h-96 pb-4' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600">{answer}</p>
      </div>
    </div>
  );
};

export default FaqItem;