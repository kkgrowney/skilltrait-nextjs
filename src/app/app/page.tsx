import NavPrelogin from '@/components/nav_prelogin';

export default function AppPage() {
  return (
    <div className="min-h-screen" style={{backgroundColor: '#1B1D21'}}>
      <NavPrelogin />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">
            Welcome to SkillTrait
          </h1>
          
          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Dashboard
            </h2>
            
            <p className="text-gray-300 mb-6">
              You have successfully logged in to your SkillTrait account. This is your main application dashboard where you can manage your skills, achievements, and awards.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-900 rounded-lg p-4">
                <h3 className="font-medium text-blue-100 mb-2">Skills</h3>
                <p className="text-blue-200 text-sm">Manage and showcase your professional skills</p>
              </div>
              
              <div className="bg-green-900 rounded-lg p-4">
                <h3 className="font-medium text-green-100 mb-2">Achievements</h3>
                <p className="text-green-200 text-sm">Track and display your accomplishments</p>
              </div>
              
              <div className="bg-purple-900 rounded-lg p-4">
                <h3 className="font-medium text-purple-100 mb-2">Awards</h3>
                <p className="text-purple-200 text-sm">Create and share digital awards</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 