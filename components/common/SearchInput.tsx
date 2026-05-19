"use client";

import React from "react";
import { Search } from "lucide-react";
import Input from "../ui/Input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: string | number;
  className?: string;
}

export default function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  width = 240,
  className = ""
}: SearchInputProps) {
  return (
    <Input 
      icon={Search}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      style={{ width }}
      containerClassName="w-auto"
    />
  );
}
