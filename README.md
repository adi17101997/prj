HEAD
# Focus & Object Detection Video Proctoring System

A comprehensive AI-powered video proctoring system for online interviews that detects candidate focus, unauthorized objects, and suspicious activities in real-time.

## 🎯 Assignment Completion Status

✅ **All Requirements Implemented:**
- **Frontend Interview Screen**: Professional interface with real-time monitoring
- **Focus Detection**: Advanced face landmark analysis and attention tracking
- **Object Detection**: TensorFlow.js COCO-SSD for phone/book/device detection
- **Backend Integration**: Optional Supabase/Firebase API with localStorage fallback
- **Professional Reporting**: PDF generation with comprehensive analytics
- **Bonus Features**: Eye tracking, drowsiness detection, audio analysis

## 🚀 Quick Demo

1. **Clone and Install**:
```bash
git clone <repository-url>
cd video-proctoring-system
npm install
npm run dev
```

2. **Test the System**:
   - Enter candidate details
   - Allow camera permissions
   - Start monitoring
   - Test focus detection by looking away
   - Test object detection with phone/book
   - Generate PDF report

3. **Sample Report**: Click "Sample CSV" button for assignment submission file

## 📦 Submission Deliverables

- ✅ **GitHub Repository**: Complete source code with documentation
- ✅ **Live Demo**: `npm run dev` for local testing, ready for deployment
- ✅ **Demo Video Script**: See `DEMO_SCRIPT.md` for 2-3 minute demo guide
- ✅ **Sample Reports**: Built-in sample report generator (CSV/PDF)
- ✅ **Installation Guide**: Complete setup and deployment instructions

## 🎯 Features

### Core Functionality
- **Real-time Video Monitoring**: Live video capture and analysis during interviews
- **Automatic Video Recording**: Session recording with download capability
- **Focus Detection**: Tracks candidate attention using advanced face landmark detection
- **Object Detection**: Identifies unauthorized items (phones, books, notes, devices)
- **Multi-face Detection**: Alerts when multiple people are present
- **Eye Tracking & Drowsiness Detection**: Advanced eye closure and alertness monitoring
- **Audio Analysis**: Background noise and unauthorized voice detection
- **Event Logging**: Comprehensive timestamp-based violation tracking
- **Integrity Scoring**: Dynamic scoring system with real-time updates
- **Professional Reports**: Detailed PDF reports with recommendations

### Advanced Features
- **Real-time Alerts**: Immediate notifications for violations
- **Camera Permission Management**: Comprehensive permission handling and status display
- **Audio Level Monitoring**: Real-time audio analysis and speech detection
- **Blink Rate Analysis**: Eye movement and attention tracking
- **Professional UI**: Clean, interviewer-friendly interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Data Persistence**: Session data storage and retrieval
- **Export Capabilities**: PDF report generation with detailed analytics

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Computer Vision**: MediaPipe for face detection and landmark analysis
- **Object Detection**: TensorFlow.js with COCO-SSD model
- **PDF Generation**: jsPDF with html2canvas
- **Icons**: Lucide React
- **Build Tool**: Vite

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Modern web browser with camera access
- Stable internet connection

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd video-proctoring-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Usage

1. **Setup Interview**:
   - Enter candidate name, email, and position
   - Click "Start Interview" to begin

2. **Begin Monitoring**:
   - Allow camera permissions when prompted
   - Click "Start Monitoring" to activate AI detection
   - Monitor real-time detection status and events

3. **Generate Report**:
   - Click "Generate Report" at any time
   - Download comprehensive PDF report
   - View detailed analytics and recommendations

## 🔧 Configuration

### Detection Thresholds
You can modify detection sensitivity in the configuration files:

- **Focus Loss**: 5 seconds (adjustable in `useProctoring.ts`)
- **No Face Detection**: 10 seconds
- **Object Detection Confidence**: 60% minimum
- **Face Detection Confidence**: 50% minimum

### Monitored Objects
The system detects these unauthorized items:
- Mobile phones
- Books and notebooks
- Laptops and computers
- Computer peripherals (mouse, keyboard)

## 📊 Detection Capabilities

### Focus Detection
- **Face Landmark Analysis**: 468-point facial landmark tracking
- **Gaze Direction**: Estimates eye focus direction
- **Head Pose**: Detects head orientation changes
- **Attention Scoring**: Real-time focus percentage calculation

### Eye Tracking & Drowsiness Detection
- **Eye Aspect Ratio (EAR)**: Advanced blink detection algorithm
- **Drowsiness Detection**: Extended eye closure monitoring
- **Blink Rate Analysis**: Abnormal blinking pattern detection
- **Gaze Direction Estimation**: Eye movement tracking

### Audio Analysis
- **Volume Level Monitoring**: Real-time audio level detection
- **Background Noise Detection**: Environmental sound analysis
- **Speech Recognition**: Unauthorized conversation detection
- **Frequency Analysis**: Advanced audio pattern recognition

### Object Detection
- **COCO-SSD Model**: Pre-trained on 80+ object classes
- **Real-time Processing**: 2-second detection intervals
- **Confidence Filtering**: Minimum 60% confidence threshold
- **Suspicious Item Flagging**: Automatic violation logging

### Integrity Scoring
- **Dynamic Calculation**: Real-time score updates
- **Weighted Violations**: Different penalties for violation types
- **Score Ranges**:
  - 80-100%: Excellent integrity
  - 60-79%: Acceptable with minor issues
  - 0-59%: Concerning behavior detected

### Monitored Events
The system detects and logs these violation types:
- **Focus Loss**: Extended periods of inattention (>5 seconds)
- **Face Detection Issues**: No face or multiple faces detected
- **Unauthorized Objects**: Phones, books, notes, electronic devices
- **Drowsiness**: Extended eye closure or signs of fatigue
- **Audio Violations**: Background noise, unauthorized voices
- **Environmental Issues**: Lighting problems, camera obstruction

## 📈 Reporting System

### Generated Reports Include:
- **Candidate Information**: Name, email, position
- **Session Summary**: Duration, total events, integrity score
- **Event Timeline**: Chronological violation history
- **Violation Breakdown**: Categorized event statistics
- **Recommendations**: AI-generated behavioral insights
- **Visual Analytics**: Charts and score breakdowns

### Export Formats:
- **PDF**: Professional formatted reports
- **CSV**: Raw event data for analysis
- **JSON**: Programmatic data access

## 🔒 Privacy & Security

- **Local Processing**: All AI detection runs locally in the browser
- **No Cloud Dependencies**: Computer vision processing is client-side
- **Secure Storage**: Interview data stored locally with encryption options
- **GDPR Compliant**: Data handling follows privacy regulations
- **Minimal Data Collection**: Only essential monitoring data is stored

## 🎨 User Interface

### Design Features:
- **Modern Glassmorphism**: Clean, professional aesthetic
- **Real-time Dashboards**: Live monitoring interfaces
- **Color-coded Alerts**: Visual severity indicators
- **Responsive Layout**: Optimized for all screen sizes
- **Dark Theme**: Eye-friendly for long sessions

### Accessibility:
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Compatible**: ARIA labels and descriptions
- **High Contrast Mode**: Enhanced visibility options
- **Font Scaling**: Adjustable text sizes

## 🧪 Testing

### Browser Compatibility:
- Chrome 90+ (Recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Requirements:
- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Camera**: 720p HD webcam
- **Microphone**: Built-in or external microphone
- **Network**: Stable broadband connection

## 📞 Support

### Common Issues:

**Camera Access Denied**:
- Check browser permissions
- Ensure HTTPS or localhost connection
- Restart browser if needed
- Click "Refresh Page" button in error dialog

**Microphone Issues**:
- Verify microphone permissions in browser
- Check system audio settings
- Ensure microphone is not muted

**Detection Accuracy Issues**:
- Ensure good lighting conditions
- Position camera at eye level
- Maintain 2-3 feet distance from camera
- Minimize background noise for better audio detection

**Performance Issues**:
- Close unnecessary browser tabs
- Use Chrome for best performance
- Ensure stable internet connection
- Disable other applications using camera/microphone

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MediaPipe Team**: Face detection and landmark technology
- **TensorFlow.js**: Object detection capabilities
- **React Team**: Frontend framework
- **Tailwind CSS**: Utility-first styling framework

## 📧 Contact

For questions, support, or collaboration opportunities:
- Email: support@proctoring-system.com
- GitHub: [Repository Issues](https://github.com/username/repo/issues)
- Documentation: [Wiki Pages](https://github.com/username/repo/wiki)

---

Built with ❤️ for secure, fair, and effective online interviews.
# prj
 046eabdab0f4fca71ad5f656b3b32d1d452530e4
