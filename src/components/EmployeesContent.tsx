'use client';

import React, { useState } from 'react';
import ProfileSnapshot from '@/components/ProfileSnapshot';

const EMPLOYEES = [
  { id: '#FWB127364372', name: 'Hanna Saris', title: 'VP of Sales', start: '03/09/2023', birthday: '03/09/2023' },
  { id: '#FWB125467980', name: 'Omar Dorwart', title: 'Product Manager', start: '03/12/2023', birthday: '03/12/2023' },
  { id: '#FWB139485607', name: 'Chance Levin', title: 'Director of UX', start: '03/19/2023', birthday: '03/19/2023' },
  { id: '#FWB14628462', name: 'Carla Baptista', title: 'Senior Developer', start: '03/22/2023', birthday: '03/22/2023' },
  { id: '#FWB158392847', name: 'Sarah Johnson', title: 'Marketing Manager', start: '03/25/2023', birthday: '03/25/2023' },
  { id: '#FWB167483920', name: 'Mike Chen', title: 'Data Analyst', start: '03/28/2023', birthday: '03/28/2023' },
  { id: '#FWB176592847', name: 'Emma Wilson', title: 'HR Specialist', start: '04/01/2023', birthday: '04/01/2023' },
  { id: '#FWB185601847', name: 'David Brown', title: 'Operations Lead', start: '04/04/2023', birthday: '04/04/2023' },
  { id: '#FWB194710847', name: 'Alex Rodriguez', title: 'Software Engineer', start: '04/07/2023', birthday: '04/07/2023' },
  { id: '#FWB203819847', name: 'Lisa Thompson', title: 'UX Designer', start: '04/10/2023', birthday: '04/10/2023' },
  { id: '#FWB212928847', name: 'James Miller', title: 'Product Analyst', start: '04/13/2023', birthday: '04/13/2023' },
  { id: '#FWB222037847', name: 'Maria Garcia', title: 'Content Strategist', start: '04/16/2023', birthday: '04/16/2023' },
  { id: '#FWB231146847', name: 'Robert Davis', title: 'DevOps Engineer', start: '04/19/2023', birthday: '04/19/2023' },
  { id: '#FWB240255847', name: 'Jennifer Lee', title: 'Business Analyst', start: '04/22/2023', birthday: '04/22/2023' },
  { id: '#FWB249364847', name: 'Michael White', title: 'Frontend Developer', start: '04/25/2023', birthday: '04/25/2023' },
  { id: '#FWB258473847', name: 'Amanda Taylor', title: 'Project Manager', start: '04/28/2023', birthday: '04/28/2023' },
  { id: '#FWB267582847', name: 'Christopher Anderson', title: 'Backend Developer', start: '05/01/2023', birthday: '05/01/2023' },
  { id: '#FWB276691847', name: 'Jessica Martinez', title: 'UI Designer', start: '05/04/2023', birthday: '05/04/2023' },
  { id: '#FWB285700847', name: 'Daniel Clark', title: 'Data Scientist', start: '05/07/2023', birthday: '05/07/2023' },
  { id: '#FWB294809847', name: 'Rachel Green', title: 'Marketing Specialist', start: '05/10/2023', birthday: '05/10/2023' },
  { id: '#FWB303918847', name: 'Kevin Lewis', title: 'QA Engineer', start: '05/13/2023', birthday: '05/13/2023' },
  { id: '#FWB313027847', name: 'Nicole Hall', title: 'Product Owner', start: '05/16/2023', birthday: '05/16/2023' },
  { id: '#FWB322136847', name: 'Steven Allen', title: 'Systems Architect', start: '05/19/2023', birthday: '05/19/2023' },
  { id: '#FWB331245847', name: 'Michelle Young', title: 'Brand Manager', start: '05/22/2023', birthday: '05/22/2023' },
  { id: '#FWB340354847', name: 'Ryan King', title: 'Mobile Developer', start: '05/25/2023', birthday: '05/25/2023' },
  { id: '#FWB349463847', name: 'Stephanie Wright', title: 'Customer Success', start: '05/28/2023', birthday: '05/28/2023' },
  { id: '#FWB358572847', name: 'Thomas Moore', title: 'Sales Director', start: '06/01/2023', birthday: '06/01/2023' },
  { id: '#FWB367681847', name: 'Ashley Johnson', title: 'Product Designer', start: '06/04/2023', birthday: '06/04/2023' },
  { id: '#FWB376790847', name: 'Brandon Smith', title: 'Engineering Manager', start: '06/07/2023', birthday: '06/07/2023' },
  { id: '#FWB385899847', name: 'Lauren Davis', title: 'Content Manager', start: '06/10/2023', birthday: '06/10/2023' },
  { id: '#FWB395008847', name: 'Jason Wilson', title: 'Security Engineer', start: '06/13/2023', birthday: '06/13/2023' },
  { id: '#FWB404117847', name: 'Melissa Brown', title: 'Recruitment Specialist', start: '06/16/2023', birthday: '06/16/2023' },
  { id: '#FWB413226847', name: 'Andrew Garcia', title: 'Financial Analyst', start: '06/19/2023', birthday: '06/19/2023' },
  { id: '#FWB422335847', name: 'Katherine Lee', title: 'Legal Counsel', start: '06/22/2023', birthday: '06/22/2023' },
  { id: '#FWB431444847', name: 'Brian Taylor', title: 'Infrastructure Lead', start: '06/25/2023', birthday: '06/25/2023' },
  { id: '#FWB440553847', name: 'Samantha Anderson', title: 'Event Coordinator', start: '06/28/2023', birthday: '06/28/2023' },
  { id: '#FWB449662847', name: 'Gregory Martinez', title: 'Quality Assurance', start: '07/01/2023', birthday: '07/01/2023' },
  { id: '#FWB458771847', name: 'Victoria Clark', title: 'Public Relations', start: '07/04/2023', birthday: '07/04/2023' },
  { id: '#FWB467880847', name: 'Nathan Rodriguez', title: 'Research Analyst', start: '07/07/2023', birthday: '07/07/2023' },
  { id: '#FWB476989847', name: 'Isabella White', title: 'Training Coordinator', start: '07/10/2023', birthday: '07/10/2023' },
  { id: '#FWB486098847', name: 'Jonathan Thompson', title: 'Network Engineer', start: '07/13/2023', birthday: '07/13/2023' },
  { id: '#FWB495207847', name: 'Sophia Lewis', title: 'Creative Director', start: '07/16/2023', birthday: '07/16/2023' },
  { id: '#FWB504316847', name: 'Matthew Hall', title: 'Supply Chain Manager', start: '07/19/2023', birthday: '07/19/2023' },
  { id: '#FWB513425847', name: 'Olivia Allen', title: 'Compliance Officer', start: '07/22/2023', birthday: '07/22/2023' },
  { id: '#FWB522534847', name: 'Ethan Young', title: 'Database Administrator', start: '07/25/2023', birthday: '07/25/2023' },
  { id: '#FWB531643847', name: 'Ava King', title: 'Business Development', start: '07/28/2023', birthday: '07/28/2023' },
  { id: '#FWB540752847', name: 'Noah Wright', title: 'Technical Writer', start: '08/01/2023', birthday: '08/01/2023' },
  { id: '#FWB549861847', name: 'Mia Moore', title: 'Customer Support Lead', start: '08/04/2023', birthday: '08/04/2023' },
  { id: '#FWB558970847', name: 'Liam Johnson', title: 'Product Marketing', start: '08/07/2023', birthday: '08/07/2023' },
  { id: '#FWB568079847', name: 'Emma Smith', title: 'Data Engineer', start: '08/10/2023', birthday: '08/10/2023' },
  { id: '#FWB577188847', name: 'William Davis', title: 'UX Researcher', start: '08/13/2023', birthday: '08/13/2023' },
  { id: '#FWB586297847', name: 'Sofia Wilson', title: 'Operations Analyst', start: '08/16/2023', birthday: '08/16/2023' },
  { id: '#FWB595406847', name: 'James Brown', title: 'Strategic Planner', start: '08/19/2023', birthday: '08/19/2023' },
  { id: '#FWB604515847', name: 'Charlotte Garcia', title: 'Performance Manager', start: '08/22/2023', birthday: '08/22/2023' },
  { id: '#FWB613624847', name: 'Benjamin Lee', title: 'Innovation Lead', start: '08/25/2023', birthday: '08/25/2023' },
  { id: '#FWB622733847', name: 'Harper Taylor', title: 'Sustainability Officer', start: '08/28/2023', birthday: '08/28/2023' },
  { id: '#FWB631842847', name: 'Mason Anderson', title: 'Digital Transformation', start: '09/01/2023', birthday: '09/01/2023' },
  { id: '#FWB640951847', name: 'Evelyn Martinez', title: 'Change Management', start: '09/04/2023', birthday: '09/04/2023' },
  { id: '#FWB650060847', name: 'Logan Clark', title: 'Talent Acquisition', start: '09/07/2023', birthday: '09/07/2023' },
  { id: '#FWB659169847', name: 'Abigail Rodriguez', title: 'Knowledge Manager', start: '09/10/2023', birthday: '09/10/2023' },
  { id: '#FWB668278847', name: 'Alexander White', title: 'Process Improvement', start: '09/13/2023', birthday: '09/13/2023' },
  { id: '#FWB677387847', name: 'Emily Thompson', title: 'Risk Management', start: '09/16/2023', birthday: '09/16/2023' },
  { id: '#FWB686496847', name: 'Jacob Lewis', title: 'Corporate Communications', start: '09/19/2023', birthday: '09/19/2023' },
  { id: '#FWB695605847', name: 'Madison Hall', title: 'Vendor Relations', start: '09/22/2023', birthday: '09/22/2023' },
  { id: '#FWB704714847', name: 'Michael Allen', title: 'Facilities Manager', start: '09/25/2023', birthday: '09/25/2023' },
  { id: '#FWB713823847', name: 'Elizabeth Young', title: 'Learning & Development', start: '09/28/2023', birthday: '09/28/2023' },
];

export default function EmployeesContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState<typeof EMPLOYEES[0] | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

  const filteredEmployees = EMPLOYEES.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const itemsPerPage = 25; // Increased from 15 to show more rows with scrolling
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handleEmployeeClick = (employee: typeof EMPLOYEES[0]) => {
    setSelectedEmployee(employee);
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
        <div className="border-b border-[#414042] bg-[#1A1D21] flex-shrink-0">
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
                                {employee.id}
                              </td>
                              <td className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                                {employee.name}
                              </td>
                              <td className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {employee.title}
                              </td>
                              <td className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {employee.start}
                              </td>
                              <td className="pl-3 pr-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {employee.birthday}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sticky Pagination */}
              <div className="fixed bottom-0 left-0 right-0 flex items-center py-4 border-t border-[#454446] bg-[#1F2327] z-10" style={{ left: '66px', right: '0px' }}>
                <div className="text-sm text-gray-300 pl-3">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} results
                </div>
                <div className="flex space-x-2 ml-6">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-300 bg-[#1B1D21] border border-[#454446] rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-300 bg-[#1B1D21] border border-[#454446] rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
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