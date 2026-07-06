# Real ML Detection - Setup Guide

## ✅ What's Now Implemented

All detection components now use **real ML models** instead of random mock data:

### 1. **Real Face Detection & Emotion Analysis**
- Uses **MediaPipe Face Landmarker** (468+ facial landmarks)
- Detects emotions: Happy, Sad, Astonished, Neutral
- Analyzes mouth height/width and eye distance
- Real landmark-based analysis (not random cycling)
- Screen: Face Monitor → Shows live face landmarks and emotion

### 2. **Real Pose Detection & Rep Counting**
- Uses **TensorFlow MoveNet Thunder** (17 keypoints COCO format)
- Detects full body in real-time
- **Real rep counting** based on shoulder movement
- Form score from valid keypoints
- Screen: Pose Monitor → Shows skeleton, reps, form score

### 3. **Real Hand Detection & Gesture Recognition**
- Uses **MediaPipe Hand Landmarker** (21 landmarks per hand)
- Detects up to 2 hands simultaneously
- Recognizes gestures: Thumbs Up, Peace, Open Palm, Neutral
- Identifies left/right hand
- Screen: Hand Monitor → Shows hand landmarks and detected gesture

## 🔧 How to Test

### Step 1: Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:3000 (or check terminal for port)

### Step 2: Grant Camera Permission
- Browser will request camera permission
- Click **Allow** to enable real camera access

### Step 3: Test Each Detection

**Face Detection:**
1. Go to **Exercises** → **Face Monitor**
2. Show your face to camera
3. Watch live landmarks appear on canvas
4. See emotion detection (happy, sad, etc.)
5. Click "Save Analysis" to store data

**Pose Detection:**
1. Go to **Exercises** → **Pose Monitor**
2. Stand full body in frame
3. Watch skeleton outline appear
4. Do exercises (push-ups, squats) to count reps
5. See form score and real rep count
6. Click "Save Analysis" to store data

**Hand Detection:**
1. Go to **Exercises** → **Hand Monitor**
2. Raise hands into camera frame
3. Watch hand landmarks and connections appear
4. Try different gestures (thumbs up, peace, open palm)
5. See gesture recognized
6. Click "Save Analysis" to store data

## 📊 Real Data vs Mock Data

### Before (Mock - ❌ Random)
```
- Face: Cycled through emotions every 30 frames (fake)
- Pose: Random keypoints, fake rep counter
- Hand: Random hand detection 50% of time
- Detection didn't match camera input
- Analysis not meaningful
```

### Now (Real - ✅ ML Models)
```
- Face: Real landmarks from your face, real emotion from mouth/eyes
- Pose: Real body keypoints, real rep counting from movement
- Hand: Real 21-point landmarks, real gesture recognition
- Analysis based on actual camera input
- Meaningful health data collection
```

## 🎯 ML Models Used

1. **MediaPipe Face Landmarker** 
   - URL: cdn.jsdelivr.net/@mediapipe/tasks-vision
   - Task file: face_landmarker.task
   - 468+ facial landmarks

2. **MediaPipe Hand Landmarker**
   - URL: cdn.jsdelivr.net/@mediapipe/tasks-vision
   - Task file: hand_landmarker.task
   - 21 landmarks per hand

3. **TensorFlow MoveNet (Thunder)**
   - Models: @tensorflow-models/pose-detection
   - SINGLEPOSE_THUNDER model
   - 17 COCO keypoints

## ⚠️ Requirements

- **Camera**: Device must have working camera
- **Permissions**: Browser must grant camera access
- **Internet**: Models load from CDN on first use
- **Browser**: Modern browser (Chrome, Firefox, Edge, Safari)
- **HTTPS**: Some features require HTTPS in production

## 🔐 Camera Permissions

When you first use any detection feature:
1. Browser shows permission dialog
2. Click **Allow** to enable camera
3. Camera light indicator shows camera is active
4. Deny to skip camera access (but detection won't work)

## 💾 Saving Analysis

Each monitor screen has a **"💾 Save Analysis"** button:
- Requires authentication (Supabase)
- Sends data to backend `/api/*/analysis` endpoint
- Stores: emotion, reps, form score, gesture, timestamp
- Shows confirmation message (green ✅ or red ❌)

## 🐛 Troubleshooting

### Camera not working
- Check browser camera permissions
- Try different browser (Chrome recommended)
- Restart browser
- Check if other apps use camera (close them)

### No landmarks detected
- Move closer to camera
- Ensure good lighting
- Show more of body/face
- Try different camera angle

### Reps not counting
- Move slowly and deliberately
- Keep full body in frame
- Shoulder movement triggers counting
- Different exercise types need different movements

### Models loading slowly
- First time loads ~10-50MB from CDN
- Subsequent uses are cached
- Check internet connection
- Check browser DevTools console for errors

## 📱 Browser Console

To debug, open **DevTools (F12 or Cmd+Option+I)**:
- Check **Console** for error messages
- Look for ✅ "Real Face Detection Initialized"
- Look for ✅ "Real Pose Detection Initialized"
- Look for ✅ "Real Hand Detection Initialized"

## 🚀 Next Steps

1. Test all three detection monitors
2. Try different lighting conditions
3. Test gesture recognition (thumbs up, peace sign)
4. Do exercise movements and watch reps count
5. Save analyses to backend
6. Check backend API logs for data being stored

## 📚 Resources

- MediaPipe Docs: https://developers.google.com/mediapipe
- TensorFlow Pose Detection: https://github.com/tensorflow/tfjs-models/tree/master/pose-detection
- WebRTC Specs: https://webrtc.org/

---

**Status**: All detection systems now use real ML models ✅
**Last Updated**: May 30, 2026
