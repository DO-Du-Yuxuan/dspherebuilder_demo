import { Pencil } from 'lucide-react';

interface DesignItem {
  id: number;
  item: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface DesignDetailsProps {
  items: DesignItem[];
  total: number;
}

export function DesignDetails({ items, total }: DesignDetailsProps) {
  return (
    <div className="bg-white rounded-[24px] shadow-card hover:shadow-xl transition-all duration-300 p-6 mb-24 border border-[#E5E7EB]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#4887FF] p-3 rounded-xl shadow-md">
            <Pencil className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-[30px] font-black text-[#0A0A0A]">高端设计报价明细</h2>
          </div>
        </div>
      </div>

      <div className="animate-fadeIn">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#4887FF]/20 bg-blue-50">
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] rounded-tl-xl whitespace-nowrap">序号</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">高端设计明细编码</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">报价单类型</th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] min-w-[200px]">服务名称</th>
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
                <tr 
                  key={item.id} 
                  className="border-b border-[#E5E7EB] hover:bg-blue-50/30 transition-colors"
                >
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{index + 1}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">E-{1001 + index}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">QT- O 订购</td>
                  <td className="py-4 px-4 text-[16px] font-normal text-[#0A0A0A]">{item.item}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">-</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">-</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.unitPrice.toLocaleString()}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">{item.unit}</td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">{item.quantity}</td>
                  <td className="py-4 px-4 text-[16px] font-semibold text-[#0A0A0A] text-right">{item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50 border-t-2 border-[#4887FF]/30">
                <td colSpan={9} className="py-4 px-4 text-[16px] font-bold text-[#0A0A0A] text-right rounded-bl-xl">设计费用合计：</td>
                <td className="py-4 px-4 text-[30px] font-black text-[#4887FF] text-right rounded-br-xl">¥{total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}