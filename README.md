# 📱 Modem Diagnostics App

A React Native Expo app for field engineers to monitor and troubleshoot smart meter modem issues.

## 🚀 App Flow

### 1. 📱 Splash Screen (3.5 seconds)
- **Animated Logo**: Fade-in and scale animation
- **Loading Dots**: Visual loading indicator
- **Auto Navigation**: Automatically proceeds to login

### 2. 🔐 Login Screen
- **Centered Login Box**: Clean, modern design
- **Username & Password Fields**: Secure input with validation
- **Demo Credentials**:
  - **Username**: `krishna`
  - **Password**: `Krishna@1`
- **Forgot Password**: Contact admin functionality
- **Loading States**: Visual feedback during authentication

### 3. 📊 Dashboard (After Login)
- **Real-time Statistics**: Connected/Disconnected modems, total issues
- **Trend Indicators**: Shows percentage changes in metrics
- **Error Distribution Chart**: Visual breakdown of error types
- **Quick Actions**: Export data, download logs, refresh
- **Logout Button**: Easy access to sign out

## 🎯 Features

### 📊 Dashboard
- **Summary Cards**: Connected/Disconnected modems, total issues, most common errors
- **Trend Indicators**: Shows percentage changes in metrics
- **Error Distribution Chart**: Visual breakdown of error types
- **Last Update Timestamp**: Shows when data was last refreshed

### 🔧 Quick Actions
- **📊 Export Data**: Exports all modem data to CSV/Excel format
- **📱 Download Logs**: Downloads comprehensive system logs
- **🔄 Refresh**: Updates all dashboard data with pull-to-refresh

### ⚠️ Error Details
- **Filterable List**: Filter by location and error type
- **Detailed Information**: Status, signal strength, reason, location, date
- **Interactive Cards**: Tap for detailed error information

### 🚨 Alerts
- **Severity Filtering**: Filter by High, Medium, Low priority
- **Real-time Alerts**: Live alert notifications
- **Alert Statistics**: Total alerts, high priority, medium priority counts

## 🔐 Authentication

### Login Credentials
- **Username**: `krishna` (case-insensitive)
- **Password**: `Krishna@1` (case-sensitive)

### Security Features
- **Input Validation**: Ensures both fields are filled
- **Loading States**: Prevents multiple login attempts
- **Error Messages**: Clear feedback for invalid credentials
- **Demo Credentials**: Displayed on login screen for easy access

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Smooth Animations**: Fade-in, scale, and loading animations
- **Color-coded Status**: Intuitive status indicators
- **Responsive Layout**: Works on all screen sizes
- **Keyboard Handling**: Proper keyboard avoidance on login

## 📱 Technical Stack

- **React Native Expo**: Cross-platform development
- **React Navigation**: Screen navigation with authentication flow
- **Custom Components**: No external chart libraries
- **Native Share API**: For data export functionality
- **State Management**: React hooks for authentication and local state

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npx expo start
   ```

3. **Run on Device/Simulator**:
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

4. **Login with Demo Credentials**:
   - Username: `krishna`
   - Password: `Krishna@1`

## 📊 Data Export Features

### Export Data
- **CSV Format**: Compatible with Excel and other spreadsheet applications
- **Complete Dataset**: All modem errors, alerts, and statistics
- **Organized Sections**: Errors, Alerts, and Summary data

### Download Logs
- **System Logs**: Application initialization and status
- **Error Logs**: Detailed error information with timestamps
- **Alert Logs**: Alert history with severity levels

## 🔄 Refresh Functionality

- **Pull-to-Refresh**: Swipe down on dashboard to refresh
- **Manual Refresh**: Tap refresh button in Quick Actions
- **Loading States**: Visual feedback during refresh
- **Update Confirmation**: Shows last update time

## 🎯 Use Cases

- **Field Engineers**: Monitor modem connectivity in real-time
- **Backend Teams**: Analyze error patterns and trends
- **Maintenance**: Identify and resolve connectivity issues
- **Reporting**: Export data for analysis and reporting

## 📈 Performance

- **Lightweight**: No heavy external dependencies
- **Fast Loading**: Optimized components and data handling
- **Smooth Animations**: Efficient animations and transitions
- **Memory Efficient**: Proper component lifecycle management

---

**Built with ❤️ for efficient modem diagnostics and field operations** 