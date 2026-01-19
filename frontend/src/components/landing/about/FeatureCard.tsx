// frontend/src/components/landing/about/FeatureCard.tsx
interface FeatureCardProps {
  feature: {
    Icon: React.ComponentType<{ className?: string }>;
    title: string;
    desc: string;
  };
}

export function FeatureCard({ feature }: FeatureCardProps) {
  const { Icon, title, desc } = feature;

  return (
    <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <div className="font-bold text-gray-800 text-base mb-1">{title}</div>
        <div className="text-sm text-gray-600">{desc}</div>
      </div>
    </div>
  );
}
