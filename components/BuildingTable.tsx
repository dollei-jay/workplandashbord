import React from 'react';
import { BuildingItem } from '../types';
import { Trash2, Plus, Box, Database } from 'lucide-react';

interface BuildingTableProps {
  data: BuildingItem[];
  onChange: (newData: BuildingItem[]) => void;
}

const BuildingTable: React.FC<BuildingTableProps> = ({ data, onChange }) => {
  
  const handleUpdate = (index: number, field: keyof BuildingItem, value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const handleDelete = (index: number) => {
    if (window.confirm('确定要删除这行数据吗？')) {
      const newData = data.filter((_, i) => i !== index);
      onChange(newData);
    }
  };

  const handleAdd = () => {
    const newItem: BuildingItem = {
      id: Date.now(),
      depot: "新粮库",
      name: "单体名称",
      size: "",
      note: ""
    };
    onChange([...data, newItem]);
  };

  return (
    <div className="bg-dashboard-card backdrop-blur-xl rounded-2xl shadow-card border border-white/50 flex flex-col h-full overflow-hidden">
      
      {/* Table Header / Toolbar */}
      <div className="p-5 border-b border-white/50 flex justify-between items-center bg-white/40 no-print">
        <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                <Database size={20} />
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-base">建筑单体列表</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider">详细指标统计</p>
            </div>
        </div>
        
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm shadow-md transition-all"
        >
          <Plus size={16} /> 新增
        </button>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar p-0">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 sticky top-0 z-10 font-bold tracking-wider backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 border-b border-slate-200 w-16 text-center">No.</th>
              <th className="px-6 py-4 border-b border-slate-200 w-1/5">粮库名称</th>
              <th className="px-6 py-4 border-b border-slate-200 w-1/4">单体名称</th>
              <th className="px-6 py-4 border-b border-slate-200 w-1/5">尺寸 / 仓容</th>
              <th className="px-6 py-4 border-b border-slate-200">备注</th>
              <th className="px-6 py-4 border-b border-slate-200 w-16 text-center no-print">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, index) => (
              <tr key={row.id} className="hover:bg-white/60 transition-colors group">
                <td className="px-6 py-4 text-center text-slate-400 font-mono">
                  {index + 1}
                </td>
                <td className="p-0">
                  <input
                    type="text"
                    className="w-full px-6 py-4 bg-transparent text-slate-700 focus:text-blue-700 focus:bg-white/80 focus:outline-none transition-colors border-l-2 border-transparent focus:border-blue-400 font-medium"
                    value={row.depot}
                    onChange={(e) => handleUpdate(index, 'depot', e.target.value)}
                    placeholder="..."
                  />
                </td>
                <td className="p-0">
                  <input
                    type="text"
                    className="w-full px-6 py-4 bg-transparent text-slate-900 font-bold focus:bg-white/80 focus:outline-none transition-colors"
                    value={row.name}
                    onChange={(e) => handleUpdate(index, 'name', e.target.value)}
                  />
                </td>
                <td className="p-0">
                  <div className="relative w-full h-full">
                    <input
                        type="text"
                        className="w-full px-6 py-4 bg-transparent text-blue-600 font-mono focus:bg-white/80 focus:outline-none transition-colors"
                        value={row.size}
                        onChange={(e) => handleUpdate(index, 'size', e.target.value)}
                    />
                  </div>
                </td>
                <td className="p-0">
                  <input
                    type="text"
                    className="w-full px-6 py-4 bg-transparent text-slate-500 focus:bg-white/80 focus:text-slate-800 focus:outline-none transition-colors"
                    value={row.note}
                    onChange={(e) => handleUpdate(index, 'note', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4 text-center no-print">
                  <button 
                    onClick={() => handleDelete(index)}
                    className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-20 text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                         <Box size={30} className="opacity-50" />
                    </div>
                    <span className="text-sm font-mono tracking-widest uppercase">暂无数据</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BuildingTable;