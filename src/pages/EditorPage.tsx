import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Check, X, FileText } from 'lucide-react';
import Cropper, { Area } from 'react-easy-crop';
import { cn } from '../utils/cn';
import { Annotation, PageSnapshot, OrderVersion } from '../types';
import { toast } from 'sonner';

// Helper to get cropped image
const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<string> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return canvas.toDataURL('image/jpeg');
};

export default function EditorPage({
  versions,
  onUpdateVersion,
  onPublishVersion,
}: {
  versions: OrderVersion[],
  onUpdateVersion: (v: OrderVersion) => void,
  onPublishVersion: (id: string) => void,
}) {
  const { versionId } = useParams<{ versionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const project = location.state?.project;
  const order = location.state?.order;
  
  const version = versions.find(v => v.id === versionId);
  
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [hoveredAnnotationId, setHoveredAnnotationId] = useState<string | null>(null);
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null);
  const [visibleAnnotationIds, setVisibleAnnotationIds] = useState<Set<string>>(new Set());
  const [visibleCommentIds, setVisibleCommentIds] = useState<Set<string>>(new Set());
  
  // Image Crop State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const annotationCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [redrawTrigger, setRedrawTrigger] = useState(0);

  if (!version) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">找不到该版本</h2>
        <button onClick={() => navigate('/overview', { state: { project, order } })} className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700">返回方案列表</button>
      </div>
    );
  }

  const page = version.pages[currentPageIndex];
  const isReadOnlyOrder = order?.status && ['S04', 'S08', 'S11'].includes(order.status);
  const isLocked = version.status !== 'draft' || isReadOnlyOrder;
  const showComments = version.status === 'reviewed';

  // Viewport filtering for annotations and comments
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleAnnotationIds(prev => {
          const next = new Set(prev);
          entries.forEach(entry => {
            const id = entry.target.getAttribute('data-anno-id');
            if (id) {
              if (entry.isIntersecting) next.add(id);
              else next.delete(id);
            }
          });
          return next;
        });

        setVisibleCommentIds(prev => {
          const next = new Set(prev);
          entries.forEach(entry => {
            const id = entry.target.getAttribute('data-comm-id');
            if (id) {
              if (entry.isIntersecting) next.add(id);
              else next.delete(id);
            }
          });
          return next;
        });
      },
      {
        threshold: 0.1, 
      }
    );

    const currentRefs = annotationCardRefs.current;
    Object.values(currentRefs).forEach(el => {
      if (el) observer.observe(el);
    });

    return () => {
      Object.values(currentRefs).forEach(el => {
        if (el) observer.unobserve(el);
      });
    };
  }, [page?.annotations, page?.comments, redrawTrigger]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsImageZoomed(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const onBack = () => navigate('/overview', { state: { project, order } });
  const onPublish = () => {
    onPublishVersion(version.id);
    navigate('/overview', { state: { project, order } });
  };

  // Force redraw on scroll or resize
  useEffect(() => {
    const triggerRedraw = () => setRedrawTrigger(prev => prev + 1);
    
    const leftPanel = leftPanelRef.current;
    const rightPanel = rightPanelRef.current;
    const container = containerRef.current;
    
    window.addEventListener('resize', triggerRedraw);
    leftPanel?.addEventListener('scroll', triggerRedraw);
    rightPanel?.addEventListener('scroll', triggerRedraw);
    container?.addEventListener('scroll', triggerRedraw);
    
    // Initial trigger
    triggerRedraw();
    
    return () => {
      window.removeEventListener('resize', triggerRedraw);
      leftPanel?.removeEventListener('scroll', triggerRedraw);
      rightPanel?.removeEventListener('scroll', triggerRedraw);
      container?.removeEventListener('scroll', triggerRedraw);
    };
  }, [page]);

  // Redraw when annotations or comments change
  useEffect(() => {
    setRedrawTrigger(prev => prev + 1);
  }, [page?.annotations, page?.comments]);

  const updateCurrentPage = (updatedPage: PageSnapshot) => {
    const newPages = [...version.pages];
    newPages[currentPageIndex] = updatedPage;
    onUpdateVersion({ ...version, pages: newPages });
  };

  const handleImageUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const ratio = img.width / img.height;
        if (Math.abs(ratio - 16 / 9) > 0.05) {
          toast.warning('图片比例不是 16:9，请裁切');
          setImageToCrop(img.src);
          setShowCropModal(true);
        } else {
          updateCurrentPage({ ...page, imageUrl: img.src });
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const saveCroppedImage = async () => {
    if (imageToCrop && croppedAreaPixels) {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      updateCurrentPage({ ...page, imageUrl: croppedImage });
      setShowCropModal(false);
      setImageToCrop(null);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingAnnotation) {
      if (page.imageUrl) setIsImageZoomed(true);
      return;
    }
    if (isLocked || !imageContainerRef.current || !page.imageUrl) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newId = `anno-${Date.now()}`;
    const newAnno: Annotation = {
      id: newId,
      targetType: 'image_point',
      point: { x, y },
      content: '',
      createdAt: new Date().toISOString(),
    };
    updateCurrentPage({ ...page, annotations: [...page.annotations, newAnno] });
    setIsAddingAnnotation(false);
    setEditingAnnotationId(newId);
  };

  const toggleAddingAnnotation = () => {
    if (!isAddingAnnotation) {
      // Cleanup empty annotations before starting new one
      const cleanedAnnotations = page.annotations.filter(a => a.content.trim() !== '');
      if (cleanedAnnotations.length !== page.annotations.length) {
        updateCurrentPage({ ...page, annotations: cleanedAnnotations });
      }
    }
    setIsAddingAnnotation(!isAddingAnnotation);
  };

  const handleAddPage = () => {
    const newPage: PageSnapshot = {
      snapshotId: `s-${Date.now()}`,
      versionId: version.id,
      pageId: `p-${Date.now()}`,
      order: version.pages.length + 1,
      title: '新页面',
      text: '',
      imageUrl: '',
      annotations: [],
      comments: [],
      lock: { isLocked: false }
    };
    onUpdateVersion({ ...version, pages: [...version.pages, newPage] });
    setCurrentPageIndex(version.pages.length);
  };

  const scrollToAnnotation = (id: string) => {
    const el = annotationCardRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleDeleteAnnotation = (id: string) => {
    updateCurrentPage({
      ...page,
      annotations: page.annotations.filter(a => a.id !== id)
    });
    if (editingAnnotationId === id) setEditingAnnotationId(null);
    if (hoveredAnnotationId === id) setHoveredAnnotationId(null);
  };

  const drawLines = useCallback(() => {
    if (!containerRef.current || !imageContainerRef.current || !page) return null;
    const containerRect = containerRef.current.getBoundingClientRect();
    const lines: React.ReactNode[] = [];

    page.annotations?.forEach(anno => {
      if (anno.targetType !== 'image_point') return;
      
      // Viewport filtering: only draw lines for visible annotations
      if (!visibleAnnotationIds.has(anno.id)) return;

      const cardEl = annotationCardRefs.current[anno.id];
      const imageContainer = imageContainerRef.current;
      if (!cardEl || !imageContainer) return;
      
      const cardRect = cardEl.getBoundingClientRect();
      const imageRect = imageContainer.getBoundingClientRect();
      const leftPanel = leftPanelRef.current;
      
      // Additional safety: Check if card is actually within the left panel's vertical bounds
      if (leftPanel) {
        const lpRect = leftPanel.getBoundingClientRect();
        if (cardRect.bottom < lpRect.top || cardRect.top > lpRect.bottom) return;
      }
      
      const startX = cardRect.right - containerRect.left;
      const startY = cardRect.top - containerRect.top + cardRect.height / 2;
      const endX = imageRect.left - containerRect.left + (imageRect.width * (anno.point?.x || 0)) / 100;
      const endY = imageRect.top - containerRect.top + (imageRect.height * (anno.point?.y || 0)) / 100;
      
      const isHovered = hoveredAnnotationId === anno.id;
      
      lines.push(
        <path 
          key={`line-anno-${anno.id}`} 
          d={`M ${startX} ${startY} L ${endX} ${endY}`} 
          fill="none" 
          stroke={isHovered ? "#CC5B00" : "#64748B"} 
          strokeWidth={isHovered ? "3.15" : "1.05"} 
          strokeDasharray="0"
          strokeOpacity={isHovered ? "1" : "0.4"}
          className="transition-all duration-200"
        />
      );
    });

    // Draw lines for customer comments
    page.comments?.forEach(comm => {
      if (!visibleCommentIds.has(comm.id)) return;

      const cardEl = annotationCardRefs.current[comm.id];
      const imageContainer = imageContainerRef.current;
      const middlePanel = document.getElementById('middle-text-panel');
      if (!cardEl) return;
      
      const cardRect = cardEl.getBoundingClientRect();
      const startX = cardRect.left - containerRect.left;
      const startY = cardRect.top - containerRect.top + cardRect.height / 2;
      
      let endX = 0;
      let endY = 0;

      if (comm.targetType === 'image_point' && imageContainer) {
        const imageRect = imageContainer.getBoundingClientRect();
        endX = imageRect.left - containerRect.left + (imageRect.width * (comm.point?.x || 0)) / 100;
        endY = imageRect.top - containerRect.top + (imageRect.height * (comm.point?.y || 0)) / 100;
      } else if (comm.targetType === 'text_description' && middlePanel) {
        const middleRect = middlePanel.getBoundingClientRect();
        endX = middleRect.right - containerRect.left;
        endY = middleRect.top - containerRect.top + middleRect.height / 2;
      } else {
        return;
      }

      const isHovered = hoveredAnnotationId === comm.id;
      
      lines.push(
        <path 
          key={`line-comm-${comm.id}`} 
          d={`M ${startX} ${startY} L ${endX} ${endY}`} 
          fill="none" 
          stroke={isHovered ? "#4887FF" : "#64748B"} 
          strokeWidth={isHovered ? "3.15" : "1.05"} 
          strokeDasharray="0"
          strokeOpacity={isHovered ? "1" : "0.4"}
          className="transition-all duration-200"
        />
      );
    });

    return lines;
  }, [page?.annotations, page?.comments, redrawTrigger, hoveredAnnotationId, visibleAnnotationIds, visibleCommentIds]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6 z-20 shadow-sm relative">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button onClick={onBack} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg truncate">{version.name}</h1>
        </div>
        
        {/* Center Section - Page Switcher */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          {version.pages.map((p, idx) => (
            <button 
              key={p.pageId} 
              onClick={() => setCurrentPageIndex(idx)} 
              className={cn(
                "px-4 py-1.5 rounded-xl font-bold transition-colors", 
                currentPageIndex === idx ? "bg-orange-100 text-orange-700" : "bg-slate-100 hover:bg-slate-200"
              )}
            >
              P{idx + 1}
            </button>
          ))}
          {!isLocked && (
            <button onClick={handleAddPage} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Right Section */}
        <div className="flex-1 flex justify-end">
          {!isLocked && (
            <button onClick={onPublish} className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 whitespace-nowrap">
              发布此版本
            </button>
          )}
        </div>
      </div>

      {!page ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
          <div className="bg-white p-12 rounded-[32px] shadow-xl border border-slate-200 text-center max-w-md">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">暂无页面数据</h2>
            <p className="text-slate-500 mb-8">该版本目前还是空的，请点击下方按钮添加第一个设计页面。</p>
            <button onClick={handleAddPage} className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20">
              添加第一个页面
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden p-6 gap-6 relative" ref={containerRef}>
          {/* SVG Overlay for lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
            {drawLines()}
          </svg>

          {/* Left Column */}
          <div className="w-1/4 flex flex-col gap-4 z-20">
            <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 p-5 overflow-y-auto" ref={leftPanelRef}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">设计注释</h2>
                {!isLocked && (
                  <button 
                    onClick={toggleAddingAnnotation} 
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2", 
                      isAddingAnnotation ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    打点注释
                  </button>
                )}
              </div>
              {page.annotations.map((anno, idx) => (
                <div 
                  key={anno.id} 
                  data-anno-id={anno.id}
                  ref={el => { if (el) annotationCardRefs.current[anno.id] = el; }}
                  onMouseEnter={() => setHoveredAnnotationId(anno.id)}
                  onMouseLeave={() => setHoveredAnnotationId(null)}
                  onClick={() => scrollToAnnotation(anno.id)}
                  className={cn(
                    "border rounded-2xl p-4 mb-4 transition-all cursor-pointer",
                    hoveredAnnotationId === anno.id ? "border-orange-600 bg-orange-50/30" : "border-slate-200 bg-slate-50",
                    editingAnnotationId === anno.id ? "ring-2 ring-orange-600 ring-offset-2" : ""
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">注释 {idx + 1}</span>
                        <span className="text-[10px] text-slate-400">{anno.authorName || '杜宇轩'} · {anno.createdAt}</span>
                      </div>
                    </div>
                    {!isLocked && (
                      <div className="flex items-center gap-1">
                        {editingAnnotationId === anno.id && (
                          <button 
                            onClick={() => setEditingAnnotationId(null)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="完成编辑"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteAnnotation(anno.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {editingAnnotationId === anno.id ? (
                    <div className="space-y-3">
                      <textarea
                        autoFocus
                        maxLength={150}
                        placeholder="请输入注释内容..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none resize-none text-sm focus:border-orange-600 transition-colors"
                        value={anno.content}
                        onChange={(e) => updateCurrentPage({ ...page, annotations: page.annotations.map(a => a.id === anno.id ? { ...a, content: e.target.value } : a) })}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">{anno.content.length}/150</span>
                        <button 
                          onClick={() => setEditingAnnotationId(null)}
                          className="px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700"
                        >
                          确认完成
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed min-h-[1.5rem]">
                      {anno.content || <span className="text-slate-300 italic">暂无内容</span>}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Middle Column */}
          <div className="w-2/4 flex flex-col gap-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex items-center justify-center">
              <input 
                maxLength={30} 
                readOnly={isLocked}
                value={page.title} 
                onChange={(e) => updateCurrentPage({ ...page, title: e.target.value })} 
                className="w-full text-4xl font-bold outline-none text-center" 
                placeholder="请输入标题"
              />
            </div>
            <div id="middle-text-panel" className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
              <textarea 
                maxLength={150} 
                readOnly={isLocked}
                value={page.text} 
                onChange={(e) => updateCurrentPage({ ...page, text: e.target.value })} 
                className="w-full h-24 outline-none resize-none text-lg leading-relaxed" 
                style={{ textIndent: '2em' }}
                placeholder="请输入描述内容..."
              />
              <div className="text-xs text-slate-400 text-right">{page.text.length}/150</div>
            </div>
            <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative group min-h-[400px] cursor-pointer" ref={imageContainerRef} onClick={handleImageClick}>
              {page.imageUrl ? (
                <img src={page.imageUrl || undefined} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <Plus className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">点击右上方按钮上传图纸</p>
                </div>
              )}
              
              {page.annotations.map((anno, idx) => (
                <div 
                  key={anno.id} 
                  onMouseEnter={() => setHoveredAnnotationId(anno.id)}
                  onMouseLeave={() => setHoveredAnnotationId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToAnnotation(anno.id);
                  }}
                  className={cn(
                    "absolute w-[22px] h-[22px] rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 flex items-center justify-center font-bold text-[10px] text-white cursor-pointer z-40 transition-all", 
                    hoveredAnnotationId === anno.id ? "bg-orange-600 scale-125 shadow-lg shadow-orange-600/40" : "bg-orange-500 hover:bg-orange-600"
                  )} 
                  style={{ left: `${anno.point?.x}%`, top: `${anno.point?.y}%` }}
                >
                  {idx + 1}
                </div>
              ))}
              
              {showComments && page.comments.map((comm, idx) => (
                comm.targetType === 'image_point' && (
                  <div 
                    key={comm.id} 
                    onMouseEnter={() => setHoveredAnnotationId(comm.id)}
                    onMouseLeave={() => setHoveredAnnotationId(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToAnnotation(comm.id);
                    }}
                    className={cn(
                      "absolute w-[22px] h-[22px] rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 flex items-center justify-center font-bold text-[10px] text-white cursor-pointer z-40 transition-all", 
                      hoveredAnnotationId === comm.id ? "bg-blue-700 scale-125 shadow-lg shadow-blue-700/40" : "bg-blue-500 hover:bg-blue-600"
                    )} 
                    style={{ left: `${comm.point?.x}%`, top: `${comm.point?.y}%` }}
                  >
                    {idx + 1}
                  </div>
                )
              ))}
              
              {!isLocked && (
                <div className={cn("absolute top-4 right-4 transition-opacity", page.imageUrl ? "opacity-0 group-hover:opacity-100" : "opacity-100")}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur shadow-lg rounded-xl text-sm font-bold text-slate-700 hover:bg-white"
                  >
                    <Plus className="w-4 h-4" />
                    {page.imageUrl ? '更换图纸' : '上传图纸'}
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} 
                    className="hidden" 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="w-1/4 flex flex-col gap-4 z-20">
            <div 
              ref={rightPanelRef}
              className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 p-5 overflow-y-auto custom-scrollbar"
            >
              <h2 className="font-bold text-lg mb-4">客户反馈参考</h2>
              {showComments ? (
                <>
                  {(() => {
                    const sortedComments = [...page.comments].sort((a, b) => {
                      if (a.targetType === 'text_description' && b.targetType !== 'text_description') return -1;
                      if (a.targetType !== 'text_description' && b.targetType === 'text_description') return 1;
                      return 0;
                    });
                    const textDescCount = page.comments.filter(c => c.targetType === 'text_description').length;
                    
                    return sortedComments.map((c, idx) => {
                      const isTextDesc = c.targetType === 'text_description';
                      const displayIdx = isTextDesc ? 0 : idx + 1 - textDescCount;
                      
                      return (
                        <div 
                          key={c.id} 
                          data-comm-id={c.id}
                          ref={el => { if (el) annotationCardRefs.current[c.id] = el; }}
                          onMouseEnter={() => setHoveredAnnotationId(c.id)}
                          onMouseLeave={() => setHoveredAnnotationId(null)}
                          onClick={() => scrollToAnnotation(c.id)}
                          className={cn(
                            "border rounded-2xl p-4 mb-4 transition-all cursor-pointer",
                            hoveredAnnotationId === c.id ? "border-blue-600 bg-blue-50/30" : "border-slate-200 bg-slate-50"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {isTextDesc ? (
                                <div className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                                  <FileText className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">{displayIdx}</div>
                              )}
                              <div className="flex flex-col">
                                <span className="font-bold text-sm">{isTextDesc ? '文字描述反馈' : `反馈 ${displayIdx}`}</span>
                                <span className="text-[10px] text-slate-400">{c.authorName || '业主 - 刘先生'} · {c.createdAt}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {c.content}
                          </p>
                        </div>
                      );
                    });
                  })()}
                  {page.comments.length === 0 && (
                    <div className="py-12 text-center text-slate-400 italic text-sm">
                      暂无客户反馈
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center text-slate-400 italic text-sm">
                  客户尚未完成审阅，反馈评价暂不可见
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {showCropModal && imageToCrop && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-10">
          <div className="bg-white p-6 rounded-3xl w-full max-w-2xl h-[80vh] flex flex-col">
            <div className="relative flex-1">
              <Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={16 / 9} onCropChange={setCrop} onZoomChange={setZoom} onCropAreaChange={onCropComplete} />
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button onClick={() => setShowCropModal(false)} className="px-6 py-2">取消</button>
              <button onClick={saveCroppedImage} className="px-6 py-2 bg-orange-600 text-white rounded-xl">确认裁切</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Overlay */}
      {isImageZoomed && page.imageUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-8 animate-in fade-in duration-200"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative w-[80vw] h-[80vh] flex items-center justify-center">
            <img 
              src={page.imageUrl} 
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              className="absolute -top-12 right-0 text-white hover:text-orange-500 transition-colors"
              onClick={() => setIsImageZoomed(false)}
            >
              <X className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
