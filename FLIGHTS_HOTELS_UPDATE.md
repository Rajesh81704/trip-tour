# Flights & Hotels Integration - API Update

## Overview
The package API has been enhanced to support flights and hotel options. This allows travel packages to include specific flight details and hotel accommodations as part of the package offering.

## Model Changes

### Updated Schema

#### New Interfaces

**IFlightOption**
```typescript
interface IFlightOption {
  type: "main" | "internal"; // main for international, internal for domestic
  airline: string;
  flightNumber: string;
  departureCity: string;
  departureAirport: string;
  departureTime: string;        // Format: HH:MM (24-hour)
  departureDate: string;        // Format: YYYY-MM-DD
  arrivalCity: string;
  arrivalAirport: string;
  arrivalTime: string;          // Format: HH:MM (24-hour)
  arrivalDate: string;          // Format: YYYY-MM-DD
  duration: string;             // e.g., "9h 20m"
  class: "economy" | "business" | "first";
  price: number;
  description?: string;
}
```

**IHotelOption**
```typescript
interface IHotelOption {
  location: string;
  hotelName: string;
  nights: number;
  roomType: string;            // e.g., "Deluxe Room", "Suite"
  amenities: string[];         // e.g., ["WiFi", "AC", "TV", "Gym"]
  image?: {
    url: string;
    public_id: string;
  };
  price: number;
  description?: string;
  starRating?: number;         // 1-5 stars
  checkInDate?: string;        // Format: YYYY-MM-DD
  checkOutDate?: string;       // Format: YYYY-MM-DD
}
```

#### Updated IPackage Interface
Added two new optional fields:
- `flights?: IFlightOption[]` - Array of flight options
- `hotels?: IHotelOption[]` - Array of hotel options

## API Changes

### Create Package Endpoint
**POST** `/api/packages`

#### Request Body (FormData)
```json
{
  "title": "Vietnam Adventure Package",
  "description": "...",
  "location": "{\"city\": \"Hanoi\", \"state\": \"Vietnam\", \"destination\": \"North Vietnam\"}",
  "duration": "{\"day\": 8, \"night\": 7}",
  "price": "100000",
  "discount": "10",
  "features": "[\"Adventure\", \"Cultural\"]",
  "highlights": "[\"Halong Bay\", \"Old Quarter\"]",
  "itinerary": "[{\"day\": 1, \"title\": \"Arrival\", \"description\": \"...\"}]",
  "inclusions": "[\"Hotel\", \"Meals\", \"Flights\"]",
  "exclusions": "[\"Travel Insurance\"]",
  "category": "Adventure",
  "flights": "[{\"type\": \"main\", \"airline\": \"VietJet Air\", \"flightNumber\": \"VJ 1806\", ...}]",
  "hotels": "[{\"location\": \"Hanoi\", \"hotelName\": \"Sunway Hotel\", \"nights\": 2, ...}]",
  "images": [file1, file2, ...]
}
```

#### Response
```json
{
  "success": true,
  "package": {
    "_id": "...",
    "title": "Vietnam Adventure Package",
    "flights": [...],
    "hotels": [...],
    ...
  }
}
```

### Update Package Endpoint
**PUT** `/api/packages/:id`

#### Request Body
Same structure as Create. You can update flights and/or hotels along with other package details.

```json
{
  "title": "Updated Title",
  "flights": "[{...}]",
  "hotels": "[{...}]",
  ...
}
```

#### Response
```json
{
  "success": true,
  "package": { ... }
}
```

## Usage Examples

### Example 1: Create Package with Flights

```json
{
  "flights": [
    {
      "type": "main",
      "airline": "VietJet Air",
      "flightNumber": "VJ 1806",
      "departureCity": "Ahmedabad, IN",
      "departureAirport": "AMD",
      "departureTime": "23:50",
      "departureDate": "2026-11-07",
      "arrivalCity": "Ho Chi Minh City, VN",
      "arrivalAirport": "SGN",
      "arrivalTime": "06:20",
      "arrivalDate": "2026-11-08",
      "duration": "9h 20m",
      "class": "economy",
      "price": 25000
    },
    {
      "type": "main",
      "airline": "VietJet Air",
      "flightNumber": "VJ 1925",
      "departureCity": "Hanoi, VN",
      "departureAirport": "HAN",
      "departureTime": "19:00",
      "departureDate": "2026-11-15",
      "arrivalCity": "Ahmedabad, IN",
      "arrivalAirport": "AMD",
      "arrivalTime": "23:10",
      "arrivalDate": "2026-11-15",
      "duration": "8h 10m",
      "class": "economy",
      "price": 24000
    }
  ]
}
```

### Example 2: Create Package with Hotels

```json
{
  "hotels": [
    {
      "location": "Hanoi",
      "hotelName": "Sunway Hotel Hanoi",
      "nights": 2,
      "roomType": "Deluxe Room",
      "amenities": ["WiFi", "Air Conditioning", "TV", "Hot Water"],
      "price": 8000,
      "starRating": 4,
      "checkInDate": "2026-11-08",
      "checkOutDate": "2026-11-10",
      "description": "Modern hotel in the heart of Hanoi with excellent service"
    },
    {
      "location": "Da Nang",
      "hotelName": "FTE Ba Dinh Hotel",
      "nights": 3,
      "roomType": "Superior Room",
      "amenities": ["WiFi", "Gym", "Restaurant", "Beach Access"],
      "price": 12000,
      "starRating": 4,
      "checkInDate": "2026-11-10",
      "checkOutDate": "2026-11-13",
      "description": "Beachfront hotel with stunning sea views"
    }
  ]
}
```

### Example 3: Complete Package with Both Flights and Hotels

```bash
curl -X POST http://localhost:3000/api/packages \
  -F "title=Vietnam Adventure" \
  -F "description=7 days in Vietnam" \
  -F "location={\"city\":\"Hanoi\",\"state\":\"Vietnam\",\"destination\":\"North Vietnam\"}" \
  -F "duration={\"day\":8,\"night\":7}" \
  -F "price=100000" \
  -F "discount=10" \
  -F "features=[\"Adventure\",\"Cultural\"]" \
  -F "highlights=[\"Halong Bay\",\"Old Quarter\"]" \
  -F "category=Adventure" \
  -F "itinerary=[{\"day\":1,\"title\":\"Arrival\",\"description\":\"Arrive in Hanoi\"}]" \
  -F "inclusions=[\"Hotel\",\"Meals\",\"Flights\"]" \
  -F "exclusions=[\"Travel Insurance\"]" \
  -F "flights=[{\"type\":\"main\",\"airline\":\"VietJet\",\"flightNumber\":\"VJ1806\",\"departureCity\":\"Ahmedabad\",\"departureAirport\":\"AMD\",\"departureTime\":\"23:50\",\"departureDate\":\"2026-11-07\",\"arrivalCity\":\"Hanoi\",\"arrivalAirport\":\"HAN\",\"arrivalTime\":\"06:20\",\"arrivalDate\":\"2026-11-08\",\"duration\":\"9h 20m\",\"class\":\"economy\",\"price\":25000}]" \
  -F "hotels=[{\"location\":\"Hanoi\",\"hotelName\":\"Sunway Hotel\",\"nights\":2,\"roomType\":\"Deluxe\",\"amenities\":[\"WiFi\",\"AC\"],\"price\":8000,\"starRating\":4}]" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

## Data Validation

### Flights
- `type`: Required, must be "main" or "internal"
- `airline`: Required string
- `flightNumber`: Required string
- `departureCity`, `arrivalCity`: Required
- `departureAirport`, `arrivalAirport`: Required (IATA codes)
- `departureTime`, `arrivalTime`: Required (HH:MM format)
- `departureDate`, `arrivalDate`: Required (YYYY-MM-DD format)
- `duration`: Required string
- `class`: Optional, defaults to "economy"
- `price`: Required number

### Hotels
- `location`: Required string
- `hotelName`: Required string
- `nights`: Required number
- `roomType`: Required string
- `price`: Required number
- `amenities`: Array of strings (optional, defaults to empty)
- `image`: Optional object with `url` and `public_id`
- `starRating`: Optional number (1-5)
- `checkInDate`, `checkOutDate`: Optional (YYYY-MM-DD format)
- `description`: Optional string

## Database Migration

No migration needed - the `flights` and `hotels` fields default to empty arrays for existing packages.

## Frontend Integration

When sending data from the frontend:
1. Collect flights and hotels as arrays of objects
2. Convert to JSON strings before adding to FormData
3. Pass as JSON string fields

Example (JavaScript):
```javascript
const formData = new FormData();
formData.append('title', packageData.title);
formData.append('flights', JSON.stringify(packageData.flights));
formData.append('hotels', JSON.stringify(packageData.hotels));
formData.append('images', imageFiles);
```

## Backward Compatibility

✅ All existing packages continue to work without modification
✅ Flights and hotels are optional fields
✅ GET endpoints automatically include flights and hotels if present

## Files Modified

- `/src/models/package.model.ts` - Added IFlightOption, IHotelOption interfaces and schema
- `/src/controllers/package.controller.ts` - Updated createPackage and updatePackage to handle flights and hotels

## Testing

Test the new endpoints with:

```bash
# Create package with flights and hotels
POST /api/packages

# Update existing package with new flights/hotels
PUT /api/packages/:id

# Get package details (includes flights and hotels)
GET /api/packages/:id

# List all packages (includes flights and hotels in response)
GET /api/packages
```
