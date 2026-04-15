import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, X, ChevronRight, ChevronLeft, Lock, FileText } from 'lucide-react';
import Navigation from './Navigation';

type Unit = 'px' | 'cm' | 'mm' | 'inch';
type OutputFormat = 'jpg' | 'pdf';
const DPI = 96;
const toPx = (val: number, unit: Unit) => {
  if (unit === 'px') return val;
  if (unit === 'cm') return Math.round(val * DPI / 2.54);
  if (unit === 'mm') return Math.round(val * DPI / 25.4);
  return Math.round(val * DPI);
};
const fromPx = (px: number, unit: Unit): number => {
  if (unit === 'px') return px;
  if (unit === 'cm') return +(px * 2.54 / DPI).toFixed(2);
  if (unit === 'mm') return +(px * 25.4 / DPI).toFixed(1);
  return +(px / DPI).toFixed(2);
};
const PRESETS = [
  { label: 'Passport', w: 413, h: 531 },
  { label: '35x45mm', w: 132, h: 170 },
  { label: 'Square', w: 1080, h: 1080 },
  { label: 'HD', w: 1280, h: 720 },
  { label: 'Full HD', w: 1920, h: 1080 },
  { label: 'A4', w: 794, h: 1123 },
];

type ToolMode = 'compress' | 'resize' | 'both';

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  width: number;
  height: number;
  name: string;
  size: number;
}

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { n: 1, label: 'Files' },
  { n: 2, label: 'Requirement' },
  { n: 3, label: 'Edit' },
  { n: 4, label: 'Generate' },
];

const PhotoResizerPage: React.FC = () => {
  const [step, setStep] = useState<Step>(1);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [unit, setUnit] = useState<Unit>('px');
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');
  const [lockAspect, setLockAspect] = useState(true);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpg');
  const [maxSizeKB, setMaxSizeKB] = useState('');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [activeFilter, setActiveFilter] = useState(0);
  const [toolMode, setToolMode] = useState<ToolMode | null>(null);
  const [compressTarget, setCompressTarget] = useState('');
  const [compressUnit, setCompressUnit] = useState<'kb'|'mb'>('kb');
  const selected = images[0] || null;

  const FILTERS = [
    { name: 'None', style: '' },
    { name: 'B&W', style: 'grayscale(100%)' },
    { name: 'Sepia', style: 'sepia(80%)' },
    { name: 'Vintage', style: 'sepia(40%) contrast(110%) brightness(90%)' },
    { name: 'Cool', style: 'hue-rotate(180deg) saturate(120%)' },
    { name: 'Warm', style: 'hue-rotate(-20deg) saturate(130%)' },
    { name: 'Fade', style: 'brightness(110%) saturate(70%)' },
    { name: 'Vivid', style: 'saturate(180%) contrast(110%)' },
  ];

  const filterStyle = `brightness(${brightness}%) contrast(${contrast}%)${FILTERS[activeFilter].style ? ' ' + FILTERS[activeFilter].style : ''}`;
  const handleWidthChange = (val: string) => {
    setResizeWidth(val);
    if (lockAspect && selected && val) {
      const pxW = toPx(Number(val), unit);
      setResizeHeight(fromPx(Math.round(pxW * selected.height / selected.width), unit).toString());
    }
  };
  const handleHeightChange = (val: string) => {
    setResizeHeight(val);
    if (lockAspect && selected && val) {
      const pxH = toPx(Number(val), unit);
      setResizeWidth(fromPx(Math.round(pxH * selected.width / selected.height), unit).toString());
    }
  };
  const handleUnitChange = (u: Unit) => {
    if (selected) {
      const wPx = resizeWidth ? toPx(Number(resizeWidth), unit) : selected.width;
      const hPx = resizeHeight ? toPx(Number(resizeHeight), unit) : selected.height;
      setResizeWidth(fromPx(wPx, u).toString());
      setResizeHeight(fromPx(hPx, u).toString());
    }
    setUnit(u);
  };

  const loadImage = (file: File): Promise<ImageFile> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => resolve({
          id: Math.random().toString(36).slice(2),
          file, preview: e.target?.result as string,
          width: img.naturalWidth, height: img.naturalHeight,
          name: file.name, size: file.size,
        });
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/') && f.size <= 25 * 1024 * 1024);
    const loaded = await Promise.all(arr.map(loadImage));
    setImages(prev => [...prev, ...loaded]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeImage = (id: string) => setImages(prev => prev.filter(img => img.id !== id));
  const canNext = step === 1 ? images.length > 0 : step === 2 ? toolMode !== null : step < 4;

  const processOne = (img: ImageFile): Promise<string> =>
    new Promise(resolve => {
      const canvas = document.createElement('canvas');
      const w = (toolMode === 'resize' || toolMode === 'both') && resizeWidth ? toPx(Number(resizeWidth), unit) : img.width;
      const h = (toolMode === 'resize' || toolMode === 'both') && resizeHeight ? toPx(Number(resizeHeight), unit) : img.height;
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.filter = filterStyle;
      const el = new window.Image();
      el.onload = () => {
        ctx.save();
        ctx.translate(w/2, h/2);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(el, -w/2, -h/2, w, h);
        ctx.restore();
        let quality = 0.95;
        if ((toolMode === 'compress' || toolMode === 'both') && compressTarget) {
          const targetBytes = Number(compressTarget) * (compressUnit === 'mb' ? 1024 * 1024 : 1024);
          let lo = 0.01, hi = 1.0;
          for (let i = 0; i < 16; i++) {
            const mid = (lo + hi) / 2;
            const d = canvas.toDataURL('image/jpeg', mid);
            const bytes = Math.round((d.length - 22) * 3 / 4);
            bytes > targetBytes ? hi = mid : lo = mid;
          }
          quality = lo;
        }
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      el.src = img.preview;
    });

  const handleDownloadSingle = async () => {
    if (!selected) return;
    const dataUrl = await processOne(selected);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = selected.name.replace(/\.[^.]+$/, '') + '_resized.jpg';
    a.click();
  };

  const handleDownloadAll = async () => {
    if (images.length === 0) return;
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    for (const img of images) {
      const dataUrl = await processOne(img);
      zip.file(img.name.replace(/\.[^.]+$/, '') + '_resized.jpg', dataUrl.split(',')[1], { base64: true });
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'resized_images.zip';
    a.click();
  };

  const handleDownloadPDF = async () => {
    if (images.length === 0) return;
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    for (let i = 0; i < images.length; i++) {
      const dataUrl = await processOne(images[i]);
      if (i > 0) doc.addPage();
      doc.addImage(dataUrl, 'JPEG', 10, 10, 190, 0);
    }
    doc.save('images.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navigation onNavigate={() => {}} currentPage="photo-resizer" />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">

        {/* Header */}
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Photo Resizer & Editor</h1>
          <p className="text-white/60 text-sm">Resize photos for passport, exam forms, signatures & certificates — free & private</p>
        </motion.div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.n}>
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === s.n ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/40 scale-110' :
                  step > s.n ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'
                }`}>{step > s.n ? '✓' : s.n}</div>
                <span className={`text-xs mt-1 font-medium ${step === s.n ? 'text-purple-300' : step > s.n ? 'text-emerald-400' : 'text-white/30'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-16 sm:w-24 mx-1 mb-5 transition-colors duration-300 ${step > s.n ? 'bg-emerald-500' : 'bg-white/10'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence>
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>

            {step === 1 && (
              <div className="space-y-5">
                <div
                  className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-purple-400 bg-purple-500/20' : 'border-white/20 hover:border-purple-400/60 hover:bg-white/5'}`}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={e => e.target.files && handleFiles(e.target.files)} />
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">Click Here To Select Files</h2>
                  <p className="text-white/40 text-sm mb-5">or drag & drop — JPG, PNG, WEBP</p>
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold text-sm">
                    <ImageIcon className="w-4 h-4" /> Browse Files
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-5 text-white/30 text-xs">
                    <Lock className="w-3 h-3" /> Max 25MB · Files stay on your device. Nothing is uploaded.
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/60 text-xs font-medium">{images.length} file{images.length > 1 ? 's' : ''} selected</p>
                      <button onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">+ Add More</button>
                    </div>
                    {images.map(img => (
                      <motion.div key={img.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <img src={img.preview} alt={img.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{img.name}</p>
                          <p className="text-white/40 text-xs">{img.width}×{img.height}px · {(img.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button onClick={() => removeImage(img.id)} className="text-white/30 hover:text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-white font-bold text-xl mb-1">What do you want to do?</h2>
                  <p className="text-white/40 text-sm">Choose your tool — filters & transform apply to all</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { mode: 'compress' as ToolMode, icon: '🗜️', title: 'Compress', desc: 'Reduce file size while keeping maximum quality. Set target size in KB or MB.' },
                    { mode: 'resize' as ToolMode, icon: '📐', title: 'Resize', desc: 'Change image dimensions in px, cm, mm or inch. Use presets for passport, HD, A4 etc.' },
                    { mode: 'both' as ToolMode, icon: '⚡', title: 'Compress + Resize', desc: 'Resize to exact dimensions AND compress to target file size.' },
                  ].map(t => (
                    <motion.div key={t.mode} onClick={() => setToolMode(t.mode)}
                      className={`cursor-pointer rounded-2xl p-6 border-2 transition-all ${
                        toolMode === t.mode
                          ? 'border-purple-400 bg-purple-500/20'
                          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <div className="text-3xl mb-3">{t.icon}</div>
                      <h3 className="text-white font-bold mb-2">{t.title}</h3>
                      <p className="text-white/50 text-xs leading-relaxed">{t.desc}</p>
                      {toolMode === t.mode && (
                        <div className="mt-3 flex items-center gap-1.5 text-purple-300 text-xs font-medium">
                          <span className="w-2 h-2 bg-purple-400 rounded-full"></span> Selected
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Compress settings */}
                {(toolMode === 'compress' || toolMode === 'both') && (
                  <motion.div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-white font-semibold text-sm">Compression Target</p>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="text-white/50 text-xs mb-1 block">Target Size</label>
                        <input type="number" value={compressTarget} onChange={e => setCompressTarget(e.target.value)}
                          placeholder="e.g. 100"
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition-colors" />
                      </div>
                      <div className="flex gap-1 bg-white/10 rounded-xl p-1">
                        {(['kb','mb'] as const).map(u => (
                          <button key={u} onClick={() => setCompressUnit(u)}
                            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all uppercase ${
                              compressUnit === u ? 'bg-purple-500 text-white' : 'text-white/50 hover:text-white'
                            }`}>{u}</button>
                        ))}
                      </div>
                    </div>
                    <p className="text-white/30 text-xs">We use binary search quality reduction to get as close as possible to your target while keeping maximum visual quality.</p>
                  </motion.div>
                )}

                {/* Resize settings */}
                {(toolMode === 'resize' || toolMode === 'both') && (
                  <motion.div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-white font-semibold text-sm">Resize Dimensions</p>
                    <div className="flex gap-1 bg-white/10 rounded-xl p-1">
                      {(['px','cm','mm','inch'] as Unit[]).map(u => (
                        <button key={u} onClick={() => handleUnitChange(u)}
                          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                            unit === u ? 'bg-purple-500 text-white' : 'text-white/50 hover:text-white'
                          }`}>{u}</button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {PRESETS.map(p => (
                        <button key={p.label}
                          onClick={() => { setResizeWidth(fromPx(p.w, unit).toString()); setResizeHeight(fromPx(p.h, unit).toString()); }}
                          className="py-2 px-1 bg-white/10 hover:bg-purple-500/30 border border-white/10 hover:border-purple-400/50 text-white/70 hover:text-white text-xs rounded-xl transition-all text-center">
                          <div className="font-medium">{p.label}</div>
                          <div className="text-white/30 text-[10px]">{p.w}x{p.h}</div>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/50 text-xs mb-1 block">Width ({unit})</label>
                        <input type="number" value={resizeWidth} onChange={e => handleWidthChange(e.target.value)}
                          placeholder={selected ? fromPx(selected.width, unit).toString() : '0'}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition-colors" />
                      </div>
                      <div>
                        <label className="text-white/50 text-xs mb-1 block">Height ({unit})</label>
                        <input type="number" value={resizeHeight} onChange={e => handleHeightChange(e.target.value)}
                          placeholder={selected ? fromPx(selected.height, unit).toString() : '0'}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition-colors" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLockAspect(l => !l)}>
                      <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${lockAspect ? 'bg-purple-500' : 'bg-white/20'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${lockAspect ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-white/70 text-sm">Lock aspect ratio</span>
                    </div>
                  </motion.div>
                )}

                {/* Output format */}
                {toolMode && (
                  <motion.div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-white font-semibold text-sm">Output Format</p>
                    <div className="flex gap-2">
                      {(['jpg','pdf'] as OutputFormat[]).map(f => (
                        <button key={f} onClick={() => setOutputFormat(f)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                            outputFormat === f ? 'bg-purple-500 border-purple-400 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                          }`}>
                          <FileText className="w-4 h-4" /> {f.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Live Preview */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-white/60 text-xs mb-3 font-medium">Live Preview</p>
                  {selected && (
                    <img src={selected.preview} alt="preview"
                      className="w-full h-64 object-contain rounded-xl bg-black/20"
                      style={{ filter: filterStyle, transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})` }} />
                  )}
                  <p className="text-white/30 text-xs text-center mt-2">
                    {selected ? `${selected.width}x${selected.height}px` : ''}
                  </p>
                </div>

                {/* Controls */}
                <div className="space-y-5">
                  {/* Transform */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                    <p className="text-white/60 text-xs font-medium">Transform</p>
                    <div className="grid grid-cols-4 gap-2">
                      <button onClick={() => setRotation(r => (r - 90 + 360) % 360)}
                        className="py-2 text-xs bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-all">↺ L</button>
                      <button onClick={() => setRotation(r => (r + 90) % 360)}
                        className="py-2 text-xs bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-all">↻ R</button>
                      <button onClick={() => setFlipH(f => !f)}
                        className={`py-2 text-xs rounded-lg border transition-all ${
                          flipH ? 'bg-purple-500/30 border-purple-400 text-white' : 'bg-white/10 border-white/10 text-white/60 hover:text-white'
                        }`}>Flip H</button>
                      <button onClick={() => setFlipV(f => !f)}
                        className={`py-2 text-xs rounded-lg border transition-all ${
                          flipV ? 'bg-purple-500/30 border-purple-400 text-white' : 'bg-white/10 border-white/10 text-white/60 hover:text-white'
                        }`}>Flip V</button>
                    </div>
                  </div>

                  {/* Adjustments */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                    <p className="text-white/60 text-xs font-medium">Adjustments</p>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-white/50 text-xs">Brightness</span>
                        <span className="text-white/50 text-xs">{brightness}%</span>
                      </div>
                      <input type="range" min={0} max={200} value={brightness} onChange={e => setBrightness(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-white/50 text-xs">Contrast</span>
                        <span className="text-white/50 text-xs">{contrast}%</span>
                      </div>
                      <input type="range" min={0} max={200} value={contrast} onChange={e => setContrast(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer" />
                    </div>
                    <button onClick={() => { setBrightness(100); setContrast(100); }}
                      className="text-xs text-white/30 hover:text-white/60 transition-colors">Reset</button>
                  </div>

                  {/* Filters */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-white/60 text-xs font-medium mb-3">Filters</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {FILTERS.map((f, i) => (
                        <button key={f.name} onClick={() => setActiveFilter(i)}
                          className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                            activeFilter === i ? 'border-purple-400' : 'border-transparent'
                          }`}>
                          {selected && (
                            <img src={selected.preview} alt={f.name}
                              className="w-full h-10 object-cover"
                              style={{ filter: f.style || undefined }} />
                          )}
                          <div className="text-center text-white/70 text-[9px] py-0.5 bg-black/50">{f.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                <div>
                  <h2 className="text-white font-bold text-lg mb-1">Generate & Download</h2>
                  <p className="text-white/40 text-xs">Processed locally — nothing is uploaded.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {images.map(img => (
                    <div key={img.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                      <img src={img.preview} alt={img.name}
                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                        style={{ filter: filterStyle, transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})` }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{img.name}</p>
                        <p className="text-white/40 text-xs">
                          {resizeWidth && resizeHeight ? `${resizeWidth}x${resizeHeight} ${unit}` : `${img.width}x${img.height}px`}
                          {maxSizeKB ? ` · max ${maxSizeKB}KB` : ''}
                        </p>
                        <p className="text-purple-300 text-xs uppercase">{outputFormat}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <motion.button
                    onClick={images.length === 1 ? handleDownloadSingle : handleDownloadAll}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    {images.length === 1 ? 'Download Image' : 'Download All as ZIP'}
                  </motion.button>
                  {outputFormat === 'pdf' && (
                    <motion.button
                      onClick={handleDownloadPDF}
                      className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      Download as PDF
                    </motion.button>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Nav Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button onClick={() => setStep(s => Math.max(1, s - 1) as Step)} disabled={step === 1}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-white/30 text-xs">Step {step} of 4</span>
          <button onClick={() => canNext && setStep(s => Math.min(4, s + 1) as Step)} disabled={!canNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-30 disabled:cursor-not-allowed">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default PhotoResizerPage;
