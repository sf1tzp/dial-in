For a SvelteKit + Svelte 5 app, here's how you can add camera OCR as an input alternative:

## Recommended Approach

Use the **Media Capture API** with a cloud OCR service. This works well on mobile browsers without requiring a native app.

### Basic Implementation

```typescript
<script lang="ts">
  let inputValue = $state('');
  let isProcessing = $state(false);
  let fileInput: HTMLInputElement;

  async function handleImageCapture(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    isProcessing = true;

    try {
      // Convert to base64 or form data
      const base64 = await fileToBase64(file);

      // Call your SvelteKit endpoint
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });

      const { text } = await response.json();
      inputValue = text;
    } catch (error) {
      console.error('OCR failed:', error);
    } finally {
      isProcessing = false;
    }
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
</script>

<div>
  <input
    type="text"
    bind:value={inputValue}
    placeholder="Type or scan text..."
  />

  <button
    onclick={() => fileInput.click()}
    disabled={isProcessing}
  >
    {isProcessing ? 'Processing...' : '📷 Scan'}
  </button>

  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    capture="environment"
    onchange={handleImageCapture}
    style="display: none"
  />
</div>
```

### Backend OCR Options

**Option 1: Tesseract.js (Client-Side)**

```bash
npm install tesseract.js
```

```typescript
// In your component
import Tesseract from "tesseract.js";

async function processWithTesseract(file: File) {
  const {
    data: { text },
  } = await Tesseract.recognize(file, "eng");
  return text;
}
```

**Option 2: SvelteKit API Route + Cloud Service**

Create `src/routes/api/ocr/+server.ts`:

```typescript
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const { image } = await request.json();

  // Example with Google Cloud Vision
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: image.split(",")[1] }, // Remove data:image prefix
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      }),
    },
  );

  const data = await response.json();
  const text = data.responses[0]?.fullTextAnnotation?.text || "";

  return json({ text });
};
```

### Key Considerations

1. **The `capture="environment"` attribute** tells mobile browsers to use the back camera by default
2. **Client-side Tesseract.js** works but can be slow on mobile devices (~3-5 seconds)
3. **Cloud APIs** are faster and more accurate but require API keys and incur costs
4. **Progressive enhancement** - the feature degrades gracefully to a file picker on desktop

### Styling Tip

You might want to show a preview of the captured image while processing:

```typescript
let previewUrl = $state<string | null>(null);

function handleImageCapture(event: Event) {
  const file = input.files?.[0];
  if (file) {
    previewUrl = URL.createObjectURL(file);
    // ... rest of processing
  }
}
```
