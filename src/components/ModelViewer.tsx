import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html, useProgress } from '@react-three/drei';
import { XR, createXRStore } from '@react-three/xr';
import { Loader2, Box, Sparkles, Upload, X, Search, Camera as CameraIcon, Image as ImageIcon, Info, HelpCircle, QrCode, ArrowRight, BookOpen, Download, Eye, EyeOff, FileDown, Layers, Landmark } from 'lucide-react';
import * as THREE from 'three';
import Markdown from 'react-markdown';
// @ts-ignore
import jsQR from 'jsqr';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const store = createXRStore();

interface Asset3D {
  id: string;
  qrCodeValue: string;
  name: string;
  subName?: string;
  location: string;
  description: string;
  url: string;
  infoSections: { title: string; content: string }[];
  funFact: string;
}

const ASSETS_LIST: Asset3D[] = [
  {
    id: 'candi_jago',
    qrCodeValue: 'CANDI_JAGO_MALANG',
    name: 'Candi Jago',
    subName: 'Jajaghu',
    location: 'Tumpang, Malang, Jawa Timur',
    description: 'Kompleks percandian bercorak Hindu-Buddha peninggalan Singasari Abad ke-13.',
    url: 'https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/candijago1.glb',
    infoSections: [
      { title: '🏛️ Sejarah Singkat', content: 'Dibuat sekitar 1268 - 1280 Masehi pada masa pemerintahan Kerajaan Singasari oleh Raja Kertanegara. Ini adalah pendaarmaan untuk memuliakan Sri Jaya Wisnuwardhana (Raja Singasari ke-4).' },
      { title: '☯️ Sinkretisme Agama', content: 'Candi Jago memadukan secara harmonis unsur agama Hindu Syiwa dan Buddha Tantrayana, melambangkan kerukunan murni zaman dahulu.' },
      { title: '🎨 Punden Berundak & Relief', content: 'Strukturnya berupa punden berundak 3 tingkat dengan pahatan relief kisah epik seperti Tantri Kamandaka, Kunjarakarna, dan Arjunawiwaha.' }
    ],
    funFact: 'Semua tokoh relief dipahat menghadap menyamping menyerupai Wayang Kulit, bercorak seni asli Jawa Timur kuno.'
  },
  {
    id: 'arca_amoghapasa',
    qrCodeValue: 'ARCA_AMOGHAPASA',
    name: 'Arca Amoghapasa',
    subName: 'Lokesvara',
    location: 'Museum Nasional (Asal: Candi Jago)',
    description: 'Arca perwujudan Bodhisatwa Amoghapasa dalam agama Buddha Mahayana.',
    url: 'https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/arca_amoghapasa_candi_jago-compressed.glb',
    infoSections: [
      { title: '📜 Tentang Arca', content: 'Arca ini merupakan perwujudan Bodhisatwa Amoghapasa Lokesvara dari Candi Jago, terbuat dari batu andesit berukuran besar dengan detail laksana Dewa yang anggun.' },
      { title: '🎁 Hadiah Bersejarah', content: 'Arca ini dikirimkan oleh Raja Kertanegara dari Singasari ke Kerajaan Melayu (Dharmasraya) di Sumatra Barat pada tahun 1286 Masehi sebagai tanda persahabatan dan persatuan nusantara (Ekspedisi Pamalayu).' },
      { title: '☸️ Atribut Spiritual', content: 'Memiliki delapan lengan yang memegang atribut keagamaan seperti tasbih, kitab, jala, padma, dan busur panah, melambangkan belas kasih tanpa batas.' }
    ],
    funFact: 'Di bagian belakang alas arca ini terdapat Prasasti Amoghapasa yang menceritakan pembuatannya dan ekspedisi persahabatan tersebut.'
  },
  {
    id: 'relief_kunjarakarna_ular',
    qrCodeValue: 'RELIEF_KUNJARAKARNA_ULAR',
    name: 'Relief Kunjarakarna & Ular',
    subName: 'Kisah Kunjarakarnatattwa',
    location: 'Candi Jago (Tingkat 1)',
    description: 'Relief batu candi mengisahkan pertemuan raksasa Kunjarakarna dengan naga raksasa.',
    url: 'https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/kunakarta%20bertemu%20dengan%20ular%20relief-compressed.glb',
    infoSections: [
      { title: '🐍 Kisah Spiritual', content: 'Relief ini memahat bagian penting dari naskah keagamaan Buddha kuno, Kunjarakarnatattwa. Menggambarkan raksasa yaksa bernama Kunjarakarna yang bertemu seekor naga/ular besar di alam penantian ruh.' },
      { title: '🌌 Pesan Moral', content: 'Kisah ini mengajarkan tentang hukum karma dan reinkarnasi. Kunjarakarna mencari pencerahan agar terhindar dari siksa neraka dan lahir kembali dalam wujud yang lebih mulia.' },
      { title: '🎨 Gaya Pahatan', content: 'Pahatan batu yang sangat detail menampilkan flora-fauna tropis Jawa kuno, serta ekspresi raksasa yang tampak takjub namun takzim di hadapan sang ular penunggu.' }
    ],
    funFact: 'Karakter relief diukir sangat mirip wayang kulit, yang menjadi ciri khas ornamen candi periode Jawa Timur.'
  },
  {
    id: 'relief_ukiran_kunjarakarna',
    qrCodeValue: 'RELIEF_UKIRAN_KUNJARAKARNA',
    name: 'Relief Ukiran Kunjarakarna',
    subName: 'Kisah Perjalanan Suci',
    location: 'Candi Jago (Tingkat 1)',
    description: 'Pahatan halus bagian pertama dari epos petualangan batin Kunjarakarna.',
    url: 'https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/kunakarta%20ukiran%20pt%201-compressed.glb',
    infoSections: [
      { title: '📜 Detail Ornamen', content: 'Pahatan panel relief ini menunjukkan detail ukiran bagian pertama dari kisah Kunjarakarna. Menampilkan figur manusia dan lingkungan alam yang digarap dengan presisi estetis tinggi.' },
      { title: '🌲 Lanskap Alam Jawa Kuno', content: 'Di relief ini terlihat representasi hutan, pepohonan rindang, serta gapura-gapura kuno abad ke-13 yang mencerminkan pemandangan nyata wilayah lereng Gunung Semeru kala itu.' },
      { title: '🧠 Kedalaman Filosofi', content: 'Menceritakan tekad bulat Kunjarakarna untuk menemui Dewa Wairocana demi membebaskan sahabatnya, Purnawijaya, dari siksa kawah neraka Yama.' }
    ],
    funFact: 'Ukiran di Candi Jago dipahat secara "low relief" (pahatan tipis) yang menuntut keahlian seniman tingkat tinggi.'
  },
  {
    id: 'tatakan_arca',
    qrCodeValue: 'TATAKAN_ARCA',
    name: 'Tatakan Arca Dewi Buddha',
    subName: 'Padmasana',
    location: 'Koleksi Cagar Budaya Candi Jago',
    description: 'Dudukan suci bermotif teratai ganda untuk penempatan arca dewa-dewi.',
    url: 'https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/tatakan%20arca%20dewi%20budha.glb',
    infoSections: [
      { title: '🪷 Tatakan Padma (Lotus)', content: 'Merupakan dudukan atau landasan suci (asana) yang biasa digunakan untuk meletakkan arca dewi Buddha atau panteon suci lainnya di ruang utama candi.' },
      { title: '🏛️ Ragam Hias Klasik', content: 'Dihiasi dengan ukiran kelopak bunga teratai (padma) ganda di sekeliling pinggirannya, melambangkan kesucian tertinggi dalam filosofi Buddha Tantra.' },
      { title: '🧱 Material Kokoh', content: 'Dipahat dari batu andesit pilihan yang tahan cuaca selama ratusan tahun, membuktikan kekuatan fisik dan nilai seni peninggalan Singasari.' }
    ],
    funFact: 'Bentuk padmasana melambangkan takhta surgawi, memposisikan tokoh spiritual yang bersemayam di atasnya sebagai penolong semesta.'
  },
  {
    id: 'rai_buto',
    qrCodeValue: 'RAI_BUTO',
    name: 'Rai Buto',
    subName: 'Kala / Penjaga Gerbang',
    location: 'Candi Jago, Malang, Jawa Timur',
    description: 'Pahatan wajah raksasa (Kala/Buto) pengusir kekuatan jahat pada gerbang atau dinding candi.',
    url: 'https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/Meshy_AI_Demon_Guardian_Stone__0609171559_texture-compressed.glb',
    infoSections: [
      { title: '👹 Simbol Proteksi', content: 'Ukiran wajah Kala (Rai Buto) biasanya diletakkan di atas ambang pintu masuk atau relung candi untuk melindungi tempat suci dari energi negatif.' },
      { title: '🏺 Karakteristik Seni', content: 'Memiliki mata melotot, taring tajam, dan hiasan rambut lebat menyerupai awan/makara, mencerminkan gaya seni dekoratif khas Jawa kuno.' }
    ],
    funFact: 'Meskipun terlihat menyeramkan, fungsi Rai Buto sebenarnya sangat mulia, yaitu menjaga kesucian tempat ibadah.'
  },
  {
    id: 'arca_manjusri',
    qrCodeValue: 'ARCA_MANJUSRI',
    name: 'Arca Manjusri',
    subName: 'Manjusri',
    location: 'Candi Jago, Malang, Jawa Timur',
    description: 'Arca perwujudan Bodhisatwa Manjusri yang melambangkan kebijaksanaan transendental.',
    url: 'https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/arca%20Manjusri%20(1)-compressed.glb',
    infoSections: [
      { title: '📜 Kebijaksanaan Suci', content: 'Manjusri adalah Bodhisatwa yang melambangkan kebijaksanaan transendental (prajna) dalam tradisi Buddha Mahayana. Arca ini memancarkan ketenangan spiritual yang agung.' },
      { title: '🗡️ Simbol Atribut', content: 'Biasanya digambarkan memegang pedang kebijaksanaan untuk menebas kegelapan batin/kebodohan, serta kitab Prajnaparamita di atas bunga teratai.' },
      { title: '🏺 Detail Estetika', content: 'Memiliki proporsi tubuh yang anggun dengan hiasan kepala mahkota yang rumit, mencerminkan kehalusan gaya pahat batu Kerajaan Singasari.' }
    ],
    funFact: 'Pemujaan Manjusri di Jawa kuno sangat erat kaitannya dengan penyebaran naskah-naskah suci Buddhis dan institusi pendidikan vihara.'
  }
];

const cleanTitle = (text: string) => text.replace(/^[^a-zA-Z0-9\s]+\s*/, '');

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 bg-black/60 rounded-xl backdrop-blur-md text-white shadow-xl">
        <Loader2 className="w-8 h-8 animate-spin mb-2 text-amber-400" />
        <p className="text-sm font-medium whitespace-nowrap">
          Memuat 3D.. {progress.toFixed(0)}%
        </p>
      </div>
    </Html>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onReset?: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-slate-900/95 text-white rounded-2xl border border-slate-800 text-center max-w-md w-full shadow-2xl backdrop-blur-lg">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 border border-rose-500/20">
            <Landmark className="w-6 h-6 text-rose-500" />
          </div>
          <h3 className="text-sm font-semibold tracking-wider text-slate-100 uppercase mb-2">Gagal Memuat Model 3D</h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Model 3D ini gagal dimuat karena kendala jaringan atau browser/perangkat Anda tidak mendukung WebGL.
          </p>
          <div className="w-full text-left bg-slate-950 p-3 rounded-lg border border-slate-800/80 mb-5 overflow-x-auto max-h-24">
            <pre className="text-[10px] text-rose-400 font-mono whitespace-pre-wrap leading-normal">
              {this.state.error?.message || "Unknown rendering or WebGL failure"}
            </pre>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onReset) this.props.onReset();
              }}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold tracking-wider uppercase border border-slate-700 transition-all cursor-pointer"
            >
              Kembali
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-lg text-xs font-bold tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

let isProxyAvailableCache: boolean | null = null;

async function checkProxyAvailability(): Promise<boolean> {
  if (isProxyAvailableCache !== null) return isProxyAvailableCache;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch("/api/model?ping=1", { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        isProxyAvailableCache = !!(data && data.status === "ok");
        return isProxyAvailableCache;
      }
    }
    isProxyAvailableCache = false;
  } catch (e) {
    isProxyAvailableCache = false;
  }
  return isProxyAvailableCache;
}

function ARAssetModelLoader({ resolvedUrl, ...props }: { resolvedUrl: string; [key: string]: any }) {
  const gltf = useGLTF(resolvedUrl);
  
  const modelData = React.useMemo(() => {
    if (!gltf) return null;
    const clonedScene = gltf.scene.clone();
    
    // Reset transforms
    clonedScene.position.set(0, 0, 0);
    clonedScene.scale.set(1, 1, 1);
    clonedScene.rotation.set(0, 0, 0);

    // Compute original bounding box
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    const size = new THREE.Vector3();
    box.getSize(size);
    
    // Normalize scale (fit snugly in a 2.2 unit container)
    const maxDim = Math.max(size.x, size.y, size.z);
    let scaleFactor = 1;
    if (maxDim > 0) {
      const targetSize = 2.2;
      scaleFactor = targetSize / maxDim;
    }
    
    return {
      clonedScene,
      center,
      scaleFactor
    };
  }, [gltf]);

  if (!modelData) return null;

  const { clonedScene, center, scaleFactor } = modelData;

  return (
    <group {...props} dispose={null}>
      <group scale={[scaleFactor, scaleFactor, scaleFactor]}>
        <primitive object={clonedScene} position={[-center.x, -center.y, -center.z]} />
      </group>
    </group>
  );
}

function ARAssetModel({ modelUrl, ...props }: { modelUrl: string; [key: string]: any }) {
  const [resolvedUrl, setResolvedUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    async function determineUrl() {
      const isProxyAvailable = await checkProxyAvailability();
      if (!active) return;
      if (isProxyAvailable) {
        setResolvedUrl(`/api/model?url=${encodeURIComponent(modelUrl)}#model.glb`);
      } else {
        setResolvedUrl(modelUrl);
      }
    }
    determineUrl();
    return () => {
      active = false;
    };
  }, [modelUrl]);

  if (!resolvedUrl) return null;

  return <ARAssetModelLoader resolvedUrl={resolvedUrl} {...props} />;
}

export default function ModelViewer() {
  const [selectedAsset, setSelectedAsset] = useState<Asset3D>(ASSETS_LIST[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [bgMode, setBgMode] = useState<'idle' | 'camera' | 'image'>('idle');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Real AR Tracking & QR scan state
  const [isDetectingTarget, setIsDetectingTarget] = useState(false);
  const [targetDetected, setTargetDetected] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [detectedText, setDetectedText] = useState<string | null>(null);
  const [lastScannedWrong, setLastScannedWrong] = useState<string | null>(null);
  const [showTestMenu, setShowTestMenu] = useState(false);
  const [activeTestTab, setActiveTestTab] = useState<number>(0);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (videoRef.current) {
      if (stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.error("Failed to play video stream:", err);
        });
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  // Real-time canvas processing and QR decoding for Live Cam
  useEffect(() => {
    if (bgMode !== 'camera' || !stream) return;

    let scanTimerId: any;
    const canvasElement = document.createElement('canvas');

    const scanFrame = () => {
      try {
        const video = videoRef.current;
        if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) return;

        // Downscale camera frame for performance and low memory footprint on mobile devices
        let width = video.videoWidth;
        let height = video.videoHeight;
        const maxDimension = 480;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvasElement.width = width;
        canvasElement.height = height;
        const ctx = canvasElement.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);

        const qrDecoder = (jsQR as any)?.default || jsQR;
        if (typeof qrDecoder !== 'function') {
          console.warn("jsQR function is not loaded or incorrect default export.");
          return;
        }

        const code = qrDecoder(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert"
        });

        if (code) {
          const contents = code.data.trim();
          const targetKeyword = contents.toUpperCase();
          
          // Match if it is any of the known assets
          const matchedAsset = ASSETS_LIST.find(asset => 
            targetKeyword.includes(asset.qrCodeValue) || 
            asset.qrCodeValue.includes(targetKeyword)
          );

          if (matchedAsset) {
            setSelectedAsset(matchedAsset);
            setTargetDetected(true);
            setIsDetectingTarget(false);
            setShowInfo(true);
            setDetectedText(contents);
            setLastScannedWrong(null);
            clearInterval(scanTimerId);
          } else {
            // It is some other QR code
            setLastScannedWrong(contents);
          }
        }
      } catch (err) {
        console.error("Failed decoding live frame: ", err);
      }
    };

    scanTimerId = setInterval(scanFrame, 300);
    return () => {
      clearInterval(scanTimerId);
    };
  }, [bgMode, stream]);

  // Quick helper to simulate successful scan for testing / mock verification
  const simulateDetection = (asset: Asset3D = ASSETS_LIST[0]) => {
    setIsDetectingTarget(true);
    setTargetDetected(false);
    setShowInfo(false);
    setLastScannedWrong(null);
    setTimeout(() => {
      setSelectedAsset(asset);
      setIsDetectingTarget(false);
      setTargetDetected(true);
      setShowInfo(true);
      setDetectedText(`${asset.qrCodeValue} (Simulated)`);
    }, 1200);
  };

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      setStream(mediaStream);
      setBgMode('camera');
      setIsDetectingTarget(true); // Start scanning mode visually
      setTargetDetected(false);
      setLastScannedWrong(null);
    } catch (err) {
      console.error("Camera error facingMode: environment:", err);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
        setStream(mediaStream);
        setBgMode('camera');
        setIsDetectingTarget(true);
        setTargetDetected(false);
        setLastScannedWrong(null);
      } catch (fallbackErr) {
        console.error("Fallback camera error:", fallbackErr);
        alert("Akses kamera ditolak atau tidak tersedia. Pastikan memberikan izin kamera.");
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setBgMode('idle');
    setTargetDetected(false);
    setIsDetectingTarget(false);
    setShowInfo(false);
    setLastScannedWrong(null);
    setDetectedText(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Set background image
    const imageUrl = URL.createObjectURL(file);
    setBgImage(imageUrl);
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setBgMode('image');

    setIsDetectingTarget(true);
    setTargetDetected(false);
    setShowInfo(false);
    setLastScannedWrong(null);
    setScanResult(null);

    // Try to read as a QR Code locally first
    const imgElement = new Image();
    imgElement.crossOrigin = "anonymous";
    imgElement.onload = () => {
      const canvasElement = document.createElement('canvas');
      
      // Downscale uploaded image for safe local QR decoding
      let width = imgElement.width;
      let height = imgElement.height;
      const maxDimension = 640;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvasElement.width = width;
      canvasElement.height = height;
      const ctx = canvasElement.getContext('2d');
      if (ctx) {
        ctx.drawImage(imgElement, 0, 0, width, height);
        try {
          const imageData = ctx.getImageData(0, 0, width, height);
          const qrDecoder = (jsQR as any)?.default || jsQR;
          if (typeof qrDecoder !== 'function') {
            console.warn("jsQR function is not loaded or incorrect default export.");
            return;
          }

          const code = qrDecoder(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert"
          });
          
          if (code) {
            const contents = code.data.trim();
            const targetKeyword = contents.toUpperCase();
            
            const matchedAsset = ASSETS_LIST.find(asset => 
              targetKeyword.includes(asset.qrCodeValue) || 
              asset.qrCodeValue.includes(targetKeyword)
            );

            if (matchedAsset) {
              setSelectedAsset(matchedAsset);
              setTargetDetected(true);
              setIsDetectingTarget(false);
              setShowInfo(true);
              setDetectedText(contents);
              return; // Quit early, QR success!
            } else {
              setLastScannedWrong(contents);
              setIsDetectingTarget(false);
              return;
            }
          }
        } catch (e) {
          console.error("Local upload QR decoding error: ", e);
        }
      }
      
      // If no QR was found or matched, we fallback to our AI image API scan!
      runAiScan(file);
    };
    imgElement.src = imageUrl;
  };

  const runAiScan = (file: File) => {
    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      try {
        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: dataUrl,
            mimeType: file.type,
          }),
        });
        const data = await response.json();
        if (data.result) {
          setScanResult(data.result);
          
          const resultUpper = data.result.toUpperCase();
          let matchedAsset = ASSETS_LIST[0]; // default fallback
          
          if (resultUpper.includes('AMOGHAPASA')) {
            matchedAsset = ASSETS_LIST.find(a => a.id === 'arca_amoghapasa') || ASSETS_LIST[0];
          } else if (resultUpper.includes('ULAR') || resultUpper.includes('SNAKE') || resultUpper.includes('NAGA')) {
            matchedAsset = ASSETS_LIST.find(a => a.id === 'relief_kunjarakarna_ular') || ASSETS_LIST[0];
          } else if (resultUpper.includes('UKIRAN') || (resultUpper.includes('KUNJARAKARNA') && !resultUpper.includes('ULAR'))) {
            matchedAsset = ASSETS_LIST.find(a => a.id === 'relief_ukiran_kunjarakarna') || ASSETS_LIST[0];
          } else if (resultUpper.includes('TATAKAN') || resultUpper.includes('BUDHA') || resultUpper.includes('DEWI')) {
            matchedAsset = ASSETS_LIST.find(a => a.id === 'tatakan_arca') || ASSETS_LIST[0];
          } else if (resultUpper.includes('BUTO') || resultUpper.includes('RAI') || resultUpper.includes('DEMON') || resultUpper.includes('GUARDIAN') || resultUpper.includes('KALA')) {
            matchedAsset = ASSETS_LIST.find(a => a.id === 'rai_buto') || ASSETS_LIST[0];
          } else if (resultUpper.includes('MANJUSRI')) {
            matchedAsset = ASSETS_LIST.find(a => a.id === 'arca_manjusri') || ASSETS_LIST[0];
          } else if (resultUpper.includes('JAGO') || resultUpper.includes('SINGASARI') || resultUpper.includes('MALANG')) {
            matchedAsset = ASSETS_LIST.find(a => a.id === 'candi_jago') || ASSETS_LIST[0];
          } else {
            matchedAsset = selectedAsset || ASSETS_LIST[0];
          }

          setSelectedAsset(matchedAsset);
          setTargetDetected(true);
          setIsDetectingTarget(false);
          setShowInfo(true);
          setDetectedText(`Gemini AI memindai: ${matchedAsset.name}`);
        } else {
          setScanResult("Gagal memindai gambar.");
          setIsDetectingTarget(false);
        }
      } catch (err) {
        setScanResult("Terjadi kesalahan saat memindai gambar.");
        setIsDetectingTarget(false);
      } finally {
        setIsScanning(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full h-full bg-[#0c0d0e] overflow-hidden flex flex-col font-sans">
      
      {/* --- BACKGROUND LAYER --- */}
      {bgMode === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="text-center max-w-sm px-6 animate-fade-in">
            <div className="w-40 h-40 mx-auto mb-8 rounded-full overflow-hidden border border-slate-800 relative shadow-xl">
               <img src="https://travelspromo.com/wp-content/uploads/2024/08/Bangunan-Candi-Jago-Chris-Arsen.jpg" alt="Target AR" className="w-full h-full object-cover opacity-80" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </div>

            <h2 className="text-2xl font-light tracking-widest text-slate-100 uppercase mb-3">AR Portal Candi Jago</h2>
            <div className="h-px w-12 bg-amber-500/50 mx-auto mb-6" />
            <p className="text-slate-400 mb-10 leading-relaxed text-xs tracking-wider uppercase font-light">
              Pindai QR Code cagar budaya untuk memproyeksikan artefak 3D secara interaktif dan mempelajari sejarahnya.
            </p>
          </div>
        </div>
      )}

      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
          bgMode === 'camera' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${
          targetDetected ? 'blur-md brightness-40 scale-105' : 'blur-none brightness-100'
        }`} 
      />

      {bgMode === 'image' && bgImage && (
        <img 
          src={bgImage} 
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
            targetDetected ? 'blur-md brightness-40 scale-105' : 'blur-none brightness-100'
          }`} 
          alt="AR Target" 
        />
      )}

      {/* --- 3D CANVAS LAYER --- */}
      <div className={`absolute inset-0 z-10 w-full h-full transition-opacity duration-1000 ${targetDetected ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full pointer-events-auto flex items-center justify-center">
          <ErrorBoundary key={selectedAsset.id + "_" + targetDetected} onReset={stopCamera}>
            <Canvas camera={{ position: [0, 1.2, 3.8], fov: 45 }} gl={{ alpha: true }}>
              <XR store={store}>
                <ambientLight intensity={0.65} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
                <directionalLight position={[-10, 10, -5]} intensity={0.8} color="#90b0d0" />
                
                <Suspense fallback={<Loader />}>
                  {(bgMode === 'camera' || bgMode === 'image') && targetDetected && (
                    <ARAssetModel modelUrl={selectedAsset.url} />
                  )}
                  <Environment preset="city" />
                  <OrbitControls 
                    enablePan={false}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={1.2}
                    maxDistance={6}
                    target={[0, 0, 0]}
                  />
                </Suspense>
              </XR>
            </Canvas>
          </ErrorBoundary>
        </div>
      </div>
      
      {/* --- REAL-TIME SCANNING & MISMATCH WARNINGS --- */}
      {lastScannedWrong && (
        <div className="absolute top-24 left-4 right-4 z-30 flex justify-center pointer-events-none">
          <div className="px-5 py-3 bg-slate-900/95 border border-rose-900/40 backdrop-blur-md rounded-xl text-center shadow-xl max-w-sm pointer-events-auto">
            <span className="text-xs font-semibold text-rose-400 tracking-wider block mb-1 uppercase">Sinyal QR Tidak Dikenal</span>
            <span className="text-xs text-slate-300 font-mono block mb-1 break-all">"{lastScannedWrong}"</span>
            <p className="text-[10px] text-slate-400">Silakan gunakan menu "Katalog QR" untuk melihat daftar kode yang valid.</p>
          </div>
        </div>
      )}

      {/* --- VIEWFINDER OVERLAY --- */}
      {(bgMode === 'camera' || bgMode === 'image') && (
        <div className="absolute inset-0 z-0 pointer-events-none flex flex-col items-center justify-center">
           <div className={`w-64 h-64 border transition-all duration-500 rounded-2xl relative ${targetDetected ? 'border-emerald-500/55 bg-emerald-950/20' : 'border-white/10'}`}>
               <div className={`absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 transition-colors duration-500 ${targetDetected ? 'border-emerald-400' : 'border-white/40'}`} />
               <div className={`absolute -top-px -right-px w-5 h-5 border-t-2 border-r-2 transition-colors duration-500 ${targetDetected ? 'border-emerald-400' : 'border-white/40'}`} />
               <div className={`absolute -bottom-px -left-px w-5 h-5 border-b-2 border-l-2 transition-colors duration-500 ${targetDetected ? 'border-emerald-400' : 'border-white/40'}`} />
               <div className={`absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 transition-colors duration-500 ${targetDetected ? 'border-emerald-400' : 'border-white/40'}`} />
               
               {isDetectingTarget && (
                 <div className="absolute inset-0 flex items-center justify-center">
                     <div className="flex flex-col items-center px-4 py-2 bg-slate-950/80 backdrop-blur-sm rounded-lg border border-slate-800">
                          <Loader2 className="w-4 h-4 text-slate-300 animate-spin mb-1" />
                          <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Mencari Kode...</span>
                     </div>
                 </div>
               )}

               {targetDetected && (
                 <div className="absolute top-4 left-1/2 -translate-x-1/2">
                    <div className="px-3 py-1 bg-emerald-500 text-[10px] tracking-wider uppercase font-bold text-white shadow-md">
                      Terdeteksi
                    </div>
                 </div>
               )}
           </div>
        </div>
      )}
      
      {/* --- UI OVERLAY TOP --- */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 pointer-events-none flex justify-between items-start bg-gradient-to-b from-slate-950/80 to-transparent pt-8">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-slate-900/80 backdrop-blur-md rounded border border-slate-800 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[10px] font-semibold text-slate-300 tracking-widest uppercase">Candi Jago AR</span>
          </div>
          <h2 className="text-lg md:text-xl font-light tracking-wide text-slate-100 uppercase">
            {targetDetected ? selectedAsset.name : "Pemindai Artefak"}
          </h2>
        </div>
        
        <div className="flex gap-2.5">
          <button 
            onClick={() => setShowInfo(true)}
            disabled={!targetDetected}
            className={`pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
              targetDetected 
                ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 border-amber-600/20 shadow-lg shadow-amber-500/10' 
                : 'bg-slate-950/40 text-slate-600 border-white/5 cursor-not-allowed'
            }`}
            title="Deskripsi Artefak"
          >
            <BookOpen className="w-4.5 h-4.5" />
          </button>
          
          {bgMode !== 'idle' && (
            <button 
              onClick={stopCamera}
              className="pointer-events-auto w-10 h-10 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-full flex items-center justify-center border border-slate-800 text-slate-300 transition-all"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>
      
      {/* --- UI OVERLAY BOTTOM / ACTIONS --- */}
      <div className="absolute bottom-8 left-0 right-0 z-20 pointer-events-none flex flex-col items-center gap-6">
        
        {/* Interaction hints */}
        {bgMode !== 'idle' && targetDetected && (
            <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-lg flex items-center justify-center gap-3 text-[10px] tracking-wider uppercase font-medium text-slate-400 border border-slate-800 shadow-xl">
                <span>Seret untuk Rotasi</span>
                <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                <span>Cubit untuk Zoom</span>
            </div>
        )}

        {/* Action Buttons */}
        <div className="pointer-events-auto flex flex-wrap justify-center gap-2.5 max-w-md px-4">
            <button 
                onClick={startCamera}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase shadow-lg transition-all active:scale-95 border ${
                    bgMode === 'camera' 
                    ? 'bg-amber-500 text-amber-950 border-amber-400/20 hover:bg-amber-400' 
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                }`}
            >
                <CameraIcon className="w-3.5 h-3.5" />
                <span>Kamera Aktif</span>
            </button>
            
            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase shadow-lg transition-all active:scale-95 border ${
                    bgMode === 'image' || isScanning
                    ? 'bg-amber-500 text-amber-950 border-amber-400/20 hover:bg-amber-400' 
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                }`}
            >
                {isScanning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                    <Upload className="w-3.5 h-3.5" />
                )}
                <span>Unggah Foto</span>
            </button>
            <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
            />

            <button 
                onClick={() => setShowTestMenu(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase bg-slate-900 hover:bg-slate-850 text-amber-400 border border-slate-800 shadow-lg transition-all active:scale-95"
            >
                <QrCode className="w-3.5 h-3.5" />
                <span>Katalog QR</span>
            </button>
        </div>
      </div>

      {/* --- SCAN RESULT MODAL --- */}
      {scanResult && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 z-50 pointer-events-auto">
          <div className="bg-slate-900 sm:border border-slate-800 rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800 shrink-0">
               <h3 className="text-lg font-light tracking-wide text-slate-100 uppercase flex items-center gap-3">
                 <span>Hasil Analisis AI</span>
               </h3>
               <button 
                 onClick={() => setScanResult(null)}
                 className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
               >
                 <X className="w-4 h-4" />
               </button>
            </div>
            
            <div className="text-slate-300 text-xs sm:text-sm leading-relaxed overflow-y-auto pr-2 pb-8">
              <Markdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-lg font-semibold mt-4 mb-2 text-white uppercase tracking-wider" {...props}/>,
                  h2: ({node, ...props}) => <h2 className="text-base font-semibold mt-4 mb-2 text-white uppercase tracking-wider" {...props}/>,
                  h3: ({node, ...props}) => <h3 className="text-sm font-semibold mt-4 mb-2 text-white uppercase tracking-wider" {...props}/>,
                  p: ({node, ...props}) => <p className="mb-4 text-slate-400 leading-relaxed" {...props}/>,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1 text-slate-400" {...props}/>,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-slate-400" {...props}/>,
                  li: ({node, ...props}) => <li className="mb-1" {...props}/>,
                  strong: ({node, ...props}) => <strong className="font-semibold text-amber-500" {...props}/>,
                }}
              >
                {scanResult}
              </Markdown>
            </div>
          </div>
        </div>
      )}

      {/* --- ANIMATED INFORMATION POP-UP (Floating Window) --- */}
      <div 
        className={`absolute z-30 transition-all duration-500 ease-out pointer-events-none
          sm:top-24 sm:right-6 sm:bottom-24 sm:w-[26rem] sm:left-auto
          bottom-0 left-0 right-0 max-h-[45vh] sm:max-h-none
          flex flex-col ${
            showInfo && targetDetected
              ? 'translate-x-0 translate-y-0 opacity-100 scale-100' 
              : 'sm:translate-x-12 translate-y-full opacity-0 sm:scale-95'
          }`}
      >
        <div className="bg-slate-950/85 backdrop-blur-xl border-t sm:border border-slate-800 rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 h-full flex flex-col shadow-2xl pointer-events-auto relative overflow-hidden">
          
          {/* Close button inside the window */}
          <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
            <button 
              onClick={() => setShowInfo(false)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-all cursor-pointer"
              aria-label="Tutup Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title Header */}
          <div className="shrink-0 mb-4 pr-8 font-sans">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 rounded border border-slate-800 mb-1.5">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              <span className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase">Detail Artefak</span>
            </div>
            <h3 className="text-base sm:text-lg font-light tracking-wide text-white uppercase leading-tight">
              {selectedAsset.name} {selectedAsset.subName && <span className="text-amber-500 font-normal text-xs block sm:inline sm:ml-1">({selectedAsset.subName})</span>}
            </h3>
            <p className="text-slate-500 font-medium mt-1 text-[10px] uppercase tracking-wider">
              Situs: {selectedAsset.location}
            </p>
          </div>

          {/* Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-5 text-slate-300 text-xs leading-relaxed font-sans">
            {selectedAsset.infoSections.map((section, idx) => (
              <div key={idx} className={idx > 0 ? "border-t border-slate-900 pt-3" : ""}>
                <h4 className="text-amber-500 font-semibold text-[11px] tracking-wider uppercase mb-1.5">
                  {section.title}
                </h4>
                <p className="text-slate-400">
                  {section.content}
                </p>
              </div>
            ))}

            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800 text-[11px] text-slate-400 leading-normal">
              <span className="font-semibold text-amber-500 uppercase tracking-wider text-[10px] block mb-1">Catatan Kurasi:</span> {selectedAsset.funFact}
            </div>
          </div>

          {/* Footer Interactive Actions */}
          <div className="shrink-0 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-500">
            <span>Interaksi: Sentuh & Geser Model 3D</span>
            <button 
              onClick={() => setShowInfo(false)}
              className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-4 py-1.5 rounded-lg text-xs transition-all active:scale-95 cursor-pointer"
            >
              Jelajah 3D
            </button>
          </div>
        </div>
      </div>

      {/* --- MENU UJI COBA QR MODAL (PREMIUM MULTI-QR DASHBOARD) --- */}
      {showTestMenu && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 z-50 pointer-events-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 w-full max-w-2xl h-[85vh] max-h-[750px] shadow-2xl flex flex-col relative overflow-hidden">
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 shrink-0 relative z-10">
               <h3 className="text-sm font-light tracking-widest text-slate-100 uppercase flex items-center gap-2.5">
                 <QrCode className="w-4 h-4 text-amber-500" />
                 <span>Katalog Kode QR & Simulasi</span>
               </h3>
               <button 
                 onClick={() => setShowTestMenu(false)}
                 className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors cursor-pointer"
               >
                 <X className="w-4 h-4" />
               </button>
            </div>

            {/* Instruction Banner */}
            <div className="bg-slate-950/85 rounded-lg p-3.5 border border-slate-800 mb-4 shrink-0 relative z-10 text-xs text-slate-400 leading-relaxed font-sans">
              Setiap cagar budaya memiliki <strong className="text-amber-500 font-semibold">QR Code khusus</strong>. Pindai dengan kamera aktif di perangkat Anda, atau pilih objek di tab bawah untuk menampilkan QR Code serta melakukan simulasi deteksi instan.
            </div>

            {/* Tab Selection Row (Horizontal Scroll) */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 shrink-0 relative z-10 scrollbar-thin scrollbar-thumb-slate-800">
              {ASSETS_LIST.map((asset, idx) => (
                <button
                  key={asset.id}
                  onClick={() => setActiveTestTab(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex-shrink-0 border ${
                    activeTestTab === idx
                      ? 'bg-amber-500 text-amber-950 border-amber-400/20 shadow-md shadow-amber-500/5'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border-transparent'
                  }`}
                >
                  {asset.name}
                </button>
              ))}
            </div>

            {/* Content Body of Selected Tab (Scrollable) */}
            <div className="flex-1 overflow-y-auto pr-1 relative z-10 font-sans flex flex-col md:flex-row gap-5">
              
              {/* Left Side: Metadata info */}
              <div className="flex-1 flex flex-col gap-3.5">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase block mb-1">Nama Artefak</span>
                  <h4 className="text-base font-light tracking-wide text-white uppercase leading-tight">
                    {ASSETS_LIST[activeTestTab].name}
                  </h4>
                  {ASSETS_LIST[activeTestTab].subName && (
                    <span className="text-xs text-slate-400 font-medium italic">
                      ({ASSETS_LIST[activeTestTab].subName})
                    </span>
                  )}
                </div>

                <div className="border-t border-slate-800 pt-2.5">
                  <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase block mb-1">Lokasi Temuan</span>
                  <p className="text-xs text-slate-400 leading-normal">
                    {ASSETS_LIST[activeTestTab].location}
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-2.5">
                  <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase block mb-1">Deskripsi</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {ASSETS_LIST[activeTestTab].description}
                  </p>
                </div>

                {/* Instant Bypass Button for this specific tab asset */}
                <div className="mt-auto pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setShowTestMenu(false);
                      setBgMode('image');
                      setBgImage('https://travelspromo.com/wp-content/uploads/2024/08/Bangunan-Candi-Jago-Chris-Arsen.jpg');
                      simulateDetection(ASSETS_LIST[activeTestTab]);
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Bypass Simulasi AR</span>
                  </button>
                </div>
              </div>

              {/* Right Side: QR Code Frame */}
              <div className="w-full md:w-56 flex flex-col items-center justify-center bg-slate-950 p-4 rounded-xl border border-slate-800 gap-3 self-center shrink-0">
                <span className="text-[9px] font-semibold text-slate-500 tracking-widest uppercase">Kode QR Dekat</span>
                
                <div className="p-3 bg-white rounded-lg shadow-md border border-slate-200">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ASSETS_LIST[activeTestTab].qrCodeValue}`} 
                    alt={`${ASSETS_LIST[activeTestTab].name} QR Code`} 
                    className="w-32 h-32 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-[10px] text-slate-300 font-mono tracking-wider bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800 inline-block">
                    {ASSETS_LIST[activeTestTab].qrCodeValue}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-1.5 leading-normal max-w-[160px] mx-auto">
                    Kamera HP akan mendeteksi kode di atas untuk memuat objek secara otomatis.
                  </p>
                </div>
              </div>

            </div>

            {/* Footer close action */}
            <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0 relative z-10">
              <button
                onClick={() => setShowTestMenu(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
