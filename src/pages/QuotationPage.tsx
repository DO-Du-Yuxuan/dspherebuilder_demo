import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  User,
  MapPin,
  DollarSign,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "../utils/constants";
import { MOCK_SETTLEMENT_DATA } from "../mock";
import { SettlementTable } from "../components/SettlementTable";
import { SignatureModal } from "../components/SignatureModal";
import { FeedbackModal } from "../components/FeedbackModal";
import { Header } from "../components/Header";
import { getCurrentUser, logout } from "../utils/authUtils";
import "../styles/quotation.css";

// --- Main Page ---

export default function QuotationPage() {
  const navigate = useNavigate();
  const [showSignature, setShowSignature] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const user = getCurrentUser();

  const handleSignatureConfirm = (signature: string) => {
    setSignatureData(signature);
    setIsConfirmed(true);
    setShowSignature(false);
    toast.success("报价单已确认！感谢您的支持。");
  };

  const handleFeedbackSubmit = (feedback: string) => {
    setFeedbackText(feedback);
    setIsFeedbackSubmitted(true);
    setShowFeedback(false);
    toast.success("感谢您的反馈！我们会尽快核对报价内容。");
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header 
        projectName={MOCK_SETTLEMENT_DATA.customer.name + "的家"}
        orderNumber={MOCK_SETTLEMENT_DATA.orderNumber}
        userName={user.name || user.username}
        onHomeClick={() => navigate(ROUTES.HOME)}
        onProjectClick={() => navigate(ROUTES.PROJECTS)}
        onLogout={handleLogout}
      />
      <div className="max-w-screen-2xl mx-auto p-6">  
        {/* Header */}
        <div className="bg-white rounded-[24px] shadow-card p-8 mb-8 border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(ROUTES.OVERVIEW)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                title="返回方案管理"
              >
                <ArrowLeft className="w-6 h-6 text-[#6B7280]" />
              </button>
              <div className="bg-[#EF6B00] p-3 rounded-xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-[48px] font-black text-[#0A0A0A]">订购报价单</h1>
                {isConfirmed && (
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-[12px] text-green-600 font-medium">客户已确认</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right bg-gray-50 px-6 py-4 rounded-xl">
              <div className="text-[12px] text-[#6B7280] uppercase tracking-wide font-medium">销售订单</div>
              <div className="text-[16px] font-bold text-[#0A0A0A] mt-1">{MOCK_SETTLEMENT_DATA.orderNumber}</div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-[24px] p-6 border border-[#E5E7EB]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-sm"><User className="w-5 h-5 text-[#EF6B00]" /></div>
                <div>
                  <span className="text-[14px] text-[#6B7280] font-medium">客户姓名</span>
                  <div className="font-semibold text-[#0A0A0A] text-[16px]">{MOCK_SETTLEMENT_DATA.customer.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-sm"><MapPin className="w-5 h-5 text-[#EF6B00]" /></div>
                <div>
                  <span className="text-[14px] text-[#6B7280] font-medium">项目地址</span>
                  <div className="font-normal text-[#0A0A0A] text-[16px]">{MOCK_SETTLEMENT_DATA.customer.address}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Price */}
          <div className="mt-6 bg-[#EF6B00] rounded-[24px] p-8 text-white shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><DollarSign className="w-7 h-7" /></div>
                <span className="text-[16px] font-normal">报价总价</span>
              </div>
              <div className="text-[48px] font-black tracking-tight">¥{MOCK_SETTLEMENT_DATA.pricing.total.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/30 text-center">
              {[
                { label: "高端设计报价", value: MOCK_SETTLEMENT_DATA.pricing.design },
                { label: "严选精品报价", value: MOCK_SETTLEMENT_DATA.pricing.product },
                { label: "匠心施工报价", value: MOCK_SETTLEMENT_DATA.pricing.construction },
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-[16px] p-4">
                  <div className="text-[12px] text-white/80 uppercase tracking-wide font-medium">{item.label}</div>
                  <div className="text-[30px] font-black mt-2">¥{item.value.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* E - Design */}
        <SettlementTable title="高端设计报价明细" items={MOCK_SETTLEMENT_DATA.designItems} />

        {/* P - Product */}
        <SettlementTable title="严选精品报价明细" items={MOCK_SETTLEMENT_DATA.productItems} />

        {/* C - Construction */}
        <SettlementTable title="匠心施工报价明细" items={MOCK_SETTLEMENT_DATA.constructionItems} />

        {/* Footer Text & Confirm */}
        <div className="bg-white rounded-[24px] shadow-card p-8 mt-12 border border-[#E5E7EB]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-[#EF6B00] rounded-full"></div>
            <h3 className="font-black text-[#0A0A0A] text-[30px]">感谢您对居梦科技的支持与信任!</h3>
          </div>
          <div className="text-[16px] text-[#0A0A0A] leading-relaxed space-y-4 mb-8">
            <p>基于您在方案阶段已经确定的内容,我司现针对相关服务内容进行报价确认。</p>
            <p>本报价单所列金额为财务已核算金额,并已根据合同条款、阶段性沟通结果及相关调整事项进行确认。</p>
            <p>请您仔细核对以下各项报价费用。若您有任何疑问或异议,请您于收到本报价单后三个工作日内提出,以便及时协商解决。</p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            {isConfirmed ? (
              <div className="bg-green-50 rounded-[24px] p-6 border border-green-200 flex justify-between items-start">
                <div>
                  <h4 className="font-black text-green-900 text-[30px] mb-2">报价单已确认</h4>
                  <p className="text-[16px] text-[#6B7280]">感谢您的确认！项目报价流程已完成。</p>
                </div>
                {signatureData && <img src={signatureData} alt="Signature" className="w-48 h-24 border-2 border-green-300 rounded-xl bg-white object-contain" />}
              </div>
            ) : isFeedbackSubmitted ? (
              <div className="bg-orange-50 rounded-[24px] p-6 border border-orange-200">
                <h4 className="font-black text-[#0A0A0A] text-[30px] mb-2">异议已记录</h4>
                <p className="text-[16px] text-[#6B7280]">我们已收到您的报价异议，核算专员将在1个工作日内联系您复核数据。</p>
                {feedbackText && <div className="mt-4 p-3 bg-white border border-orange-200 rounded-xl text-[14px]">{feedbackText}</div>}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <SignatureModal isOpen={showSignature} onClose={() => setShowSignature(false)} onConfirm={handleSignatureConfirm} />
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} onSubmit={handleFeedbackSubmit} />
    </div>
  );
}
