'use client';

import React, { useState } from 'react';
import ProfileSnapshot from '@/components/ProfileSnapshot';

const EMPLOYEES = [
  { id: '#FWB127364372', name: 'Hanna Saris', title: 'VP of Sales', start: '09 Mar 2023', birthday: '09 Mar 2023' },
  { id: '#FWB125467980', name: 'Omar Dorwart', title: 'Product Manager', start: '12 Mar 2023', birthday: '12 Mar 2023' },
  { id: '#FWB139485607', name: 'Chance Levin', title: 'Director of UX', start: '19 Mar 2023', birthday: '19 Mar 2023' },
  { id: '#FWB14628462', name: 'Carla Baptista', title: 'Senior Developer', start: '22 Mar 2023', birthday: '22 Mar 2023' },
  { id: '#FWB158392847', name: 'Sarah Johnson', title: 'Marketing Manager', start: '25 Mar 2023', birthday: '25 Mar 2023' },
  { id: '#FWB167483920', name: 'Mike Chen', title: 'Data Analyst', start: '28 Mar 2023', birthday: '28 Mar 2023' },
  { id: '#FWB176592847', name: 'Emma Wilson', title: 'HR Specialist', start: '01 Apr 2023', birthday: '01 Apr 2023' },
  { id: '#FWB185601847', name: 'David Brown', title: 'Operations Lead', start: '04 Apr 2023', birthday: '04 Apr 2023' },
  { id: '#FWB194710847', name: 'Alex Rodriguez', title: 'Software Engineer', start: '07 Apr 2023', birthday: '07 Apr 2023' },
  { id: '#FWB203819847', name: 'Lisa Thompson', title: 'UX Designer', start: '10 Apr 2023', birthday: '10 Apr 2023' },
  { id: '#FWB212928847', name: 'James Miller', title: 'Product Analyst', start: '13 Apr 2023', birthday: '13 Apr 2023' },
  { id: '#FWB222037847', name: 'Maria Garcia', title: 'Content Strategist', start: '16 Apr 2023', birthday: '16 Apr 2023' },
  { id: '#FWB231146847', name: 'Robert Davis', title: 'DevOps Engineer', start: '19 Apr 2023', birthday: '19 Apr 2023' },
  { id: '#FWB240255847', name: 'Jennifer Lee', title: 'Business Analyst', start: '22 Apr 2023', birthday: '22 Apr 2023' },
  { id: '#FWB249364847', name: 'Michael White', title: 'Frontend Developer', start: '25 Apr 2023', birthday: '25 Apr 2023' },
  { id: '#FWB258473847', name: 'Amanda Taylor', title: 'Project Manager', start: '28 Apr 2023', birthday: '28 Apr 2023' },
  { id: '#FWB267582847', name: 'Christopher Anderson', title: 'Backend Developer', start: '01 May 2023', birthday: '01 May 2023' },
  { id: '#FWB276691847', name: 'Jessica Martinez', title: 'UI Designer', start: '04 May 2023', birthday: '04 May 2023' },
  { id: '#FWB285700847', name: 'Daniel Clark', title: 'Data Scientist', start: '07 May 2023', birthday: '07 May 2023' },
  { id: '#FWB294809847', name: 'Rachel Green', title: 'Marketing Specialist', start: '10 May 2023', birthday: '10 May 2023' },
  { id: '#FWB303918847', name: 'Kevin Lewis', title: 'QA Engineer', start: '13 May 2023', birthday: '13 May 2023' },
  { id: '#FWB313027847', name: 'Nicole Hall', title: 'Product Owner', start: '16 May 2023', birthday: '16 May 2023' },
  { id: '#FWB322136847', name: 'Steven Allen', title: 'Systems Architect', start: '19 May 2023', birthday: '19 May 2023' },
  { id: '#FWB331245847', name: 'Michelle Young', title: 'Brand Manager', start: '22 May 2023', birthday: '22 May 2023' },
  { id: '#FWB340354847', name: 'Ryan King', title: 'Mobile Developer', start: '25 May 2023', birthday: '25 May 2023' },
  { id: '#FWB349463847', name: 'Stephanie Wright', title: 'Customer Success', start: '28 May 2023', birthday: '28 May 2023' },
  { id: '#FWB358572847', name: 'Thomas Moore', title: 'Sales Director', start: '01 Jun 2023', birthday: '01 Jun 2023' },
  { id: '#FWB367681847', name: 'Ashley Johnson', title: 'Product Designer', start: '04 Jun 2023', birthday: '04 Jun 2023' },
  { id: '#FWB376790847', name: 'Brandon Smith', title: 'Engineering Manager', start: '07 Jun 2023', birthday: '07 Jun 2023' },
  { id: '#FWB385899847', name: 'Lauren Davis', title: 'Content Manager', start: '10 Jun 2023', birthday: '10 Jun 2023' },
  { id: '#FWB395008847', name: 'Jason Wilson', title: 'Security Engineer', start: '13 Jun 2023', birthday: '13 Jun 2023' },
  { id: '#FWB404117847', name: 'Melissa Brown', title: 'Recruitment Specialist', start: '16 Jun 2023', birthday: '16 Jun 2023' },
  { id: '#FWB413226847', name: 'Andrew Garcia', title: 'Financial Analyst', start: '19 Jun 2023', birthday: '19 Jun 2023' },
  { id: '#FWB422335847', name: 'Katherine Lee', title: 'Legal Counsel', start: '22 Jun 2023', birthday: '22 Jun 2023' },
  { id: '#FWB431444847', name: 'Brian Taylor', title: 'Infrastructure Lead', start: '25 Jun 2023', birthday: '25 Jun 2023' },
  { id: '#FWB440553847', name: 'Samantha Anderson', title: 'Event Coordinator', start: '28 Jun 2023', birthday: '28 Jun 2023' },
  { id: '#FWB449662847', name: 'Gregory Martinez', title: 'Quality Assurance', start: '01 Jul 2023', birthday: '01 Jul 2023' },
  { id: '#FWB458771847', name: 'Victoria Clark', title: 'Public Relations', start: '04 Jul 2023', birthday: '04 Jul 2023' },
  { id: '#FWB467880847', name: 'Nathan Rodriguez', title: 'Research Analyst', start: '07 Jul 2023', birthday: '07 Jul 2023' },
  { id: '#FWB476989847', name: 'Isabella White', title: 'Training Coordinator', start: '10 Jul 2023', birthday: '10 Jul 2023' },
  { id: '#FWB486098847', name: 'Jonathan Thompson', title: 'Network Engineer', start: '13 Jul 2023', birthday: '13 Jul 2023' },
  { id: '#FWB495207847', name: 'Sophia Lewis', title: 'Creative Director', start: '16 Jul 2023', birthday: '16 Jul 2023' },
  { id: '#FWB504316847', name: 'Matthew Hall', title: 'Supply Chain Manager', start: '19 Jul 2023', birthday: '19 Jul 2023' },
  { id: '#FWB513425847', name: 'Olivia Allen', title: 'Compliance Officer', start: '22 Jul 2023', birthday: '22 Jul 2023' },
  { id: '#FWB522534847', name: 'Ethan Young', title: 'Database Administrator', start: '25 Jul 2023', birthday: '25 Jul 2023' },
  { id: '#FWB531643847', name: 'Ava King', title: 'Business Development', start: '28 Jul 2023', birthday: '28 Jul 2023' },
  { id: '#FWB540752847', name: 'Noah Wright', title: 'Technical Writer', start: '01 Aug 2023', birthday: '01 Aug 2023' },
  { id: '#FWB549861847', name: 'Mia Moore', title: 'Customer Support Lead', start: '04 Aug 2023', birthday: '04 Aug 2023' },
  { id: '#FWB558970847', name: 'Liam Johnson', title: 'Product Marketing', start: '07 Aug 2023', birthday: '07 Aug 2023' },
  { id: '#FWB568079847', name: 'Emma Smith', title: 'Data Engineer', start: '10 Aug 2023', birthday: '10 Aug 2023' },
  { id: '#FWB577188847', name: 'William Davis', title: 'UX Researcher', start: '13 Aug 2023', birthday: '13 Aug 2023' },
  { id: '#FWB586297847', name: 'Sofia Wilson', title: 'Operations Analyst', start: '16 Aug 2023', birthday: '16 Aug 2023' },
  { id: '#FWB595406847', name: 'James Brown', title: 'Strategic Planner', start: '19 Aug 2023', birthday: '19 Aug 2023' },
  { id: '#FWB604515847', name: 'Charlotte Garcia', title: 'Performance Manager', start: '22 Aug 2023', birthday: '22 Aug 2023' },
  { id: '#FWB613624847', name: 'Benjamin Lee', title: 'Innovation Lead', start: '25 Aug 2023', birthday: '25 Aug 2023' },
  { id: '#FWB622733847', name: 'Harper Taylor', title: 'Sustainability Officer', start: '28 Aug 2023', birthday: '28 Aug 2023' },
  { id: '#FWB631842847', name: 'Mason Anderson', title: 'Digital Transformation', start: '01 Sep 2023', birthday: '01 Sep 2023' },
  { id: '#FWB640951847', name: 'Evelyn Martinez', title: 'Change Management', start: '04 Sep 2023', birthday: '04 Sep 2023' },
  { id: '#FWB650060847', name: 'Logan Clark', title: 'Talent Acquisition', start: '07 Sep 2023', birthday: '07 Sep 2023' },
  { id: '#FWB659169847', name: 'Abigail Rodriguez', title: 'Knowledge Manager', start: '10 Sep 2023', birthday: '10 Sep 2023' },
  { id: '#FWB668278847', name: 'Alexander White', title: 'Process Improvement', start: '13 Sep 2023', birthday: '13 Sep 2023' },
  { id: '#FWB677387847', name: 'Emily Thompson', title: 'Risk Management', start: '16 Sep 2023', birthday: '16 Sep 2023' },
  { id: '#FWB686496847', name: 'Jacob Lewis', title: 'Corporate Communications', start: '19 Sep 2023', birthday: '19 Sep 2023' },
  { id: '#FWB695605847', name: 'Madison Hall', title: 'Vendor Relations', start: '22 Sep 2023', birthday: '22 Sep 2023' },
  { id: '#FWB704714847', name: 'Michael Allen', title: 'Facilities Manager', start: '25 Sep 2023', birthday: '25 Sep 2023' },
  { id: '#FWB713823847', name: 'Elizabeth Young', title: 'Learning & Development', start: '28 Sep 2023', birthday: '28 Sep 2023' },
];

export default function EmployeesContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState<typeof EMPLOYEES[0] | null>(null);

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