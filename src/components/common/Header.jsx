import React from 'react';
import { Activity } from "lucide-react";

export default function Header() {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <div className="text-left">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            AVA – ACS
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Sistema de Avaliação do Agente Comunitário de Saúde
          </p>
        </div>
      </div>
    </div>
  );
}