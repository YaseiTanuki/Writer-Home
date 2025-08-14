import Image from 'next/image';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Đang tải...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 md:w-10 md:h-10',
    md: 'w-12 h-12 md:w-16 md:h-16',
    lg: 'w-16 h-16 md:w-20 md:h-20'
  };

  const imageSizes = {
    sm: 32,
    md: 64,
    lg: 80
  };

  return (
    <div className={`text-center ${className}`}>
      <div className={`relative ${sizeClasses[size]} mx-auto mb-4`}>
        <Image
          src="/reading.gif"
          alt="Loading..."
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="rounded-lg w-full h-full object-cover"
        />
      </div>
      {text && (
        <p className="text-gray-300">{text}</p>
      )}
    </div>
  );
}
