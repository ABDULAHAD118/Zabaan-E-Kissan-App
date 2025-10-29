# Zabaan-E-Kisaan - Smart Farming App

A comprehensive React Native farming application with disease detection, AI chat assistance, and real-time crop price monitoring.

## 🚀 Features

### 🌱 Disease Detection
- AI-powered plant disease identification
- Real-time image analysis
- Comprehensive disease database

### 💬 AI Chat Assistant
- Intelligent farming advice
- Crop management tips
- Weather and farming recommendations

### 📊 Crop Prices (NEW!)
- **Real-time market data** from official sources
- **City-based filtering** for localized prices
- **Live API integration** with your backend
- **Advanced search** for crops and cities
- **Pull-to-refresh** functionality
- **Error handling** with retry mechanisms

## 🔧 Technical Improvements

### TabBar Fixes
- ✅ Fixed iOS tabbar positioning issues
- ✅ Improved cross-platform compatibility
- ✅ Better visual styling and contrast
- ✅ Proper background handling for all platforms

### UI/UX Enhancements
- ✅ Modern, responsive design
- ✅ Consistent color scheme using design tokens
- ✅ Better accessibility and readability
- ✅ Smooth animations and transitions
- ✅ Dark/Light theme support

### API Integration
- ✅ **Cities API**: `http://localhost:8000/cities`
- ✅ **Prices API**: `http://localhost:8000/prices`
- ✅ **City Filtering**: `http://localhost:8000/prices?city={cityId}`
- ✅ Robust error handling and retry logic
- ✅ Network status monitoring

## 📱 Screenshots

### Prices Screen Features
- **Header**: Beautiful gradient design with live data indicator
- **Search**: Intelligent search across crops and cities
- **City Filter**: Horizontal scrollable city selection
- **Price Cards**: Detailed crop information with pricing
- **Real-time Data**: Live updates from your backend API

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- Expo CLI
- React Native development environment

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd Zabaan-E-Kisaan

# Install dependencies
npm install

# Start the development server
npm start
```

### Backend Requirements
Ensure your backend server is running on `http://localhost:8000` with these endpoints:

#### Cities Endpoint
```
GET /cities
Response: Array of city objects with _id and name
```

#### Prices Endpoint
```
GET /prices
GET /prices?city={cityId}
Response: { data: Array of crop price objects }
```

## 🎨 Design System

### Color Palette
- **Primary**: `#16A34A` (Vibrant Green)
- **Secondary**: `#22C55E` (Bright Green)
- **Accent**: `#F59E0B` (Amber)
- **Success**: `#15803D` (Dark Green)
- **Error**: `#DC2626` (Red)

### Typography
- **Title**: Large, bold headings
- **Body**: Readable body text
- **Caption**: Small, descriptive text

## 🔄 Data Flow

1. **App Launch**: Fetches cities and initial crop prices
2. **City Selection**: Updates prices based on selected city
3. **Search**: Filters prices based on user input
4. **Refresh**: Pull-to-refresh updates all data
5. **Error Handling**: Graceful fallbacks with retry options

## 📊 API Response Format

### Cities Response
```json
[
  {
    "_id": "city_id_1",
    "name": "RenalaKhurd"
  }
]
```

### Prices Response
```json
{
  "data": [
    {
      "_id": "68a80acb70444adb55a2fde5",
      "city": "RenalaKhurd",
      "date": "22-08-2025",
      "crop": "67Zucchini (گھیا توری)",
      "min_price": "150",
      "max_price": "200",
      "fqp": "Good",
      "quantity": "Available",
      "scraped_at": "2025-08-22T11:14:35.097000"
    }
  ]
}
```

## 🚀 Performance Features

- **Lazy Loading**: Efficient data fetching
- **Caching**: Smart data management
- **Optimized Rendering**: Minimal re-renders
- **Memory Management**: Proper cleanup and state management

## 🔧 Troubleshooting

### Common Issues

#### API Connection Errors
- Ensure backend server is running on port 8000
- Check network connectivity
- Verify API endpoint responses

#### TabBar Issues
- Clear Metro cache: `npx expo start --clear`
- Restart development server
- Check platform-specific styling

### Debug Mode
```bash
# Enable debug logging
EXPO_DEBUG=1 npm start

# View detailed error logs
npx expo logs
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Expo team for the excellent development platform
- React Native community for continuous improvements
- Farming communities for domain expertise

---

**Built with ❤️ for the farming community**
