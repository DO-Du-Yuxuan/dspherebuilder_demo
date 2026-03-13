import { useState } from "react";
import { X } from "lucide-react";

export function FeedbackModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[24px] shadow-card max-w-lg w-full">
        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="text-[24px] font-black text-[#0A0A0A]">结算异议反馈</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-[#6B7280]" /></button>
        </div>
        <div className="p-6">
          <textarea 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="请详细说明您对结算明细的异议点..." 
            className="w-full h-40 p-4 border-2 border-[#E5E7EB] rounded-xl focus:border-[#EF6B00] outline-none"
          />
        </div>
        <div className="p-6 flex justify-end gap-3 bg-gray-50 rounded-b-[24px]">
          <button onClick={onClose} className="px-6 py-2 text-[#0A0A0A] bg-white border border-[#E5E7EB] rounded-xl font-bold">取消</button>
          <button onClick={() => onSubmit(text)} className="px-6 py-2 bg-[#EF6B00] text-white rounded-xl font-bold">提交反馈</button>
        </div>
      </div>
    </div>
  );
}
