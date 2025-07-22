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
];

export default function EmployeesPage() {
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

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handleEmployeeClick = (employee: typeof EMPLOYEES[0]) => {
    setSelectedEmployee(employee);
  };

  return (
    <div className="h-screen bg-[#1A1D21] text-white flex font-poppins overflow-hidden">
      {/* Fixed Side Navigation */}
      <aside className="fixed left-0 top-0 bg-[#212327] w-60 h-screen flex flex-col border-r border-[#454446] z-10">
        {/* Top Section */}
        <div className="flex flex-col gap-4 p-3">
          {/* Skill#Trait Logo - negative margin to move up by 51px */}
          <div className="flex items-end justify-center h-24" style={{ marginTop: '-51px' }}>
            <img 
              src="/skilltrait_dark.svg" 
              alt="Skill#Trait" 
              className="h-6 w-auto"
            />
          </div>
          {/* Company Name */}
          <div className="text-center text-gray-300 font-semibold text-base mb-2">Acme, Inc</div>
          {/* Nav Links */}
          <nav className="flex flex-col gap-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 font-medium text-base hover:bg-gray-800">
              <span className="inline-block w-5 h-5 bg-[#D2D5DB] rounded" />
              Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#1A1D21] text-[#00df71] font-medium text-base">
              <span className="inline-block w-5 h-5 bg-[#D2D5DB] rounded" />
              Employees
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 font-medium text-base hover:bg-gray-800">
              <span className="inline-block w-5 h-5 bg-[#D2D5DB] rounded" />
              Companies
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 font-medium text-base hover:bg-gray-800">
              <span className="inline-block w-5 h-5 bg-[#D2D5DB] rounded" />
              Contacts
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 font-medium text-base hover:bg-gray-800">
              <span className="inline-block w-5 h-5 bg-[#D2D5DB] rounded" />
              Notifications
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 font-medium text-base hover:bg-gray-800">
              <span className="inline-block w-5 h-5 bg-[#D2D5DB] rounded" />
              Team
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 font-medium text-base hover:bg-gray-800">
              <span className="inline-block w-5 h-5 bg-[#D2D5DB] rounded" />
              Admin Settings
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content - with left margin to account for fixed sidebar */}
      <div className="flex-1 flex flex-col h-screen min-h-0 overflow-hidden ml-60">
        {/* Header */}
        <div className="border-b border-[#414042] bg-[#1A1D21] flex-shrink-0">
          <div className="w-full px-8">
            <div className="flex items-center py-6">
              <h1 className="text-2xl font-semibold text-white mr-8">Employees</h1>
              {/* Search Component */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search employees . . ."
                  className="w-full px-4 py-3 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
                  style={{borderColor: '#454446', width: 'calc(100% + 48px)'}}
                />
                <div className="absolute inset-y-0 right-3 flex items-center pr-3">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-full min-h-0 overflow-hidden" style={{ margin: '0', borderRadius: '0' }}>
            {/* Employee List */}
            <div className="lg:col-span-2 flex flex-col min-h-0 h-full overflow-hidden">
              {/* Employee Table Container */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Employee Table */}
                <div className="rounded-none flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="flex-1 flex flex-col justify-between min-h-0 overflow-hidden">
                    <div className="overflow-x-auto overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-800">
                        <thead className="bg-[#1B1D21] border-b border-[#3D3C3E]">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              EMPLOYEE ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              NAME
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              TITLE
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              START DATE
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              BIRTHDAY
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3D3C3E]">
                          {filteredEmployees.map((employee) => (
                            <tr 
                              key={employee.id} 
                              className={`bg-[#191D21] hover:bg-[#202327] cursor-pointer transition-colors ${
                                selectedEmployee?.id === employee.id ? 'bg-[#202327]' : ''
                              }`}
                              onClick={() => handleEmployeeClick(employee)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {employee.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                                {employee.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {employee.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {employee.start}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {employee.birthday}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination always visible at the bottom */}
                    <div className="flex items-center justify-between flex-shrink-0 px-6 py-4 border-t border-[#454446] bg-[#1B1D21]">
                      <div className="text-sm text-gray-300">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} results
                      </div>
                      <div className="flex space-x-2">
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