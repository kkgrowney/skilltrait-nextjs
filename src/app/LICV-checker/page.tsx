import NavPrelogin from '@/components/nav_prelogin';

export default function LICVCheckerPage() {
  return (
    <div className="min-h-screen" style={{backgroundColor: '#1B1D21'}}>
      <NavPrelogin />
      
      <main>
        {/* Two vertical containers with responsive 12-column grid - full screen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-[calc(100vh-64px)]">
          {/* Left Container - 4 columns on large screens, full width on mobile */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <div className="shadow h-full" style={{backgroundColor: '#212327', padding: '20px'}}>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-4">
                  LICV Checker
                </h1>
                <p className="text-lg text-gray-300">
                  This is the LICV-checker page with the new nav_prelogin navigation component.
                </p>
              </div>
              
              <h2 className="text-2xl font-semibold text-white mb-4">
                Left Container
              </h2>
              <p className="text-gray-300 mb-4">
                This is the left container that takes up 4 columns on large screens and full width on mobile devices.
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
                  <h3 className="text-lg font-medium text-white mb-2">Feature 1</h3>
                  <p className="text-gray-300 text-sm">Description of the first feature in the left container.</p>
                </div>
                <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
                  <h3 className="text-lg font-medium text-white mb-2">Feature 2</h3>
                  <p className="text-gray-300 text-sm">Description of the second feature in the left container.</p>
                </div>
                <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
                  <h3 className="text-lg font-medium text-white mb-2">Feature 3</h3>
                  <p className="text-gray-300 text-sm">Description of the third feature in the left container.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Container - 8 columns on large screens, full width on mobile */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="h-[calc((100vh-64px)/2)] lg:h-full bg-center bg-cover bg-no-repeat" style={{backgroundImage: 'url(\'https://picsum.photos/1200/800?random=3\')'}}>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 