'use client';

import { useState } from 'react';
import { useCustomerIO } from '@/hooks/useCustomerIO';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerIOExample() {
  const { user } = useAuth();
  const { updateCustomer, trackEvent, isLoading, error } = useCustomerIO();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUpdateCustomer = async () => {
    if (!user?.email) {
      alert('User email not available');
      return;
    }

    const customerData = {
      email: user.email,
      name: user.displayName || 'Unknown User',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      // Add any other customer data you want to track
      plan: 'premium',
      signup_source: 'web_app'
    };

    const success = await updateCustomer(user.email, customerData);
    
    if (success) {
      setSuccessMessage('Customer data updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleTrackEvent = async () => {
    if (!user?.email) {
      alert('User email not available');
      return;
    }

    const eventData = {
      event_name: 'profile_updated',
      timestamp: new Date().toISOString(),
      user_id: user.uid,
      // Add any other event data
      page: 'profile_settings'
    };

    const success = await trackEvent(user.email, 'profile_updated', eventData);
    
    if (success) {
      setSuccessMessage('Event tracked successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Customer.io Integration
      </h3>
      
      <div className="space-y-4">
        <button
          onClick={handleUpdateCustomer}
          disabled={isLoading}
          className="px-4 py-2 bg-[#00DF71] text-[#212327] rounded-lg hover:bg-[#0AFB84] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Updating...' : 'Update Customer Data'}
        </button>
        
        <button
          onClick={handleTrackEvent}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Tracking...' : 'Track Profile Update Event'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
          <p className="text-green-300 text-sm">{successMessage}</p>
        </div>
      )}
    </div>
  );
}
