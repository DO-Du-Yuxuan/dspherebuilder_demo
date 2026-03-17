import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "../utils/constants";
import { Header } from "../components/Header";
import { getCurrentUser, logout } from "../utils/authUtils";
import "../styles/quotation.css";

// --- Types ---
interface DesignItem {
  id: number;
  code: string;
  type: string;
  name: string;
  deliverable: string;
  format: string;
  unitPrice: number;
  unit: string;
  quantity: number;
  totalPrice: number;
}

interface ProductItem {
  id: number;
  code: string;
  type: string;
  label: string;
  brand: string;
  spec: string;
  size: string;
  image: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface ConstructionItem {
  id: number;
  code: string;
  name: string;
  deliverable: string;
  acceptance: string;
  unitPrice: number;
  unit: string;
  quantity: number;
  mgmtRate: string;
  mgmtFee: number;
  totalPrice: number;
  remark: string;
}

// --- Mock Data ---
const MOCK_DATA = {
  orderNumber: "PSO-OD_LHJCF-00471",
  customer: {
    name: "张先生",
    address: "杭州市滨江区龙湖璟宸府12号楼1001室",
  },
  pricing: {
    design: 8000,
    product: 34000,
    construction: 23940,
    total: 65940,
  },
  designItems: [
    {
      id: 1,
      code: "E-1001",
      type: "QT- O 订购",
      name: "平面布局设计",
      deliverable: "-",
      format: "-",
      unitPrice: 8000,
      unit: "套",
      quantity: 1,
      totalPrice: 8000,
    },
  ],
  productItems: [
    {
      id: 1,
      code: "P-2001",
      type: "QT- O 订购",
      label: "客厅瓷砖（800x800mm）",
      brand: "马可波罗",
      spec: "-",
      size: "-",
      image: "-",
      unit: "㎡",
      quantity: 40,
      unitPrice: 280,
      totalPrice: 11200,
    },
    {
      id: 2,
      code: "P-2002",
      type: "QT- O 订购",
      label: "实木复合地板",
      brand: "圣象",
      spec: "-",
      size: "-",
      image: "-",
      unit: "㎡",
      quantity: 60,
      unitPrice: 380,
      totalPrice: 22800,
    },
  ],
  constructionItems: [
    {
      id: 1,
      code: "C-3001",
      name: "墙体拆除与新建",
      deliverable: "-",
      acceptance: "现场验收",
      unitPrice: 180,
      unit: "㎡",
      quantity: 25,
      mgmtRate: "8%",
      mgmtFee: 360,
      totalPrice: 4500,
      remark: "-",
    },
    {
      id: 2,
      code: "C-3002",
      name: "水电改造工程",
      deliverable: "-",
      acceptance: "隐蔽工程验收",
      unitPrice: 150,
      unit: "㎡",
      quantity: 120,
      mgmtRate: "8%",
      mgmtFee: 1440,
      totalPrice: 19440,
      remark: "含强弱电布线",
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

function DesignDetails({ 
  items, 
  total, 
  title = "高端设计报价明细",
  summaryText = "设计费用报价合计："
}: { 
  items: DesignItem[]; 
  total: number; 
  title?: string;
  summaryText?: string;
}) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm p-6 border border-[#E5E7EB] mb-8">
      <TableHeader colorClass="bg-[#4887FF]" title={title} icon={Pencil} />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[#4887FF]/20 bg-blue-50">
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] rounded-tl-xl whitespace-nowrap">序号</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">高端设计明细编码</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">报价单类型</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">服务名称</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">交付成果</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">交付形式</th>
              <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">服务单价 CNY</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">服务单位</th>
              <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">服务数量</th>
              <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] rounded-tr-xl whitespace-nowrap">服务明细总价 CNY</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b border-[#E5E7EB] hover:bg-blue-50/30 transition-colors">
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{index + 1}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] whitespace-nowrap">{item.code}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] whitespace-nowrap">{item.type}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] whitespace-nowrap">{item.name}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{item.deliverable}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{item.format}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.unitPrice.toLocaleString()}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{item.unit}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.quantity}</td>
                <td className="py-4 px-4 text-[16px] font-semibold text-[#0A0A0A] text-right">{item.totalPrice.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-blue-50 border-t-2 border-[#4887FF]/20">
              <td colSpan={9} className="py-4 px-4 text-[16px] font-bold text-[#0A0A0A] text-right rounded-bl-xl">{summaryText}</td>
              <td className="py-4 px-4 text-[30px] font-black text-[#4887FF] text-right rounded-br-xl">¥{total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function ProductDetails({ 
  items, 
  total, 
  title = "严选精品报价明细",
  summaryText = "货品费用报价合计："
}: { 
  items: ProductItem[]; 
  total: number; 
  title?: string;
  summaryText?: string;
}) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm p-6 border border-[#E5E7EB] mb-8">
      <TableHeader colorClass="bg-[#10B981]" title={title} icon={Package} />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[#10B981]/20 bg-green-50">
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] rounded-tl-xl whitespace-nowrap">序号</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">严选臻品明细编码</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">报价单类型</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">产品标签</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">品牌</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">产品规格</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">产品尺寸</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">产品附图</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">产品单位</th>
              <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">产品数量</th>
              <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">产品含税单价 CNY</th>
              <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] rounded-tr-xl whitespace-nowrap">产品含税总价 CNY</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b border-[#E5E7EB] hover:bg-green-50/30 transition-colors">
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{index + 1}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] whitespace-nowrap">{item.code}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] whitespace-nowrap">{item.type}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] whitespace-nowrap">{item.label}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] whitespace-nowrap">{item.brand}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] whitespace-nowrap">{item.spec}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] whitespace-nowrap">{item.size}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] whitespace-nowrap">{item.image}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{item.unit}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.quantity}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.unitPrice.toLocaleString()}</td>
                <td className="py-4 px-4 text-[16px] font-semibold text-[#0A0A0A] text-right">{item.totalPrice.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-green-50 border-t-2 border-[#10B981]/20">
              <td colSpan={11} className="py-4 px-4 text-[16px] font-bold text-[#0A0A0A] text-right rounded-bl-xl">{summaryText}</td>
              <td className="py-4 px-4 text-[30px] font-black text-[#10B981] text-right rounded-br-xl">¥{total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function ConstructionDetails({ 
  items, 
  total, 
  title = "匠心施工报价明细",
  summaryText = "施工费用报价合计："
}: { 
  items: ConstructionItem[]; 
  total: number; 
  title?: string;
  summaryText?: string;
}) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm p-6 border border-[#E5E7EB] mb-8">
      <TableHeader colorClass="bg-[#8B5CF6]" title={title} icon={Hammer} />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[#8B5CF6]/20 bg-purple-50">
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] rounded-tl-xl whitespace-nowrap">序号</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">匠心施工明细编码</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">服务名称</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">交付成果</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">验收方式</th>
              <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">服务单价 CNY</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">服务单位</th>
              <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">服务数量</th>
              <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">工程管理费比例</th>
              <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">工程管理服务费</th>
              <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">服务明细总价 CNY</th>
              <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] rounded-tr-xl whitespace-nowrap">明细报价备注</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b border-[#E5E7EB] hover:bg-purple-50/30 transition-colors">
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{index + 1}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] whitespace-nowrap">{item.code}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] whitespace-nowrap">{item.name}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{item.deliverable}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] whitespace-nowrap">{item.acceptance}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.unitPrice.toLocaleString()}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{item.unit}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.quantity}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.mgmtRate}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.mgmtFee.toLocaleString()}</td>
                <td className="py-4 px-4 text-[16px] font-semibold text-[#0A0A0A] text-right">{item.totalPrice.toLocaleString()}</td>
                <td className="py-4 px-4 text-[16px] text-[#0A0A0A] min-w-[150px]">{item.remark}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-purple-50 border-t-2 border-[#8B5CF6]/20">
              <td colSpan={11} className="py-4 px-4 text-[16px] font-bold text-[#0A0A0A] text-right rounded-bl-xl">{summaryText}</td>
              <td className="py-4 px-4 text-[30px] font-black text-[#8B5CF6] text-right rounded-br-xl">¥{total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function QuotationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { project, order, quotation } = location.state || {};

  const [isConfirmed, setIsConfirmed] = useState(quotation?.status === 'signed');
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(quotation?.status === 'feedback');
  const [signatureData, setSignatureData] = useState<string | null>(quotation?.signedAt ? "https://picsum.photos/seed/signature/200/100" : null);
  const [feedbackText, setFeedbackText] = useState<string | null>(quotation?.feedback || null);
  const user = getCurrentUser();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header 
        projectName={project?.name || MOCK_DATA.customer.name + "的家"}
        orderNumber={order?.orderNumber || MOCK_DATA.orderNumber}
        userName={user.name || user.username}
        onHomeClick={() => navigate(ROUTES.HOME)}
        onProjectClick={() => navigate(ROUTES.PROJECTS)}
        onOrderClick={() => navigate(ROUTES.ORDERS, { state: { project } })}
        onLogout={handleLogout}
      />
      <div className="max-w-screen-2xl mx-auto p-6">  
        {/* Header */}
        <div className="bg-white rounded-[24px] shadow-card p-8 mb-8 border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(ROUTES.OVERVIEW, { state: { project, order } })}
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
              <div className="text-[16px] font-bold text-[#0A0A0A] mt-1">{order?.orderNumber || MOCK_DATA.orderNumber}</div>
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
          <div className="space-y-10">
            {/* Payment Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-[#EF6B00] rounded-full"></div>
                <h3 className="font-black text-[#0A0A0A] text-[30px]">您可向居梦科技对公收款账户付款：</h3>
              </div>
              <div className="text-[16px] text-[#0A0A0A] space-y-3 ml-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-[#EF6B00] rounded-full"></div>
                  <p><span className="font-bold">账户名称：</span>居梦科技（深圳）有限公司</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-[#EF6B00] rounded-full"></div>
                  <p><span className="font-bold">账户号码：</span>755953465810902</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-[#EF6B00] rounded-full"></div>
                  <p><span className="font-bold">开户银行：</span>招商银行深圳分行滨海支行</p>
                </div>
              </div>
            </div>

            {/* EPC Order Remarks */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-[#EF6B00] rounded-full"></div>
                <h3 className="font-black text-[#0A0A0A] text-[30px]">EPC 订单报价备注：</h3>
              </div>
              <div className="text-[16px] text-[#0A0A0A] space-y-3 ml-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-[#EF6B00] rounded-full"></div>
                  <p>本报价单内报价均为含税报价</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-[#EF6B00] rounded-full"></div>
                  <p>产品与服务报价数量仅供参考</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-[#EF6B00] rounded-full"></div>
                  <p>实际数量以验收后结算单为准</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            {isConfirmed ? (
              <div className="bg-green-50 rounded-[24px] p-6 border border-green-200 flex justify-between items-start">
                <div>
                  <h4 className="font-black text-green-900 text-[30px] mb-2">报价单已确认</h4>
                  <p className="text-[16px] text-[#6B7280]">感谢您的确认！项目报价流程已完成。</p>
                </div>
                {!!signatureData && (
                  <div className="w-48 h-24 border-2 border-green-300 rounded-xl bg-white flex items-center justify-center text-slate-300 font-bold text-sm">
                    签字区域
                  </div>
                )}
              </div>
            ) : isFeedbackSubmitted ? (
              <div className="bg-[#FFF9F2] rounded-[24px] p-8 border border-[#FFEDD5] flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-6">
                  <div className="bg-[#EF6B00] p-4 rounded-2xl shadow-lg shadow-[#EF6B00]/20">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#0A0A0A] text-[32px] mb-1">调整建议已收到</h4>
                    <div className="text-[14px] text-[#6B7280] mb-3">提交时间：{quotation?.feedbackAt || formatDateTime(new Date().toISOString())}</div>
                    <p className="text-[16px] text-[#6B7280]">感谢您的宝贵意见！我们的客户经理会在1个工作日内联系您，沟通调整方案。</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">您的反馈</span>
                  <div className="bg-white border-2 border-[#FFEDD5] rounded-2xl px-6 py-4 shadow-sm min-w-[120px] text-center">
                    <span className="text-[20px] font-black text-[#0A0A0A]">{feedbackText || "太贵了"}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
