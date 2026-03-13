import { Pencil } from "lucide-react";

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
            <td colSpan={10} className="py-4 px-4 text-[16px] font-bold text-[#0A0A0A] text-right rounded-bl-xl">设计费用结算合计：</td>
            <td className={`py-4 px-4 text-[30px] font-black ${footerTextColor} text-right rounded-br-xl`}>¥{total.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export function DesignDetails({ items, total }: { items: SettlementItem[]; total: number }) {
  return (
    <div className="bg-white rounded-[24px] shadow-card p-6 border border-[#E5E7EB] mb-8">
      <TableHeader colorClass="bg-[#4887FF]" title="高端设计结算明细" icon={Pencil} />
      <DetailTable 
        items={items} 
        total={total} 
        borderColor="border-[#4887FF]/20" 
        headerBg="bg-blue-50" 
        footerTextColor="text-[#4887FF]"
        summaryText="设计费用结算合计："
      />
    </div>
  );
}
