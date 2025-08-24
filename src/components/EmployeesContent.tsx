'use client';

import React, { useState, useEffect } from 'react';
import ProfileSnapshot from '@/components/ProfileSnapshot';
import { collection, getDocs, doc, getDoc, collectionGroup, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Dynamic employee data structure
interface Employee {
  id: string;
  employeeId: string;
  name: string;
  title: string;
  startDate: any; // Firestore datetime/timestamp
  birthday: string;
  location: string;
  fullTime: boolean;
  isAdmin: boolean;
  photo?: string;
  role?: string;
  skills?: string[];
}

export default function EmployeesContent() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

  // Helper function to format birthday without year
  const formatBirthday = (birthday: string): string => {
    if (!birthday || birthday === 'Unknown' || birthday === 'Invalid Date') return 'Unknown';
    
    try {
      // If it's already in MM/DD/YYYY format, extract MM/DD
      if (birthday.includes('/')) {
        const parts = birthday.split('/');
        if (parts.length >= 2) {
          return `${parts[0]}/${parts[1]}`;
        }
      }
      
      // Try to parse as a date
      const date = new Date(birthday);
      if (!isNaN(date.getTime())) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${month}/${day}`;
      }
      
      return birthday;
    } catch (error) {
      return birthday;
    }
  };

    // Store company connections for lazy loading
  const [companyConnections, setCompanyConnections] = useState<any[]>([]);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch company connections first (fast initial load)
  const fetchCompanyConnections = async () => {
    if (!user?.uid) return;
    
    setIsLoadingConnections(true);
    try {
      console.log('Fetching company connections...');
      
      // Query the top-level connectedCompanies collection to find the current user's company
      const userConnectionsQuery = query(
        collection(db, 'connectedCompanies'),
        where('userRef', '==', doc(db, 'users', user.uid)),
        where('active', '==', true)
      );
      
      const userConnectionsSnapshot = await getDocs(userConnectionsQuery);
      console.log(`Found ${userConnectionsSnapshot.docs.length} active connections for current user`);
      
      if (userConnectionsSnapshot.docs.length === 0) {
        console.log('Current user is not connected to any active company');
        setCompanyConnections([]);
        return;
      }
      
      // Get the company reference from the user's connection
      const userConnection = userConnectionsSnapshot.docs[0];
      const companyRef = userConnection.data().companyReference; // This is a DocumentReference
      const isAdmin = userConnection.data().isAdmin || false; // Check if user is admin
      
      if (!companyRef) {
        console.log('User connection missing companyReference');
        setCompanyConnections([]);
        return;
      }
      
      const companyId = companyRef.id; // Extract the company ID from the document reference
      setCurrentCompanyId(companyId);
      console.log('Current user\'s company ID:', companyId, 'isAdmin:', isAdmin);
      
      // Now query all active connections for this company
      const companyConnectionsQuery = query(
        collection(db, 'connectedCompanies'),
        where('companyReference', '==', companyRef), // Use the DocumentReference directly
        where('active', '==', true)
      );
      
      const companyConnectionsSnapshot = await getDocs(companyConnectionsQuery);
      console.log(`Found ${companyConnectionsSnapshot.docs.length} total active company connections`);
      
      // Store company connections for lazy loading
      const connections = companyConnectionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCompanyConnections(connections);
      console.log('Company connections loaded:', connections);
      
    } catch (error) {
      console.error('Error fetching company connections:', error);
      setCompanyConnections([]);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  // Helper function to convert Firestore timestamps to readable strings
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'Unknown';
    
    // If it's a Firestore timestamp object
    if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
      try {
        const date = new Date(dateValue.seconds * 1000);
        return date.toLocaleDateString('en-US', { 
          month: '2-digit', 
          day: '2-digit', 
          year: 'numeric' 
        });
      } catch (error) {
        return 'Invalid Date';
      }
    }
    
    // If it's already a string, return as is
    if (typeof dateValue === 'string') {
      return dateValue;
    }
    
    // If it's a Date object
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
      });
    }
    
    return 'Unknown';
  };

  // Helper function to format start date (Firestore datetime)
  const formatStartDate = (startDate: any): string => {
    if (!startDate) return 'Unknown';
    
    try {
      // If it's a Firestore timestamp object
      if (startDate && typeof startDate === 'object' && startDate.seconds) {
        const startDateTime = new Date(startDate.seconds * 1000);
        return startDateTime.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      }
      
      // If it's already a string, return as is
      if (typeof startDate === 'string') {
        return startDate;
      }
      
      // If it's a Date object
      if (startDate instanceof Date) {
        return startDate.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      }
      
      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  };

  // Lazy load employees based on pagination
  const loadEmployeesPage = async (page: number, pageSize: number = 10) => {
    if (!companyConnections.length) return;
    
    setIsLoadingMore(true);
    
    try {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const pageConnections = companyConnections.slice(startIndex, endIndex);
      
      console.log(`Loading employees page ${page}: connections ${startIndex} to ${endIndex} of ${companyConnections.length}`);
      console.log(`Page connections:`, pageConnections);
      
      if (pageConnections.length === 0) {
        console.log('No more connections to load');
        return;
      }
      
      const newEmployees: Employee[] = [];
      
      // Fetch user data for this page only
      for (const connection of pageConnections) {
        try {
          const userRef = connection.userRef;
          
          if (!userRef) {
            console.log('Company connection missing userRef:', connection.id);
            continue;
          }
          
          console.log(`Fetching user data for connection:`, connection.id, 'userRef:', userRef);
          
          // Get user data using the userRef
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as any;
            const userId = userDoc.id;
            
            // Create employee object (without skills initially)
            const employee: Employee = {
              id: userId,
              employeeId: userData.employeeID || userData.employeeId || userId,
              name: userData.display_name || userData.displayName || userData.name || 'Unknown User',
              title: userData.currentRole || connection.role || connection.title || 'Employee',
              startDate: connection.startDate || connection.joinDate, // Keep as datetime for proper handling
              birthday: formatDate(userData.birthday || userData.birthDate),
              location: userData.location || userData.city || userData.state || 'Unknown',
              fullTime: connection.fullTime === true,
              isAdmin: connection.isAdmin === true,
              photo: userData.photo_url || userData.photoURL || userData.photo || userData.profilePicture,
              role: connection.role || 'Employee',
              skills: []
            };
            
            newEmployees.push(employee);
            console.log(`Added employee: ${employee.name} (${newEmployees.length}/${pageConnections.length})`);
          } else {
            console.log(`User document not found for userRef:`, userRef);
          }
        } catch (error) {
          console.error(`Error loading employee:`, error);
        }
      }
      
      console.log(`Finished loading page ${page}. New employees: ${newEmployees.length}`);
      
      // Add new employees to existing list
      setEmployees(prev => {
        const updated = [...prev, ...newEmployees];
        console.log(`Total employees after update: ${updated.length}`);
        return updated;
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Initial load of company connections
  useEffect(() => {
    fetchCompanyConnections();
  }, [user]);

  // Load first page of employees when connections are ready
  useEffect(() => {
    if (companyConnections.length > 0 && employees.length === 0) {
      loadEmployeesPage(1, 10); // Load first 10 employees
    }
  }, [companyConnections, employees.length]);

  // Initial load of company connections
  useEffect(() => {
    fetchCompanyConnections();
  }, [user]);

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const itemsPerPage = 25; // Increased from 15 to show more rows with scrolling
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Function to fetch skills for a specific employee
  const fetchEmployeeSkills = async (userId: string): Promise<string[]> => {
    try {
      const skillsRef = collection(db, 'users', userId, 'skills');
      const skillsSnapshot = await getDocs(skillsRef);
      console.log(`Skills snapshot for user ${userId}:`, skillsSnapshot.docs.length, 'skills found');
      
      const skills = skillsSnapshot.docs.map(doc => {
        const skillData = doc.data();
        console.log(`Skill document ${doc.id}:`, skillData);
        return skillData.name; // Get the name field from each skill document
      }).filter(Boolean); // Remove any undefined/null values
      
      console.log(`Final skills for user ${userId}:`, skills);
      return skills;
    } catch (error) {
      console.error(`Error fetching skills for user ${userId}:`, error);
      return [];
    }
  };

  const handleEmployeeClick = async (employee: Employee) => {
    // Fetch skills when employee is selected
    const skills = await fetchEmployeeSkills(employee.id);
    
    // Create updated employee object with skills
    const employeeWithSkills = {
      ...employee,
      skills: skills
    };
    
    setSelectedEmployee(employeeWithSkills);
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = currentEmployees.map(emp => emp.id);
      setSelectedEmployees(new Set(allIds));
    } else {
      setSelectedEmployees(new Set());
    }
  };

  const isAllSelected = currentEmployees.length > 0 && currentEmployees.every(emp => selectedEmployees.has(emp.id));
  const isIndeterminate = currentEmployees.some(emp => selectedEmployees.has(emp.id)) && !isAllSelected;

  return (
    <div className="h-full bg-[#1A1D21] text-white flex font-poppins overflow-hidden">
      {/* Main Content - full width without sidebar */}
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
        {/* Fixed Header */}
        <div className="border-b border-[#414042] bg-[#1A1D21] flex-shrink-0 relative">
          <div className="w-full px-8 pr-0 pl-0">
            <div className="flex items-center pt-2 pb-6">
              {/* Search Component */}
              <div className="relative" style={{ marginTop: '-8px' }}>
                <input
                  type="text"
                  placeholder="Search employees . . ."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
                  style={{borderColor: '#454446', width: 'calc(100% + 48px)'}}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              {/* Filters */}
              <div className="flex gap-2 ml-15">
                <button
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    filter === 'all'
                      ? 'bg-[var(--primary-dark)] text-[#212327]'
                      : 'bg-[#1B1D21] border text-gray-300 hover:text-white'
                  }`}
                  style={{borderColor: filter === 'all' ? 'transparent' : '#454446'}}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    filter === 'active'
                      ? 'bg-[var(--primary-dark)] text-[#212327]'
                      : 'bg-[#1B1D21] border text-gray-300 hover:text-white'
                  }`}
                  style={{borderColor: filter === 'active' ? 'transparent' : '#454446'}}
                  onClick={() => setFilter('active')}
                >
                  Active
                </button>
                <button
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    filter === 'inactive'
                      ? 'bg-[var(--primary-dark)] text-[#212327]'
                      : 'bg-[#1B1D21] border text-gray-300 hover:text-white'
                  }`}
                  style={{borderColor: filter === 'inactive' ? 'transparent' : '#454446'}}
                  onClick={() => setFilter('inactive')}
                >
                  Inactive
                </button>
                <button
                  onClick={() => {
                    setEmployees([]); // Clear existing employees
                    loadEmployeesPage(1, 10); // Reload first page
                  }}
                  disabled={isLoadingConnections}
                  className="px-3 py-1.1.5 text-xs font-medium rounded transition-colors bg-[#00DF71] text-[#212327] hover:bg-[#00E676] disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh employee list"
                >
                  {isLoadingConnections ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Send Props Button - Positioned at left edge of ProfileSnapshot container */}
          <div className="absolute z-50 pl-3" style={{ top: '50%', transform: 'translateY(-50%)', left: 'calc(66.666667% - 24px)', marginTop: '-8px' }}>
            <div className="relative group">
              <button
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  selectedEmployees.size > 0
                    ? 'bg-[#00DF71] text-[#212327] hover:bg-[#00E676]'
                    : 'bg-gray-300 text-[#212327] opacity-50 cursor-not-allowed'
                }`}
                disabled={selectedEmployees.size === 0}
              >
                Send Props
              </button>
              {/* Tooltip */}
              <div className="absolute top-1/2 transform -translate-y-1/2 left-full ml-2 px-3 py-2 bg-[#1F2327] text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[99999]">
                Select one or more users to send props.
                <div className="absolute top-1/2 left-0 transform -translate-x-full -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-[#1F2327]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col px-0 py-0 min-h-0 h-full overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-full min-h-0 overflow-hidden pr-0" style={{ margin: '0', borderRadius: '0' }}>
            {/* Employee List */}
            <div className="lg:col-span-2 flex flex-col min-h-0 h-full overflow-hidden relative">
              {/* Employee Table Container */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                {/* Employee Table */}
                <div className="rounded-none flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="flex-1 flex flex-col justify-between min-h-0 overflow-hidden">
                    <div className="overflow-x-auto overflow-y-auto pb-20" style={{ height: 'calc(100vh - 200px)', maxHeight: 'calc(100vh - 200px)' }}>
                      {isLoadingConnections ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00DF71] mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading company connections...</p>
                          </div>
                        </div>
                      ) : employees.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <p className="text-gray-400 text-lg mb-2">No employees found</p>
                            <p className="text-gray-500 text-sm">Employees will appear here when they join your company</p>
                          </div>
                        </div>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-800">
                        <thead className="bg-[#1B1D21] border-b border-[#3D3C3E] sticky top-0 z-10">
                          <tr>
                            <th className="pl-3 pr-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                className="h-4 w-4 text-[#00DF71] focus:ring-[#00DF71] border-gray-600 rounded bg-[#1B1D21]"
                                style={{ accentColor: '#00DF71' }}
                              />
                            </th>
                            <th className="pl-3 pr-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              EMPLOYEE ID
                            </th>
                            <th className="pl-3 pr-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              NAME
                            </th>
                            <th className="pl-3 pr-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              TITLE
                            </th>
                            <th className="pl-3 pr-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              START DATE
                            </th>
                            <th className="pl-3 pr-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              BIRTHDAY
                            </th>
                            <th className="pl-3 pr-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              LOCATION
                            </th>
                            <th className="pl-3 pr-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              STATUS
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3D3C3E]">
                          {currentEmployees.map((employee) => (
                            <tr 
                              key={employee.id} 
                              className={`bg-[#191D21] hover:bg-[#202327] cursor-pointer transition-colors ${
                                selectedEmployee?.id === employee.id ? 'bg-[#202327]' : ''
                              }`}
                              onClick={() => handleEmployeeClick(employee)}
                            >
                              <td className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                <input
                                  type="checkbox"
                                  checked={selectedEmployees.has(employee.id)}
                                  onChange={(e) => handleSelectEmployee(employee.id, e.target.checked)}
                                  className="h-4 w-4 text-[#00DF71] focus:ring-[#00DF71] border-gray-600 rounded bg-[#1B1D21]"
                                  style={{ accentColor: '#00DF71' }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </td>
                              <td className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {employee.employeeId}
                              </td>
                              <td className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                                {employee.name}
                              </td>
                              <td className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {employee.title}
                              </td>
                              <td className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {formatStartDate(employee.startDate)}
                              </td>
                              <td className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {employee.birthday ? formatBirthday(employee.birthday) : 'Unknown'}
                              </td>
                              <td className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {employee.location}
                              </td>
                              <td className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  employee.fullTime 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-800'
                                }`}>
                                  {employee.fullTime ? 'Full Time' : 'Part Time'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                        )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sticky Pagination */}
              <div className="fixed bottom-0 left-0 right-0 flex items-center py-4 border-t border-[#454446] bg-[#1F2327] z-10" style={{ left: '66px', right: '0px' }}>
                <div className="text-sm text-gray-300 pl-3">
                  Showing {employees.length} of {companyConnections.length} employees
                </div>
                <div className="flex space-x-2 ml-6">
                  {employees.length < companyConnections.length && (
                    <button
                      onClick={() => {
                        const nextPage = Math.floor(employees.length / 10) + 1;
                        console.log(`Load More clicked. Current employees: ${employees.length}, Next page: ${nextPage}`);
                        loadEmployeesPage(nextPage, 10);
                      }}
                      disabled={isLoadingMore}
                      className="px-3 py-2 text-sm font-medium text-gray-300 bg-[#1B1D21] border border-[#454446] rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingMore ? 'Loading...' : `Load More (${companyConnections.length - employees.length} remaining)`}
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Profile Snapshot */}
            <div className="lg:col-span-1 flex flex-col min-h-0 h-full overflow-hidden">
              <ProfileSnapshot employee={selectedEmployee} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 