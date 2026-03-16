import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit3, ArrowLeft, Plus, CheckCircle2, MessageSquare, Image as ImageIcon, Trash2, Send } from 'lucide-react';
import { cn } from '../utils/cn';
import { Annotation, PageSnapshot, OrderVersion } from '../types';

// 2. Editor Page
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
  
  const version = versions.find(v => v.id === versionId);
  
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [hoveredAnnotationId, setHoveredAnnotationId] = useState<string | null>(null);

  if (!version) {
    return (
      <div className="min-h-screen bg-white p-6 font-sans flex flex-col items-center justify-center">
        <h2 className="text-[30px] font-[900] text-[#0A0A0A] mb-4">找不到该版本</h2>
        <button
          onClick={() => navigate('/overview')}
          className="px-8 py-4 bg-[#EF6B00] text-white rounded-[16px] text-[16px] font-[700] hover:bg-[#CC5B00] transition-colors"
        >
          返回方案列表
        </button>
      </div>
    );
  }

  const page = version.pages[currentPageIndex];
  const isLocked = version.status !== 'draft';
  const readOnly = isLocked;

  const onBack = () => navigate('/overview');
  const onPublish = () => {
    onPublishVersion(version.id);
    navigate('/overview');
  };

  if (!page) {
    return (
      <div className="min-h-screen bg-white p-6 font-sans flex flex-col items-center justify-center">
        <h2 className="text-[30px] font-[900] text-[#0A0A0A] mb-4">该版本暂无页面</h2>
        <button
          onClick={onBack}
          className="px-8 py-4 bg-[#EF6B00] text-white rounded-[16px] text-[16px] font-[700] hover:bg-[#CC5B00] transition-colors"
        >
          返回方案列表
        </button>
      </div>
    );
  }

  // Refs for drawing lines
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imageContainerRef = React.useRef<HTMLDivElement>(null);
  const annotationCardRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const commentCardRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const [redrawTrigger, setRedrawTrigger] = useState(0);

  React.useEffect(() => {
    const handleResize = () => setRedrawTrigger(prev => prev + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => setRedrawTrigger(prev => prev + 1), 50);
    return () => clearTimeout(timer);
  }, [page.annotations, currentPageIndex]);

  // Helper to get index for image dots
  const getAnnotationImageIndex = (id: string) => {
    const imageAnnos = page.annotations.filter(a => a.targetType === 'image_point');
    return imageAnnos.findIndex(a => a.id === id) + 1;
  };

  const getCommentImageIndex = (id: string) => {
    const imageComments = page.comments.filter(c => c.targetType === 'image_point');
    return imageComments.findIndex(c => c.id === id) + 1;
  };

  const updateCurrentPage = (updatedPage: PageSnapshot) => {
    const newPages = [...version.pages];
    newPages[currentPageIndex] = updatedPage;
    onUpdateVersion({ ...version, pages: newPages });
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.marker-dot')) return;
    if (!isAddingAnnotation || isLocked) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newAnno: Annotation = {
      id: `anno-${Date.now()}`,
      targetType: 'image_point',
      point: { x, y },
      content: '',
      createdAt: new Date().toISOString(),
    };

    updateCurrentPage({
      ...page,
      annotations: [...page.annotations, newAnno]
    });
    setIsAddingAnnotation(false);
  };

  const updateAnnotation = (id: string, content: string) => {
    if (isLocked) return;
    updateCurrentPage({
      ...page,
      annotations: page.annotations.map(a => a.id === id ? { ...a, content, updatedAt: new Date().toISOString() } : a)
    });
  };

  const deleteAnnotation = (id: string) => {
    if (isLocked) return;
    updateCurrentPage({
      ...page,
      annotations: page.annotations.filter(a => a.id !== id)
    });
  };

  const handleAddPage = () => {
    const newPage: PageSnapshot = {
      snapshotId: `s-${Date.now()}`,
      versionId: version.id,
      pageId: `p-${Date.now()}`,
      order: version.pages.length + 1,
      title: '新页面',
      text: '',
      imageUrl: 'https://picsum.photos/seed/new/2000/1000',
      annotations: [],
      comments: [],
      lock: { isLocked: false }
    };
    onUpdateVersion({ ...version, pages: [...version.pages, newPage] });
    setCurrentPageIndex(version.pages.length);
  };

  const handleReplaceImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newUrl = event.target?.result as string;
          updateCurrentPage({ ...page, imageUrl: newUrl });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };


  const drawLines = React.useCallback(() => {
    if (!containerRef.current || !imageContainerRef.current) return null;
    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageContainerRef.current.getBoundingClientRect();
    const lines: React.ReactNode[] = [];

    // Draw Annotation Lines
    page.annotations.forEach(anno => {
      if (anno.targetType !== 'image_point') return;
      const cardEl = annotationCardRefs.current[anno.id];
      if (!cardEl) return;

      const cardRect = cardEl.getBoundingClientRect();
      const startX = cardRect.right - containerRect.left;
      const startY = cardRect.top - containerRect.top + cardRect.height / 2;

      const endX = imageRect.left - containerRect.left + (imageRect.width * (anno.point?.x || 0)) / 100;
      const endY = imageRect.top - containerRect.top + (imageRect.height * (anno.point?.y || 0)) / 100;

      const isHovered = hoveredAnnotationId === anno.id;
      const path = `M ${startX} ${startY} L ${endX} ${endY}`;

      lines.push(
        <path
          key={`line-annotation-${anno.id}`}
          d={path}
          fill="none"
          stroke="#6B7280"
          strokeWidth={isHovered ? "2" : "1"}
          opacity={isHovered ? 0.8 : 0.2}
          style={{ transition: 'opacity 0.2s ease' }}
        />
      );
    });

    // Draw Comment Lines
    page.comments.forEach(comment => {
      if (comment.targetType !== 'image_point') return;
      const cardEl = commentCardRefs.current[comment.id];
      if (!cardEl) return;

      const cardRect = cardEl.getBoundingClientRect();
      const startX = cardRect.left - containerRect.left;
      const startY = cardRect.top - containerRect.top + cardRect.height / 2;

      const endX = imageRect.left - containerRect.left + (imageRect.width * (comment.point?.x || 0)) / 100;
      const endY = imageRect.top - containerRect.top + (imageRect.height * (comment.point?.y || 0)) / 100;

      const isHovered = hoveredAnnotationId === comment.id;
      const path = `M ${startX} ${startY} L ${endX} ${endY}`;

      lines.push(
        <path
          key={`line-comment-${comment.id}`}
          d={path}
          fill="none"
          stroke="#4887FF"
          strokeWidth={isHovered ? "2" : "1"}
          opacity={isHovered ? 0.8 : 0.2}
          style={{ transition: 'opacity 0.2s ease' }}
        />
      );
    });

    return lines;
  }, [page.annotations, page.comments, redrawTrigger, hoveredAnnotationId]);

  return (
    <div className="h-screen w-screen flex flex-col bg-white font-sans overflow-hidden">
      {/* --- Top Bar --- */}
      <div className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 flex-shrink-0 z-20 shadow-sm relative">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-[#6B7280] hover:bg-[#E5E7EB]/30 rounded-[12px] transition-colors" title="返回版本列表">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-[900] text-[#0A0A0A] tracking-tight">{version.name}</span>
              <span className={cn(
                "px-2 py-0.5 rounded-[12px] text-[12px] font-[500] tracking-wider",
                readOnly ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              )}>
                {readOnly ? '已发布 (只读)' : '编辑中'}
              </span>
            </div>
          </div>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center bg-[#E5E7EB]/20 p-1 rounded-[16px] border border-[#E5E7EB]">
          {version.pages.map((p, idx) => (
            <button
              key={p.pageId}
              onClick={() => setCurrentPageIndex(idx)}
              className={cn(
                "px-4 py-1.5 rounded-[12px] text-[16px] font-[400] transition-all flex items-center gap-1.5",
                currentPageIndex === idx
                  ? "bg-white text-[#EF6B00] shadow-sm border border-[#E5E7EB] font-[700]"
                  : "text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#E5E7EB]/30"
              )}
            >
              <span>P{idx + 1}</span>
            </button>
          ))}
          {!readOnly && (
            <>
              <div className="w-px h-4 bg-[#E5E7EB] mx-1"></div>
              <button
                onClick={handleAddPage}
                className="px-3 py-1.5 text-[#6B7280] hover:text-[#EF6B00] transition-colors flex items-center gap-1 text-[16px] font-[400]" title="新增页面">
                <Plus className="w-4 h-4" /> 新页
              </button>
            </>
          )}
        </div>

        {/* Main Actions */}
        <div className="flex items-center gap-3">
          {!readOnly && (
            <span className="text-[12px] text-[#6B7280] font-mono mr-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 已自动保存
            </span>
          )}
          {!readOnly && (
            <button
              onClick={onPublish}
              className="px-8 py-2 bg-[#EF6B00] text-white rounded-[16px] text-[16px] font-[700] hover:bg-[#CC5B00] transition-all flex items-center gap-2 shadow-md"
            >
              <Send className="w-4 h-4" /> 发布此版本
            </button>
          )}
        </div>
      </div>

      {/* --- Three Column Layout --- */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6 relative z-10" ref={containerRef}>

        {/* --- SVG Layer for Lines --- */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
          {drawLines()}
        </svg>

        {/* Left Column: Design Annotation Edit Area */}
        <div className="w-1/4 flex flex-col gap-4 z-20">
          <div className="flex-1 flex flex-col bg-white rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#E5E7EB] overflow-hidden">
            <div className="p-5 border-b border-[#E5E7EB] flex justify-between items-center bg-[#E5E7EB]/10">
              <div>
                <h2 className="font-[900] text-[16px] text-[#0A0A0A] tracking-wide flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#EF6B00]" /> {isLocked ? '查看' : '编辑'} 设计注释
                </h2>
                <p className="text-[12px] text-[#6B7280] mt-1 uppercase tracking-wider font-[500]">Design Notes</p>
              </div>
              {!isLocked && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setIsAddingAnnotation(!isAddingAnnotation)}
                    className={cn(
                      "p-2 rounded-[12px] transition-all text-[12px] font-[500] flex items-center gap-1 shadow-sm border",
                      isAddingAnnotation
                        ? "bg-[#EF6B00]/10 text-[#EF6B00] border-[#EF6B00]/20 ring-2 ring-[#EF6B00]/20"
                        : "bg-white text-[#0A0A0A] border-[#E5E7EB] hover:bg-[#E5E7EB]/30"
                    )}
                    title="在图纸上打点添加注释"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> {isAddingAnnotation ? '取消打点' : '图纸打点'}
                  </button>
                </div>
              )}
            </div>

            <div
              className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar"
              onScroll={() => setRedrawTrigger(prev => prev + 1)}
            >
              {[...page.annotations].map((anno) => (
                <div
                  key={anno.id}
                  ref={el => annotationCardRefs.current[anno.id] = el}
                  onMouseEnter={() => setHoveredAnnotationId(anno.id)}
                  onMouseLeave={() => setHoveredAnnotationId(null)}
                  className={cn(
                    "bg-white border rounded-[24px] p-4 relative transition-all group",
                    hoveredAnnotationId === anno.id ? "border-[#EF6B00]/30 shadow-md ring-2 ring-[#EF6B00]/10" : "border-[#E5E7EB] shadow-sm hover:border-[#EF6B00]/20"
                  )}
                >
                  <div className="absolute -left-3 -top-3 w-7 h-7 bg-[#0A0A0A] text-white rounded-full flex items-center justify-center text-[12px] font-[700] shadow-md border-2 border-white">
                    {getAnnotationImageIndex(anno.id)}
                  </div>

                  <div className="flex justify-between items-center mb-3 ml-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-[500] text-[#6B7280] uppercase tracking-wider">
                        图纸位置
                      </span>
                      <span className="text-[12px] bg-[#E5E7EB]/30 text-[#6B7280] px-1.5 py-0.5 rounded font-sans">
                        X:{Math.round(anno.point?.x || 0)} Y:{Math.round(anno.point?.y || 0)}
                      </span>
                    </div>
                    {!isLocked && (
                      <button
                        onClick={() => deleteAnnotation(anno.id)}
                        className="text-[#6B7280] hover:text-[#EF6B00] transition-colors p-1 rounded-md hover:bg-[#EF6B00]/5"
                        title="删除此注释"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div
                    className={cn(
                      "text-[16px] text-[#0A0A0A] bg-[#E5E7EB]/10 border border-transparent rounded-[12px] p-3 min-h-[5rem] transition-all",
                      !isLocked && "cursor-text hover:border-[#E5E7EB] hover:bg-white"
                    )}
                  >
                    {!isLocked ? (
                      <textarea
                        className="w-full h-full bg-transparent outline-none resize-none font-sans"
                        value={anno.content}
                        onChange={(e) => updateAnnotation(anno.id, e.target.value)}
                        placeholder="点击添加内容..."
                      />
                    ) : (
                      <div className="font-sans">{anno.content || <span className="text-[#6B7280] italic">暂无内容</span>}</div>
                    )}
                  </div>
                </div>
              ))}
              {page.annotations.length === 0 && (
                <div className="text-center text-[#6B7280] text-[16px] py-12 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#E5E7EB]/20 flex items-center justify-center mb-2">
                    <Edit3 className="w-5 h-5 text-[#6B7280]" />
                  </div>
                  <p>{isLocked ? '暂无设计注释' : '点击上方按钮添加设计注释'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Column: Main Content Edit Area */}
        <div
          className="w-2/4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-12 z-20"
          onScroll={() => setRedrawTrigger(prev => prev + 1)}
        >
          {/* 1. Title Edit */}
          <div className="flex-none bg-white rounded-[24px] p-6 text-center border border-[#E5E7EB] shadow-[0_12px_32px_rgba(0,0,0,0.08)] group relative transition-all">
            {!isLocked && (
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-[12px] text-[#EF6B00] bg-[#EF6B00]/5 px-2 py-1 rounded-md flex items-center gap-1 pointer-events-none transition-opacity font-[500]">
                <Edit3 className="w-3 h-3" /> 点击编辑标题
              </div>
            )}
            <input
              type="text"
              value={page.title}
              onChange={(e) => !isLocked && updateCurrentPage({ ...page, title: e.target.value })}
              readOnly={isLocked}
              className={cn(
                "w-full text-[48px] font-[900] text-[#0A0A0A] bg-transparent border-b-2 border-transparent text-center outline-none transition-colors font-title",
                !isLocked && "hover:border-[#E5E7EB] focus:border-[#EF6B00]"
              )}
              placeholder="输入页面大标题..."
            />
          </div>

          {/* 2. Text Edit */}
          <div className="flex-none bg-white rounded-[24px] p-8 border border-[#E5E7EB] shadow-[0_12px_32px_rgba(0,0,0,0.08)] group relative transition-all">
            {!isLocked && (
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-[12px] text-[#EF6B00] bg-[#EF6B00]/5 px-2 py-1 rounded-md flex items-center gap-1 pointer-events-none transition-opacity font-[500]">
                <Edit3 className="w-3 h-3" /> 点击编辑正文
              </div>
            )}
            <textarea
              value={page.text}
              onChange={(e) => !isLocked && updateCurrentPage({ ...page, text: e.target.value })}
              readOnly={isLocked}
              className={cn(
                "w-full text-[#6B7280] text-[16px] leading-relaxed bg-transparent border border-transparent rounded-[12px] p-4 min-h-[150px] resize-none outline-none transition-all font-sans",
                !isLocked && "hover:border-[#E5E7EB] hover:bg-[#E5E7EB]/10 focus:border-[#EF6B00]/30 focus:bg-white focus:ring-4 focus:ring-[#EF6B00]/5"
              )}
              placeholder="输入页面描述文字..."
            />
          </div>

          {/* 3. Image Edit */}
          <div className="flex-1 min-h-[500px] relative flex items-center justify-center p-3 group">
            {/* Background Layer */}
            <div className={cn(
              "absolute inset-0 bg-white rounded-[24px] border shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 -z-10",
              isAddingAnnotation ? "border-[#EF6B00]/30 ring-4 ring-[#EF6B00]/10" : "border-[#E5E7EB] group-hover:border-[#EF6B00]/20"
            )} />

            {/* Image Actions */}
            {!isLocked && (
              <div className="absolute top-6 right-6 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleReplaceImage}
                  className="px-6 py-2 bg-white/90 backdrop-blur-md border border-[#E5E7EB] rounded-[16px] text-[16px] font-[700] text-[#0A0A0A] hover:text-[#EF6B00] hover:border-[#EF6B00]/20 flex items-center gap-2 shadow-sm transition-all">
                  <ImageIcon className="w-4 h-4" /> 替换图纸
                </button>
              </div>
            )}

            {isAddingAnnotation && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#EF6B00]/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-[16px] font-[700] shadow-lg z-[60] pointer-events-none animate-pulse flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> 请点击图纸上的具体位置添加注释点
              </div>
            )}

            <div
              ref={imageContainerRef}
              onClick={handleImageClick}
              className={cn(
                "relative w-full h-full flex items-center justify-center rounded-[24px] overflow-hidden",
                isAddingAnnotation ? "cursor-crosshair" : ""
              )}>
              <img
                src={page.imageUrl}
                alt="CAD Floor Plan"
                className="w-full h-full object-contain bg-[#E5E7EB]/10 relative z-10"
                referrerPolicy="no-referrer"
              />

              {/* Render Annotation Dots on Image */}
              {page.annotations.map((anno) => (
                <div
                  key={`dot-${anno.id}`}
                  onMouseEnter={() => setHoveredAnnotationId(anno.id)}
                  onMouseLeave={() => setHoveredAnnotationId(null)}
                  className={cn(
                    "absolute w-7 h-7 rounded-full border-[2.5px] border-white shadow-md -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform cursor-pointer z-50",
                    hoveredAnnotationId === anno.id ? "bg-[#EF6B00] scale-125 z-[60] ring-4 ring-[#EF6B00]/30" : "bg-[#0A0A0A] z-50"
                  )}
                  style={{ left: `${anno.point?.x || 0}%`, top: `${anno.point?.y || 0}%` }}
                >
                  <span className="text-[12px] text-white font-[700]">{getAnnotationImageIndex(anno.id)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Feedback View Area */}
        <div className="w-1/4 flex flex-col gap-4 z-20">
          <div className="flex-1 flex flex-col bg-white rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#E5E7EB] overflow-hidden relative">

            <div className="p-5 border-b border-[#E5E7EB] flex justify-between items-center bg-[#E5E7EB]/10">
              <div>
                <h2 className="font-[900] text-[16px] text-[#0A0A0A] tracking-wide flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#4887FF]" /> 客户反馈参考
                </h2>
                <p className="text-[12px] text-[#6B7280] mt-1 uppercase tracking-wider font-[500]">From Previous Version</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {page.comments.map((comment) => (
                <div
                  key={comment.id}
                  ref={el => commentCardRefs.current[comment.id] = el}
                  className="bg-white border border-[#E5E7EB] shadow-sm rounded-[24px] p-4 relative"
                >
                  <div className="absolute -right-3 -top-3 w-7 h-7 bg-[#4887FF] text-white rounded-full flex items-center justify-center text-[12px] font-[700] shadow-md border-2 border-white">
                    {getCommentImageIndex(comment.id)}
                  </div>

                  <div className="text-[12px] font-[500] text-[#6B7280] mb-2 uppercase tracking-wider">
                    针对: 图纸位置
                  </div>

                  <div className="text-[16px] text-[#0A0A0A] leading-relaxed bg-[#E5E7EB]/10 p-3 rounded-[12px] border border-[#E5E7EB] font-sans">
                    {comment.content}
                  </div>
                </div>
              ))}

              {page.comments.length === 0 && (
                <div className="text-center text-[#6B7280] text-[16px] py-12 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#E5E7EB]/20 flex items-center justify-center mb-2 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#4887FF]" />
                  </div>
                  <p>该页面暂无客户反馈记录</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
