import React from 'react';
import { Link } from 'react-router-dom';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, icon, link }) => {
  return (
    <div className="card hover:shadow-lg group">
      <div className="bg-turquoise/10 p-4 rounded-full inline-flex mb-4 group-hover:bg-turquoise/20 transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link to={link} className="btn btn-outline">
        Learn More
      </Link>
    </div>
  );
};

export default ServiceCard;