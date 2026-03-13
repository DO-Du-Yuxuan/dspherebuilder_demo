import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  User,
  MapPin,
  DollarSign,
  CheckCircle2,
  MessageSquare,
  X,
  RotateCcw,
  Pencil,
  Package,
  Hammer,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "../utils/constants";
import "../styles/quotation.css";

// --- Types ---
export interface SettlementItem {
  id: number;
  epcCode: string;
  orderType: string;
  salesOrder: string;
  unit: string;
  quotationQuantity: number;
  quotationUnitPrice: number;
  quotationAmount: number;
  settlementQuantity: number;
  settlementAmount: number;
  settlementRemark: string;
}

// --- Mock Data (Cleaned) ---
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

// --- Sub-Components ---

function TableHeader({ colorClass, title, icon: Icon }: { colorClass: string; title: string; icon: any }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`${colorClass} p-3 rounded-xl shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-[30px] font-black text-[#0A0A0A]">{title}</h2>
        </div>
      </div>
    </div>
  );
}

function DetailTable({ 
  items, 
  total, 
  borderColor, 
  headerBg, 
  footerTextColor,
  summaryText
}: { 
  items: SettlementItem[]; 
  total: number;
  borderColor: string;
  headerBg: string;
  footerTextColor: string;
  summaryText: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className={`border-b-2 ${borderColor} ${headerBg}`}>
            <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] rounded-tl-xl whitespace-nowrap">序号</th>
            <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">EPC明细编码</th>
            <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">工单类型</th>
            <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">销售订单</th>
            <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">报价单位</th>
            <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">报价数量</th>
            <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">报价单价</th>
            <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">报价金额</th>
            <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">结算数量</th>
            <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">结算金额</th>
            <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] rounded-tr-xl whitespace-nowrap">结算说明</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id} className={`border-b border-[#E5E7EB] hover:${headerBg}/30 transition-colors`}>
              <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{index + 1}</td>
              <td className="py-4 px-4 text-[16px] text-[#0A0A0A] whitespace-nowrap">{item.epcCode}</td>
              <td className="py-4 px-4 text-[16px] text-[#0A0A0A] whitespace-nowrap">{item.orderType}</td>
              <td className="py-4 px-4 text-[16px] text-[#0A0A0A] whitespace-nowrap">{item.salesOrder}</td>
              <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{item.unit}</td>
              <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.quotationQuantity}</td>
              <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.quotationUnitPrice.toLocaleString()}</td>
              <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.quotationAmount.toLocaleString()}</td>
              <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.settlementQuantity}</td>
              <td className="py-4 px-4 text-[16px] font-semibold text-[#0A0A0A] text-right">{item.settlementAmount.toLocaleString()}</td>
              <td className="py-4 px-4 text-[16px] text-[#0A0A0A] min-w-[150px]">{item.settlementRemark}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={`${headerBg} border-t-2 ${borderColor}`}>
            <td colSpan={10} className="py-4 px-4 text-[16px] font-bold text-[#0A0A0A] text-right rounded-bl-xl">{summaryText}</td>
            <td className={`py-4 px-4 text-[30px] font-black ${footerTextColor} text-right rounded-br-xl`}>¥{total.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function SignatureModal({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: (data: string) => void }) {
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

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[24px] shadow-card max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="bg-[#EF6B00] p-2 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-[30px] font-black text-[#0A0A0A]">确认结算单</h2>
              <p className="text-[12px] text-[#6B7280] mt-1 font-medium">请在下方签名区域签署您的姓名以确认此结算单</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-[16px] font-bold text-[#0A0A0A] mb-2">客户签名 <span className="text-red-500">*</span></label>
            <div className="relative border-2 border-dashed border-[#E5E7EB] rounded-[24px] bg-orange-50 overflow-hidden">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={() => setIsDrawing(false)}
                onMouseLeave={() => setIsDrawing(false)}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={() => setIsDrawing(false)}
                className="w-full h-64 cursor-crosshair touch-none"
              />
              {!hasSignature && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[#6B7280]">请在此处签名</div>}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => {
              const ctx = canvasRef.current?.getContext('2d');
              ctx?.clearRect(0, 0, canvasRef.current?.width || 0, canvasRef.current?.height || 0);
              setHasSignature(false);
            }} className="flex items-center gap-2 px-4 py-2 text-[#0A0A0A] hover:bg-gray-100 rounded-xl transition-colors font-bold text-[16px]">
              <RotateCcw className="w-4 h-4" />清除重写
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E5E7EB] bg-gray-50 rounded-b-[24px]">
          <button onClick={onClose} className="px-6 py-2.5 text-[#0A0A0A] bg-white border border-[#E5E7EB] hover:bg-gray-100 rounded-[16px] font-bold text-[16px]">取消</button>
          <button 
            onClick={() => onConfirm(canvasRef.current?.toDataURL('image/png') || '')} 
            disabled={!hasSignature}
            className={`px-6 py-2.5 rounded-[16px] font-bold text-[16px] transition-all ${hasSignature ? 'bg-[#EF6B00] hover:bg-[#CC5B00] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >确认提交</button>
        </div>
      </div>
    </div>
  );
}

function FeedbackModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (text: string) => void }) {
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

// --- Main Page ---

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
    toast.success("报价单已确认！感谢您的支持。");
  };

  const handleFeedbackSubmit = (feedback: string) => {
    setFeedbackText(feedback);
    setIsFeedbackSubmitted(true);
    setShowFeedback(false);
    toast.success("感谢您的反馈！我们会尽快核对报价内容。");
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
                <span className="text-[16px] font-normal">报价总价</span>
              </div>
              <div className="text-[48px] font-black tracking-tight">¥{settlementData.pricing.total.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/30 text-center">
              {[
                { label: "高端设计报价", value: settlementData.pricing.design },
                { label: "严选精品报价", value: settlementData.pricing.product },
                { label: "匠心施工报价", value: settlementData.pricing.construction },
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
        <div className="bg-white rounded-[24px] shadow-card p-6 border border-[#E5E7EB] mb-8">
          <TableHeader colorClass="bg-[#4887FF]" title="高端设计报价明细" icon={Pencil} />
          <DetailTable 
            items={settlementData.designItems} 
            total={settlementData.pricing.design} 
            borderColor="border-[#4887FF]/20" 
            headerBg="bg-blue-50" 
            footerTextColor="text-[#4887FF]"
            summaryText="设计费用报价合计："
          />
        </div>

        {/* P - Product */}
        <div className="bg-white rounded-[24px] shadow-card p-6 border border-[#E5E7EB] mb-8">
          <TableHeader colorClass="bg-[#10B981]" title="严选精品报价明细" icon={Package} />
          <DetailTable 
            items={settlementData.productItems} 
            total={settlementData.pricing.product} 
            borderColor="border-[#10B981]/20" 
            headerBg="bg-green-50" 
            footerTextColor="text-[#10B981]"
            summaryText="货品费用报价合计："
          />
        </div>

        {/* C - Construction */}
        <div className="bg-white rounded-[24px] shadow-card p-6 border border-[#E5E7EB] mb-8">
          <TableHeader colorClass="bg-[#8B5CF6]" title="匠心施工报价明细" icon={Hammer} />
          <DetailTable 
            items={settlementData.constructionItems} 
            total={settlementData.pricing.construction} 
            borderColor="border-[#8B5CF6]/20" 
            headerBg="bg-purple-50" 
            footerTextColor="text-[#8B5CF6]"
            summaryText="施工费用报价合计："
          />
        </div>

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
            {!isConfirmed && !isFeedbackSubmitted ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => setShowSignature(true)} className="flex items-center gap-3 bg-[#EF6B00] text-white px-8 py-4 rounded-[16px] font-bold text-[16px]">
                    <CheckCircle2 className="w-6 h-6" />确认报价单
                  </button>
                  <button onClick={() => setShowFeedback(true)} className="flex items-center gap-3 bg-white text-[#0A0A0A] border border-[#E5E7EB] px-8 py-4 rounded-[16px] font-bold text-[16px]">
                    <MessageSquare className="w-6 h-6" />报价内容异议
                  </button>
                </div>
              </div>
            ) : isConfirmed ? (
              <div className="bg-green-50 rounded-[24px] p-6 border border-green-200 flex justify-between items-start">
                <div>
                  <h4 className="font-black text-green-900 text-[30px] mb-2">报价单已确认</h4>
                  <p className="text-[16px] text-[#6B7280]">感谢您的确认！项目报价流程已完成。</p>
                </div>
                {signatureData && <img src={signatureData} alt="Signature" className="w-48 h-24 border-2 border-green-300 rounded-xl bg-white object-contain" />}
              </div>
            ) : (
              <div className="bg-orange-50 rounded-[24px] p-6 border border-orange-200">
                <h4 className="font-black text-[#0A0A0A] text-[30px] mb-2">异议已记录</h4>
                <p className="text-[16px] text-[#6B7280]">我们已收到您的报价异议，核算专员将在1个工作日内联系您复核数据。</p>
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
