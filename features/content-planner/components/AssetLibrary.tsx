"use client";

import React, { useState } from "react";
import { Asset } from "../types";
import {
  Search,
  Upload,
  MoreHorizontal,
  FileText,
  Image as ImageIcon,
  Video,
  FileCode,
  Filter,
  X,
  Trash2,
  Download,
  Plus,
  Paperclip
} from "lucide-react";

interface AssetLibraryProps {
  assets: Asset[];
  onUpload: (file: any) => void;
  onDelete: (id: string) => void;
}

export default function AssetLibrary({ assets, onUpload, onDelete }: AssetLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("All");

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || asset.type.toLowerCase().includes(filterType.toLowerCase());
    return matchesSearch && matchesType;
  });

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon size={14} />;
    if (type.includes('video')) return <Video size={14} />;
    return <FileText size={14} />;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-black/[0.1] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] animate-in fade-in duration-500">
      {/* Toolbar */}
      <div className="px-8 py-5 border-b border-black/[0.06] bg-black/[0.01] flex items-center justify-between">
        <div className="flex items-center gap-6 flex-1">
          <div className="relative flex-1 max-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={14} />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-black/[0.1] rounded-sm pl-10 pr-4 py-2 text-[13px] font-display focus:outline-none focus:border-black transition-all placeholder:opacity-20"
            />
          </div>
          <div className="flex items-center gap-1 border border-black/[0.1] rounded-sm p-1 bg-white">
            {["All", "Image", "Video"].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-sm font-display text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${filterType === type ? 'bg-black text-white shadow-sm' : 'text-on-surface/60 hover:text-on-surface hover:bg-black/[0.02]'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <button className="flex items-center gap-2.5 bg-black text-white px-5 py-2.5 rounded-sm font-display text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-black/90 transition-all shadow-sm active:scale-[0.98]">
          <Plus size={14} />
          UPLOAD
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-8 bg-black/[0.02]">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAssets.map(asset => (
            <div key={asset.id} className="group relative bg-white border border-black/[0.1] rounded-sm overflow-hidden hover:border-black hover:shadow-[10px_10px_30px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300">
              <div className="aspect-square bg-black/[0.01] flex items-center justify-center relative overflow-hidden border-b border-black/[0.04]">
                {asset.url !== "#" ? (
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="opacity-60 scale-150 transition-transform group-hover:scale-110 duration-500">
                    {getFileIcon(asset.type)}
                  </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                  <button className="p-2.5 bg-white text-black rounded-sm hover:scale-110 active:scale-95 transition-all shadow-xl">
                    <Download size={14} />
                  </button>
                  <button onClick={() => onDelete(asset.id)} className="p-2.5 bg-white text-red-600 rounded-sm hover:scale-110 active:scale-95 transition-all shadow-xl">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-display text-[12px] font-bold text-on-surface truncate pr-2 tracking-tight group-hover:text-black transition-colors">{asset.name}</h4>
                  <div className="opacity-60 scale-75 origin-right">{getFileIcon(asset.type)}</div>
                </div>
                <div className="flex items-center justify-between opacity-60">
                  <span className="font-display text-[8px] font-bold uppercase tracking-widest">{asset.size}</span>
                  <span className="font-display text-[8px] font-bold uppercase tracking-widest">
                    {asset.date.toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredAssets.length === 0 && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-60">
              <Paperclip size={40} className="mb-4" strokeWidth={1} />
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em]">No assets matching filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
