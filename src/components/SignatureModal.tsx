import { useRef, useState, useEffect } from 'react';
import { X, RotateCcw, CheckCircle2 } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureData: string) => void;
}

export function SignatureModal({ isOpen, onClose, onConfirm }: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        ctx.strokeStyle = '#EF6B00';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const signatureData = canvas.toDataURL('image/png');
    onConfirm(signatureData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-[24px] shadow-card max-w-2xl w-full animate-scaleIn">
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="bg-[#EF6B00] p-2 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-[30px] font-black text-[#0A0A0A]">确认报价单</h2>
              <p className="text-[12px] text-[#6B7280] mt-1 font-medium">请在下方签名区域签署您的姓名以确认此报价单</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-[16px] font-bold text-[#0A0A0A] mb-2">
              客户签名 <span className="text-red-500">*</span>
            </label>
            <div className="relative border-2 border-dashed border-[#E5E7EB] rounded-[24px] bg-orange-50 overflow-hidden">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-64 cursor-crosshair touch-none"
              />
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-[#6B7280] text-[16px] font-normal">请在此处签名</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={clearSignature}
              className="flex items-center gap-2 px-4 py-2 text-[#0A0A0A] hover:bg-gray-100 rounded-xl transition-colors font-bold text-[16px]"
            >
              <RotateCcw className="w-4 h-4" />
              清除重写
            </button>
            <div className="text-[12px] text-[#6B7280] font-medium">
              支持鼠标或触摸屏手写签名
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E5E7EB] bg-gray-50 rounded-b-[24px]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-[#0A0A0A] bg-white border border-[#E5E7EB] hover:bg-gray-100 rounded-[16px] transition-colors font-bold text-[16px]"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasSignature}
            className={`px-6 py-2.5 rounded-[16px] font-bold text-[16px] transition-all ${
              hasSignature
                ? 'bg-[#EF6B00] hover:bg-[#CC5B00] text-white shadow-card hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            确认提交
          </button>
        </div>
      </div>
    </div>
  );
}
