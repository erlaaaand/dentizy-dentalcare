import React, { useState, useEffect, useRef } from "react";

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

function LazyImage({ src, alt }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={imgRef}
      className="relative w-full aspect-square overflow-hidden rounded-xl"
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
          } group-hover:scale-105`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
    </div>
  );
}

export default function ServiceCard({ service }) {
  const smoothScrollTo = (e) => {
    e.preventDefault();
    const target = document.querySelector("#kontak");
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="group bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      {/* Image */}
      <div className="relative mb-6 overflow-hidden rounded-xl">
        <LazyImage src={service.image} alt={service.title} />

        {/* Price Badge */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">
          <div className="text-sm font-bold text-blue-600">{service.price}</div>
        </div>

        {/* Quality Badge */}
        <div
          className={`absolute top-4 right-4 ${service.badgeColor} text-white px-3 py-1 rounded-full text-xs font-semibold transform hover:scale-105 transition-transform duration-300`}
        >
          {service.badge}
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
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
            <div
              key={i}
              className="flex items-center text-sm text-gray-600 transform hover:translate-x-1 transition-transform duration-200"
            >
              <CheckIcon className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={smoothScrollTo}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
        >
          Buat Janji Temu
        </button>
      </div>
    </div>
  );
}
