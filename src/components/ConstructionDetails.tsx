import { Hammer } from "lucide-react";

interface ConstructionItem {
  id: number;
  item: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface ConstructionDetailsProps {
  items: ConstructionItem[];
  total: number;
}

export function ConstructionDetails({
  items,
  total,
}: ConstructionDetailsProps) {
  return (
    <div className="bg-white rounded-[24px] shadow-card hover:shadow-xl transition-all duration-300 p-6 mb-24 border border-[#E5E7EB]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#B300FA] p-3 rounded-xl shadow-md">
            <Hammer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-[30px] font-black text-[#0A0A0A]">
              匠心施工报价明细
            </h2>
          </div>
        </div>
      </div>

      <div className="animate-fadeIn">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#B300FA]/20 bg-purple-50">
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] rounded-tl-xl whitespace-nowrap">
                  序号
                </th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">
                  匠心施工明细编码
                </th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] min-w-[200px]">
                  服务名称
                </th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">
                  交付成果
                </th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">
                  验收方式
                </th>
                <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">
                  服务单价 CNY
                </th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">
                  服务单位
                </th>
                <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">
                  服务数量
                </th>
                <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">
                  工程管理费比例
                </th>
                <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">
                  工程管理服务费
                </th>
                <th className="text-right py-4 px-4 text-[12px] font-bold text-[#0A0A0A] whitespace-nowrap">
                  服务明细总价 CNY
                </th>
                <th className="text-left py-4 px-4 text-[12px] font-bold text-[#0A0A0A] rounded-tr-xl whitespace-nowrap">
                  明细报价备注
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-[#E5E7EB] hover:bg-purple-50/30 transition-colors"
                >
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">
                    {index + 1}
                  </td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">
                    C-{3001 + index}
                  </td>
                  <td className="py-4 px-4 text-[16px] font-normal text-[#0A0A0A]">
                    {item.item}
                  </td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">
                    -
                  </td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">
                    现场验收
                  </td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">
                    {item.unitPrice.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">
                    {item.unit}
                  </td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">
                    {item.quantity}
                  </td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">
                    8%
                  </td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A] text-right">
                    {(item.amount * 0.08).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-[16px] font-semibold text-[#0A0A0A] text-right">
                    {item.amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-[16px] text-[#0A0A0A]">
                    -
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-purple-50 border-t-2 border-[#B300FA]/30">
                <td
                  colSpan={10}
                  className="py-4 px-4 text-[16px] font-bold text-[#0A0A0A] text-right rounded-bl-xl"
                >
                  施工费用合计：
                </td>
                <td className="py-4 px-4 text-[30px] font-black text-[#B300FA] text-right">
                  ¥{total.toLocaleString()}
                </td>
                <td className="rounded-br-xl"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}