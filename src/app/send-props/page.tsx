import NavPrelogin from '@/components/nav_prelogin';

export default function SendPropsPage() {
  return (
    <div className="min-h-screen" style={{backgroundColor: '#1B1D21'}}>
      <NavPrelogin />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Send Props
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            This is the send-props page with the new nav_prelogin navigation component.
          </p>
        </div>
        
        {/* Add your page content here */}
        <div className="mt-12">
          <div className="bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Page Content
            </h2>
            <p className="text-gray-300">
              This page demonstrates the responsive navigation component with two breakpoints:
            </p>
            <ul className="mt-4 text-gray-300 space-y-2">
              <li>• <strong>Desktop (md and up):</strong> Horizontal navigation with all menu items visible</li>
              <li>• <strong>Mobile (below md):</strong> Hamburger menu that toggles a dropdown with all navigation items</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
} 