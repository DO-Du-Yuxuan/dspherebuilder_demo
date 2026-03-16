import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  User,
  MapPin,
  DollarSign,
  CheckCircle2,
  ArrowLeft,
  Pencil,
  Package,
  Hammer,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "../utils/constants";
import { Header } from "../components/Header";
import { getCurrentUser, logout } from "../utils/authUtils";
import "../styles/quotation.css";

// --- Types ---
interface SettlementItem {
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

// --- Mock Data ---
const MOCK_DATA = {
  orderNumber: "PSO-OD_LHJCF-00471",
  customer: {
    name: "张先生",
    address: "杭州市滨江区龙湖璟宸府12号楼1001室",
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

// --- Sub-components ---

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

function DesignDetails({ 
  items, 
  total, 
  title = "高端设计结算明细",
  summaryText = "设计费用结算合计："
}: { 
  items: SettlementItem[]; 
  total: number; 
  title?: string;
  summaryText?: string;
}) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm p-6 border border-[#E5E7EB] mb-8">
      <TableHeader colorClass="bg-[#4887FF]" title={title} icon={Pencil} />
      <DetailTable 
        items={items} 
        total={total} 
        borderColor="border-[#4887FF]/20" 
        headerBg="bg-blue-50" 
        footerTextColor="text-[#4887FF]"
        summaryText={summaryText}
      />
    </div>
  );
}

function ProductDetails({ 
  items, 
  total, 
  title = "严选精品结算明细",
  summaryText = "货品费用结算合计："
}: { 
  items: SettlementItem[]; 
  total: number; 
  title?: string;
  summaryText?: string;
}) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm p-6 border border-[#E5E7EB] mb-8">
      <TableHeader colorClass="bg-[#10B981]" title={title} icon={Package} />
      <DetailTable 
        items={items} 
        total={total} 
        borderColor="border-[#10B981]/20" 
        headerBg="bg-green-50" 
        footerTextColor="text-[#10B981]"
        summaryText={summaryText}
      />
    </div>
  );
}

function ConstructionDetails({ 
  items, 
  total, 
  title = "匠心施工结算明细",
  summaryText = "施工费用结算合计："
}: { 
  items: SettlementItem[]; 
  total: number; 
  title?: string;
  summaryText?: string;
}) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm p-6 border border-[#E5E7EB] mb-8">
      <TableHeader colorClass="bg-[#8B5CF6]" title={title} icon={Hammer} />
      <DetailTable 
        items={items} 
        total={total} 
        borderColor="border-[#8B5CF6]/20" 
        headerBg="bg-purple-50" 
        footerTextColor="text-[#8B5CF6]"
        summaryText={summaryText}
      />
    </div>
  );
}

// --- Main Page ---

export default function QuotationPage() {
  const navigate = useNavigate();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header 
        projectName={MOCK_DATA.customer.name + "的家"}
        orderNumber={MOCK_DATA.orderNumber}
        userName={user.name || user.username}
        onHomeClick={() => navigate(ROUTES.HOME)}
        onProjectClick={() => navigate(ROUTES.PROJECTS)}
        onOrderClick={() => navigate(ROUTES.ORDERS)}
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
              <div className="text-[16px] font-bold text-[#0A0A0A] mt-1">{MOCK_DATA.orderNumber}</div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-[24px] p-6 border border-[#E5E7EB]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-sm"><User className="w-5 h-5 text-[#EF6B00]" /></div>
                <div>
                  <span className="text-[14px] text-[#6B7280] font-medium">客户姓名</span>
                  <div className="font-semibold text-[#0A0A0A] text-[16px]">{MOCK_DATA.customer.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-sm"><MapPin className="w-5 h-5 text-[#EF6B00]" /></div>
                <div>
                  <span className="text-[14px] text-[#6B7280] font-medium">项目地址</span>
                  <div className="font-normal text-[#0A0A0A] text-[16px]">{MOCK_DATA.customer.address}</div>
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
              <div className="text-[48px] font-black tracking-tight">¥{MOCK_DATA.pricing.total.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/30 text-center">
              {[
                { label: "高端设计报价", value: MOCK_DATA.pricing.design },
                { label: "严选精品报价", value: MOCK_DATA.pricing.product },
                { label: "匠心施工报价", value: MOCK_DATA.pricing.construction },
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
        <DesignDetails 
          items={MOCK_DATA.designItems} 
          total={MOCK_DATA.pricing.design} 
          title="高端设计报价明细"
          summaryText="设计费用报价合计："
        />

        {/* P - Product */}
        <ProductDetails 
          items={MOCK_DATA.productItems} 
          total={MOCK_DATA.pricing.product} 
          title="严选精品报价明细"
          summaryText="货品费用报价合计："
        />

        {/* C - Construction */}
        <ConstructionDetails 
          items={MOCK_DATA.constructionItems} 
          total={MOCK_DATA.pricing.construction} 
          title="匠心施工报价明细"
          summaryText="施工费用报价合计："
        />

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
    </div>
  );
}
