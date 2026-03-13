import React from 'react';
import { SettlementItem } from '../types';

interface SettlementTableProps {
  title: string;
  items: SettlementItem[];
}

export const SettlementTable: React.FC<SettlementTableProps> = ({ title, items }) => {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-[#E5E7EB] overflow-hidden mb-8">
      <div className="px-8 py-6 border-b border-[#E5E7EB] bg-slate-50/50">
        <h3 className="text-[20px] font-black text-[#0A0A0A]">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-[#E5E7EB]">
              <th className="px-8 py-4 text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">EPC编码</th>
              <th className="px-4 py-4 text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">订单类型</th>
              <th className="px-4 py-4 text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">销售订单</th>
              <th className="px-4 py-4 text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">单位</th>
              <th className="px-4 py-4 text-[12px] font-bold text-[#6B7280] uppercase tracking-wider text-right">报价数量</th>
              <th className="px-4 py-4 text-[12px] font-bold text-[#6B7280] uppercase tracking-wider text-right">报价单价</th>
              <th className="px-4 py-4 text-[12px] font-bold text-[#6B7280] uppercase tracking-wider text-right">报价金额</th>
              <th className="px-4 py-4 text-[12px] font-bold text-[#6B7280] uppercase tracking-wider text-right">结算数量</th>
              <th className="px-4 py-4 text-[12px] font-bold text-[#6B7280] uppercase tracking-wider text-right">结算金额</th>
              <th className="px-8 py-4 text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">备注</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-4 text-[14px] font-mono text-[#6B7280]">{item.epcCode}</td>
                <td className="px-4 py-4 text-[14px] text-[#0A0A0A] font-medium">{item.orderType}</td>
                <td className="px-4 py-4 text-[14px] font-mono text-[#6B7280]">{item.salesOrder}</td>
                <td className="px-4 py-4 text-[14px] text-[#6B7280]">{item.unit}</td>
                <td className="px-4 py-4 text-[14px] text-[#0A0A0A] text-right">{item.quotationQuantity}</td>
                <td className="px-4 py-4 text-[14px] text-[#0A0A0A] text-right">¥{item.quotationUnitPrice.toLocaleString()}</td>
                <td className="px-4 py-4 text-[14px] font-bold text-[#0A0A0A] text-right">¥{item.quotationAmount.toLocaleString()}</td>
                <td className="px-4 py-4 text-[14px] text-[#0A0A0A] text-right">{item.settlementQuantity}</td>
                <td className="px-4 py-4 text-[14px] font-bold text-[#EF6B00] text-right">¥{item.settlementAmount.toLocaleString()}</td>
                <td className="px-8 py-4 text-[14px] text-[#6B7280]">{item.settlementRemark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
