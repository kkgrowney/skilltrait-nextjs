/**
 * Customer.io API Client
 * Handles secure communication with Customer.io API
 */

import { fetchWithTimeout } from '@/lib/server/apiSecurity';

interface CustomerData {
  email: string;
  [key: string]: any; // Allow additional properties
}

interface CustomerIOResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class CustomerIOClient {
  private apiKey: string;
  private siteId: string;
  private baseUrl: string = 'https://track.customer.io/api/v1';

  constructor() {
    this.apiKey = process.env.CUSTOMER_IO_API_KEY || '';
    this.siteId = process.env.CUSTOMER_IO_SITE_ID || '';

  }

  /**
   * Update customer data in Customer.io
   * @param email - Customer email address
   * @param data - Customer data to update
   * @returns Promise<CustomerIOResponse>
   */
  async updateCustomer(email: string, data: CustomerData): Promise<CustomerIOResponse> {
    if (!this.apiKey || !this.siteId) {
      return {
        success: false,
        error: 'Customer.io API credentials not configured'
      };
    }

    try {
      const url = `${this.baseUrl}/customers/${encodeURIComponent(email)}`;

      // Customer.io uses Basic Auth with Site ID and API Key
      const credentials = Buffer.from(`${this.siteId}:${this.apiKey}`).toString('base64');

      if (Object.values(data).some((value) =>
        typeof value === 'string' && new TextEncoder().encode(value).length > 2000
      )) {
        return { success: false, error: 'Customer field exceeds the 2000-byte limit' };
      }

      const response = await fetchWithTimeout(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }, 8_000);

      if (!response.ok) {
        return {
          success: false,
          error: `API Error: ${response.status} - ${response.statusText}`
        };
      }

      const responseData = await response.json();

      return {
        success: true,
        data: responseData
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create or update customer with additional metadata
   * @param email - Customer email address
   * @param data - Customer data including email
   * @returns Promise<CustomerIOResponse>
   */
  async createOrUpdateCustomer(email: string, data: CustomerData): Promise<CustomerIOResponse> {
    // Ensure email is included in the data
    const customerData = {
      ...data,
      email: email
    };

    return this.updateCustomer(email, customerData);
  }

  /**
   * Track customer event
   * @param email - Customer email address
   * @param eventName - Name of the event
   * @param eventData - Event data
   * @returns Promise<CustomerIOResponse>
   */
  async trackEvent(email: string, eventName: string, eventData: any = {}): Promise<CustomerIOResponse> {
    if (!this.apiKey || !this.siteId) {
      return {
        success: false,
        error: 'Customer.io API credentials not configured'
      };
    }

    try {
      const url = `${this.baseUrl}/customers/${encodeURIComponent(email)}/events`;

      // Customer.io uses Basic Auth with Site ID and API Key
      const credentials = Buffer.from(`${this.siteId}:${this.apiKey}`).toString('base64');

      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: eventName,
          data: eventData
        })
      }, 8_000);

      if (!response.ok) {
        return {
          success: false,
          error: `API Error: ${response.status} - ${response.statusText}`
        };
      }

      return {
        success: true,
        data: await response.json()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Export singleton instance
export const customerIO = new CustomerIOClient();

// Export types for use in other files
export type { CustomerData, CustomerIOResponse };
