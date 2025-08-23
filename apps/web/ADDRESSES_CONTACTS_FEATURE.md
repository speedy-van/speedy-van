# Addresses & Contacts Feature

## Overview

The Addresses & Contacts feature allows customers to save and manage their frequently used addresses and contacts for quick booking. This feature is part of the Customer Portal and provides a seamless experience for customers to store and reuse their information.

## Features

### Addresses Management
- **Add New Addresses**: Customers can add multiple addresses with detailed information
- **Edit Addresses**: Update existing address details
- **Delete Addresses**: Remove addresses with confirmation
- **Set Default Address**: Mark one address as the default for quick selection
- **Address Details**: Store comprehensive address information including:
  - Label (e.g., "Home", "Office", "Mum's house")
  - Full address (line1, line2, city, postcode)
  - Floor and flat information
  - Lift availability
  - Additional notes/instructions

### Contacts Management
- **Add New Contacts**: Save contact information for booking
- **Edit Contacts**: Update contact details
- **Delete Contacts**: Remove contacts with confirmation
- **Set Default Contact**: Mark one contact as the default
- **Contact Details**: Store contact information including:
  - Label (e.g., "Myself", "Partner", "Work contact")
  - Full name
  - Phone number
  - Email address (optional)
  - Additional notes

## Technical Implementation

### Database Schema

#### Address Model
```prisma
model Address {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  label     String   // e.g., "Home", "Office", "Mum's house"
  line1     String
  line2     String?
  city      String
  postcode  String
  floor     String?  // Floor number or description
  flat      String?  // Flat/apartment number
  lift      Boolean? // Whether lift is available
  notes     String?  // Additional instructions
  isDefault Boolean  @default(false) // Default address for this user
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([userId, isDefault])
}
```

#### Contact Model
```prisma
model Contact {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  label     String   // e.g., "Myself", "Partner", "Work contact"
  name      String
  phone     String
  email     String?
  notes     String?  // Additional notes
  isDefault Boolean  @default(false) // Default contact for this user
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([userId, isDefault])
}
```

### API Endpoints

#### Addresses API (`/api/portal/addresses`)
- `GET` - Fetch all addresses for the authenticated customer
- `POST` - Create a new address
- `PUT` - Update an existing address
- `DELETE` - Delete an address (with ID as query parameter)

#### Contacts API (`/api/portal/contacts`)
- `GET` - Fetch all contacts for the authenticated customer
- `POST` - Create a new contact
- `PUT` - Update an existing contact
- `DELETE` - Delete a contact (with ID as query parameter)

### Components

#### AddressForm Component
- Modal-based form for adding/editing addresses
- Form validation with error handling
- Address autocomplete integration
- Support for all address fields including optional ones

#### ContactForm Component
- Modal-based form for adding/editing contacts
- Form validation with error handling
- Support for all contact fields

#### AddressesPage Component
- Main page for managing addresses and contacts
- Grid layout for displaying saved items
- CRUD operations with confirmation dialogs
- Loading states and error handling

### Security Features
- **Authentication Required**: All endpoints require customer role authentication
- **Data Isolation**: Customers can only access their own addresses and contacts
- **Input Validation**: Comprehensive validation using Zod schemas
- **CSRF Protection**: Built-in Next.js CSRF protection
- **Rate Limiting**: API endpoints are protected by rate limiting

### User Experience Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Loading States**: Shows spinners during API calls
- **Toast Notifications**: Success and error feedback
- **Confirmation Dialogs**: Prevents accidental deletions
- **Default Selection**: Visual indicators for default addresses/contacts
- **Empty States**: Helpful messages when no data exists

## Usage

### For Customers
1. Navigate to the Customer Portal
2. Click on "Addresses & Contacts" in the navigation
3. Add new addresses or contacts using the "Add New" buttons
4. Edit existing items using the edit icons
5. Delete items using the delete icons (with confirmation)
6. Set default items for quick selection during booking

### For Developers
1. The feature is automatically available in the customer portal
2. Test data can be created using the provided script
3. API endpoints are documented and follow REST conventions
4. Components are reusable and well-documented

## Testing

### Test Data Creation
Run the test data creation script:
```bash
npx tsx scripts/create-test-addresses-contacts.ts
```

This will create:
- 3 sample addresses (Home, Office, Mum's House)
- 3 sample contacts (Myself, Partner, Work Contact)

### API Testing
Test the API endpoints:
```bash
# Test addresses endpoint
curl http://localhost:3000/api/portal/addresses

# Test contacts endpoint
curl http://localhost:3000/api/portal/contacts

# Test the test endpoint
curl http://localhost:3000/api/portal/addresses/test
```

## Future Enhancements

### Potential Improvements
1. **Address Validation**: Integration with address validation services
2. **Bulk Operations**: Import/export addresses and contacts
3. **Address History**: Track address usage and suggest frequently used ones
4. **Contact Groups**: Organize contacts into groups (family, work, etc.)
5. **Integration**: Auto-fill booking forms with saved addresses/contacts
6. **Geolocation**: Store coordinates for addresses
7. **Sharing**: Share addresses with other users (with permission)

### Integration Points
- **Booking Flow**: Pre-fill address and contact fields
- **Order Management**: Use saved addresses for delivery
- **Analytics**: Track address/contact usage patterns
- **Notifications**: Use saved contacts for delivery updates

## Dependencies

- **Prisma**: Database ORM and migrations
- **Zod**: Schema validation
- **Chakra UI**: UI components
- **Next.js**: Framework and API routes
- **TypeScript**: Type safety

## Migration

The feature includes a database migration that adds the Address and Contact models:
```bash
npx prisma migrate dev --name add_addresses_and_contacts
```

This migration:
1. Creates the Address and Contact tables
2. Adds indexes for performance
3. Establishes foreign key relationships with the User table
4. Adds the relations to the User model

## Error Handling

The feature includes comprehensive error handling:
- **Validation Errors**: Form validation with user-friendly messages
- **API Errors**: Proper HTTP status codes and error messages
- **Network Errors**: Graceful handling of connection issues
- **Permission Errors**: Clear messages for unauthorized access

## Performance Considerations

- **Database Indexes**: Optimized queries with proper indexing
- **Pagination**: Ready for large datasets (can be implemented)
- **Caching**: Can be extended with Redis caching
- **Lazy Loading**: Components load data on demand
- **Optimistic Updates**: UI updates immediately, syncs with server

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels and descriptions
- **Color Contrast**: Meets WCAG AA standards
- **Focus Management**: Proper focus handling in modals
- **Error Announcements**: Screen reader announcements for errors
