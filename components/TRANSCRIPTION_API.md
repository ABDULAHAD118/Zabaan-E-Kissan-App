# Voice Transcription API Setup

The `VoiceRecorder` component requires a backend endpoint for transcribing audio to text, especially for Urdu language support.

## Backend Endpoint Required

The voice recorder sends audio to: `${API_ENDPOINTS.CHAT}/transcribe`

### Request Format:
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**:
  - `audio`: Audio file (M4A format)
  - `language`: Language code (default: "ur" for Urdu)

### Response Format:
```json
{
  "transcript": "transcribed text here",
  // OR
  "text": "transcribed text here"
}
```

## Implementation Options:

### Option 1: Use OpenAI Whisper API
- High accuracy for Urdu
- Requires API key
- Example implementation:
  ```python
  from openai import OpenAI
  client = OpenAI(api_key="your-key")
  
  audio_file = open(audio_path, "rb")
  transcript = client.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file,
    language="ur"
  )
  ```

### Option 2: Use Google Speech-to-Text API
- Good Urdu support
- Requires Google Cloud setup
- More reliable for production

### Option 3: Use Azure Speech Services
- Excellent multilingual support
- Good for Urdu
- Enterprise-grade reliability

### Option 4: Use your own ML model
- Deploy a trained Urdu ASR model
- More control, but requires ML expertise

## Current Implementation

The current implementation will:
1. Record audio using expo-av
2. Send to your backend `/transcribe` endpoint
3. Display transcribed text in the input field
4. Fallback to manual input if transcription fails

## Testing

To test without backend:
1. The component will show an error
2. User can manually type the input
3. Voice recording still works, just needs transcription endpoint

