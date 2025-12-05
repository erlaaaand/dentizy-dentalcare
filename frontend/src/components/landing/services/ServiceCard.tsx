// frontend/src/components/landing/services/ServiceCard.tsx
import { CheckIcon } from "../shared/Icons";

interface ServiceCardProps {
  service: {
    title: string;
    desc: string;
    price: string;
    badge: string;
    badgeColor: string;
    features: string[];
    image: string;
  };
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="group bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      {/* Image */}
      <div className="relative mb-6 overflow-hidden rounded-xl">
        <img
          src={service.image}
          alt={service.title}
          className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Price Badge */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <div className="text-sm font-bold text-blue-600">{service.price}</div>
        </div>

        {/* Quality Badge */}
        <div
          className={`absolute top-4 right-4 ${service.badgeColor} text-white px-3 py-1 rounded-full text-xs font-semibold`}
        >
          {service.badge}
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mr-4">
            <CheckIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
            {service.title}
          </h3>
        </div>

        <p className="text-gray-600 mb-6 leading-relaxed">{service.desc}</p>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {service.features.map((feature, i) => (
            <div key={i} className="flex items-center text-sm text-gray-600">
              <CheckIcon className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all duration-300">
          Buat Janji Temu
        </button>
      </div>
    </div>
  );
}
