export interface BookingConfirmationSMSData {
  phoneNumber: string;
  customerName: string;
  orderNumber: string;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledDate: string;
  driverName?: string;
  driverPhone?: string;
}

export const theSMSWorksService = { 
  sendSMS: () => ({ success: true }),
  sendBookingConfirmation: (data: BookingConfirmationSMSData) => ({ 
    success: true,
    messageId: 'mock-message-id',
    error: null 
  }),
  testConnection: () => ({ 
    success: true,
    message: 'SMS service connection test successful'
  })
}; 

export default theSMSWorksService;
