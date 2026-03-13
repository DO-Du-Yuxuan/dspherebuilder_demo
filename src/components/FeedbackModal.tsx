import { useState } from "react";
import { X, MessageSquare, Send } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
}

export function FeedbackModal({
  isOpen,
  onClose,
  onSubmit,
}: FeedbackModalProps) {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (feedback.trim()) {
      onSubmit(feedback);
      setFeedback("");
    }
  };

  const handleClose = () => {
    setFeedback("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-[24px] shadow-card max-w-2xl w-full animate-scaleIn">
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="bg-[#EF6B00] p-2 rounded-xl">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-[30px] font-black text-[#0A0A0A]">
                您的想法对我们很重要
              </h2>
              <p className="text-[12px] text-[#6B7280] mt-1 font-medium">
                请告诉我们您的想法和建议，我们会尽快联系您沟通调整方案
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-[16px] font-bold text-[#0A0A0A] mb-2">
              您的反馈建议{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="例如：希望能调整设计方案的预算，或者对某些材料品牌有不同想法..."
              className="w-full h-48 px-4 py-3 border-2 border-[#E5E7EB] rounded-[24px] focus:border-[#EF6B00] focus:outline-none resize-none bg-orange-50/30 transition-colors text-[16px] text-[#0A0A0A]"
              maxLength={500}
            />
            <div className="flex items-center justify-end mt-2">
              <p className="text-[#6B7280] text-[12px] font-medium">
                {feedback.length}/500
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E5E7EB] bg-gray-50 rounded-b-[24px]">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 text-[#0A0A0A] bg-white border border-[#E5E7EB] hover:bg-gray-100 rounded-[16px] transition-colors font-bold text-[16px]"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!feedback.trim()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[16px] font-bold text-[16px] transition-all ${
              feedback.trim()
                ? "bg-[#EF6B00] hover:bg-[#CC5B00] text-white shadow-card hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
            提交反馈
          </button>
        </div>
      </div>
    </div>
  );
}
