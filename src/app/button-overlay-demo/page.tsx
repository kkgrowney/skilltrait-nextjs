import CompanyButtonOverlay from '@/components/CompanyButtonOverlay';

export default function ButtonOverlayDemo() {
  // Example image URLs - replace with your actual images
  const demoImages = [
    'https://via.placeholder.com/455x171/4A90E2/FFFFFF?text=Company+Background+1',
    'https://via.placeholder.com/600x225/50C878/FFFFFF?text=Company+Background+2',
    'https://via.placeholder.com/300x113/FF6B6B/FFFFFF?text=Company+Background+3',
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Company Button Overlay Demo
        </h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Large Size (600px width)
            </h2>
            <div className="w-[600px]">
              <CompanyButtonOverlay 
                imageUrl={demoImages[1]}
                altText="Large company background"
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Medium Size (455px width - Original Figma size)
            </h2>
            <div className="w-[455px]">
              <CompanyButtonOverlay 
                imageUrl={demoImages[0]}
                altText="Medium company background"
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Small Size (300px width)
            </h2>
            <div className="w-[300px]">
              <CompanyButtonOverlay 
                imageUrl={demoImages[2]}
                altText="Small company background"
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Responsive Container
            </h2>
            <div className="w-full max-w-md">
              <CompanyButtonOverlay 
                imageUrl={demoImages[0]}
                altText="Responsive company background"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Features
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Font size scales from 10pt to 14pt based on container size</li>
            <li>• 50 different company names randomly selected</li>
            <li>• Responsive design that adapts to different screen sizes</li>
            <li>• Semi-transparent black background with white border</li>
            <li>• Rounded pill-shaped buttons positioned at bottom</li>
            <li>• Based on your Figma design specifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 