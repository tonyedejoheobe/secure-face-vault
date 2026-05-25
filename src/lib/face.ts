type FaceApi = typeof import("face-api.js");
let faceapi: FaceApi | null = null;
let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

async function getFaceApi(): Promise<FaceApi> {
  if (faceapi) return faceapi;
  faceapi = await import("face-api.js");
  return faceapi;
}

export async function loadFaceModels() {
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    const fa = await getFaceApi();
    const MODEL_URL = "/models";
    await Promise.all([
      fa.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      fa.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      fa.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
  })();
  return loadingPromise;
}

export async function detectFace(video: HTMLVideoElement) {
  const fa = await getFaceApi();
  return fa
    .detectSingleFace(video, new fa.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
}

export async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}