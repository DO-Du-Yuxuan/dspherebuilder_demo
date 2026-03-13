import { useState } from "react";
import {
  FileText,
  User,
  MapPin,
  DollarSign,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { DesignDetails } from "../../components/DesignDetails";
import { ProductDetails } from "../../components/ProductDetails";
import { ConstructionDetails } from "../../components/ConstructionDetails";
import { SignatureModal } from "../../components/SignatureModal";
import { FeedbackModal } from "../../components/FeedbackModal";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "../../utils/constants";
import { Hammer } from "lucide-react";

// --- Mock Data ---
const settlementData = {
  orderNumber: "EPC-2026-0115-001",
  customer: {
    name: "张先生",
    address: "上海市浦东新区世纪大道1000号",
  },
  pricing: {
    design: 36000,
    product: 156000,
    construction: 88000,
    total: 280000,
  },
  designItems: [
    {
      id: 1,
      epcCode: "E-1001",
      orderType: "PSO-E 高端设计",
      salesOrder: "SO2026031301",
      unit: "套",
      quotationQuantity: 1,
      quotationUnitPrice: 8000,
      quotationAmount: 8000,
      settlementQuantity: 1,
      settlementAmount: 8000,
      settlementRemark: "按原方案交付",
    },
    {
      id: 2,
      epcCode: "E-1002",
      orderType: "PSO-E 高端设计",
      salesOrder: "SO2026031301",
      unit: "张",
      quotationQuantity: 4,
      quotationUnitPrice: 3000,
      quotationAmount: 12000,
      settlementQuantity: 4,
      settlementAmount: 12000,
      settlementRemark: "加急渲染已完成",
    },
    {
      id: 3,
      epcCode: "E-1003",
      orderType: "PSO-E 高端设计",
      salesOrder: "SO2026031301",
      unit: "套",
      quotationQuantity: 1,
      quotationUnitPrice: 12000,
      quotationAmount: 12000,
      settlementQuantity: 1,
      settlementAmount: 12000,
      settlementRemark: "全套图纸已存档",
    },
    {
      id: 4,
      epcCode: "E-1004",
      orderType: "PSO-E 高端设计",
      salesOrder: "SO2026031301",
      unit: "套",
      quotationQuantity: 1,
      quotationUnitPrice: 4000,
      quotationAmount: 4000,
      settlementQuantity: 1,
      settlementAmount: 4000,
      settlementRemark: "选样已确认",
    },
  ],
  productItems: [
    {
      id: 1,
      epcCode: "P-2001",
      orderType: "PSO-P 严选精品",
      salesOrder: "SO2026031302",
      unit: "㎡",
      quotationQuantity: 40,
      quotationUnitPrice: 280,
      quotationAmount: 11200,
      settlementQuantity: 40,
      settlementAmount: 11200,
      settlementRemark: "型号：马可波罗M123",
    },
    {
      id: 2,
      epcCode: "P-2002",
      orderType: "PSO-P 严选精品",
      salesOrder: "SO2026031302",
      unit: "㎡",
      quotationQuantity: 60,
      quotationUnitPrice: 380,
      quotationAmount: 22800,
      settlementQuantity: 60,
      settlementAmount: 22800,
      settlementRemark: "型号：圣象S456",
    },
  ],
  constructionItems: [
    {
      id: 1,
      epcCode: "C-3001",
      orderType: "PSO-C 匠心施工",
      salesOrder: "SO2026031303",
      unit: "㎡",
      quotationQuantity: 25,
      quotationUnitPrice: 180,
      quotationAmount: 4500,
      settlementQuantity: 25,
      settlementAmount: 4500,
      settlementRemark: "已完工验收",
    },
    {
      id: 2,
      epcCode: "C-3002",
      orderType: "PSO-C 匠心施工",
      salesOrder: "SO2026031303",
      unit: "㎡",
      quotationQuantity: 120,
      quotationUnitPrice: 150,
      quotationAmount: 18000,
      settlementQuantity: 120,
      settlementAmount: 18000,
      settlementRemark: "强弱电布线完成",
    },
  ],
};

export default function SettlementPage() {
  const navigate = useNavigate();
  const [showSignature, setShowSignature] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);

  const handleSignatureConfirm = (signature: string) => {
    setSignatureData(signature);
    setIsConfirmed(true);
    setShowSignature(false);
    toast.success("结算单已确认！感谢您的支持。");
  };

  const handleFeedbackSubmit = (feedback: string) => {
    setFeedbackText(feedback);
    setIsFeedbackSubmitted(true);
    setShowFeedback(false);
    toast.success("感谢您的反馈！我们会尽快核对结算内容。");
  };

  return (
    <div className="min-h-screen bg-white pb-20">
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
              <div className="bg-slate-800 p-3 rounded-xl shadow-lg">
                <Hammer className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-[48px] font-black text-[#0A0A0A]">完工结算单</h1>
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
              <div className="text-[16px] font-bold text-[#0A0A0A] mt-1">{settlementData.orderNumber}</div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-[24px] p-6 border border-[#E5E7EB]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-sm"><User className="w-5 h-5 text-[#EF6B00]" /></div>
                <div>
                  <span className="text-[12px] text-[#6B7280] font-medium">客户姓名</span>
                  <div className="font-semibold text-[#0A0A0A] text-[16px]">{settlementData.customer.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-sm"><MapPin className="w-5 h-5 text-[#EF6B00]" /></div>
                <div>
                  <span className="text-[12px] text-[#6B7280] font-medium">项目地址</span>
                  <div className="font-normal text-[#0A0A0A] text-[16px]">{settlementData.customer.address}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Price */}
          <div className="mt-6 bg-[#EF6B00] rounded-[24px] p-8 text-white shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><DollarSign className="w-7 h-7" /></div>
                <span className="text-[16px] font-normal">结算总价</span>
              </div>
              <div className="text-[48px] font-black tracking-tight">¥{settlementData.pricing.total.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/30 text-center">
              {[
                { label: "高端设计结算", value: settlementData.pricing.design },
                { label: "严选精品结算", value: settlementData.pricing.product },
                { label: "匠心施工结算", value: settlementData.pricing.construction },
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
        <DesignDetails items={settlementData.designItems} total={settlementData.pricing.design} />

        {/* P - Product */}
        <ProductDetails items={settlementData.productItems} total={settlementData.pricing.product} />

        {/* C - Construction */}
        <ConstructionDetails items={settlementData.constructionItems} total={settlementData.pricing.construction} />

        {/* Footer Text & Confirm */}
        <div className="bg-white rounded-[24px] shadow-card p-8 mt-12 border border-[#E5E7EB]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-[#EF6B00] rounded-full"></div>
            <h3 className="font-black text-[#0A0A0A] text-[30px]">感谢您对居梦科技的支持与信任!</h3>
          </div>
          <div className="text-[16px] text-[#0A0A0A] leading-relaxed space-y-4 mb-8">
            <p>基于您在报价阶段已经确定的订购报价单,我司现针对已完成!的所有工作内容与相关服务进行结算。</p>
            <p>本结算单所列金额为财务已核算金额,并已根据合同条款、阶段性验收结果及相关变更调整事项进行确认。</p>
            <p>请您仔细核对以下各项结算费用。若您有任何疑问或异议,请您于收数到本结算单后三个工作日内提出,以便及时协商解决。</p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            {!isConfirmed && !isFeedbackSubmitted ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => setShowSignature(true)} className="flex items-center gap-3 bg-[#EF6B00] text-white px-8 py-4 rounded-[16px] font-bold text-[16px]">
                    <CheckCircle2 className="w-6 h-6" />确认结算单
                  </button>
                  <button onClick={() => setShowFeedback(true)} className="flex items-center gap-3 bg-white text-[#0A0A0A] border border-[#E5E7EB] px-8 py-4 rounded-[16px] font-bold text-[16px]">
                    <MessageSquare className="w-6 h-6" />结算内容异议
                  </button>
                </div>
              </div>
            ) : isConfirmed ? (
              <div className="bg-green-50 rounded-[24px] p-6 border border-green-200 flex justify-between items-start">
                <div>
                  <h4 className="font-black text-green-900 text-[30px] mb-2">结算单已确认</h4>
                  <p className="text-[16px] text-[#6B7280]">感谢您的确认！项目结算流程已完成。</p>
                </div>
                {signatureData && <img src={signatureData} alt="Signature" className="w-48 h-24 border-2 border-green-300 rounded-xl bg-white object-contain" />}
              </div>
            ) : (
              <div className="bg-orange-50 rounded-[24px] p-6 border border-orange-200">
                <h4 className="font-black text-[#0A0A0A] text-[30px] mb-2">异议已记录</h4>
                <p className="text-[16px] text-[#6B7280]">我们已收到您的结算异议，核算专员将在1个工作日内联系您复核数据。</p>
                {feedbackText && <div className="mt-4 p-3 bg-white border border-orange-200 rounded-xl text-[14px]">{feedbackText}</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      <SignatureModal isOpen={showSignature} onClose={() => setShowSignature(false)} onConfirm={handleSignatureConfirm} />
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} onSubmit={handleFeedbackSubmit} />
    </div>
  );
}
