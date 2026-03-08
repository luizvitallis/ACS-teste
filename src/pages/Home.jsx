import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  Users, 
  ClipboardCheck, 
  FileBarChart, 
  Settings,
  Activity,
  TrendingUp,
  Building2,
  UserCheck,
  LogOut
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from '@/components/common/Header';
import AdminAuth from '@/components/ui/AdminAuth';

export default function Home() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ acs: 0, avaliacoes: 0, metas: 0 });
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = () => {
    const loggedUser = localStorage.getItem('ava_acs_user');
    if (!loggedUser) {
      window.location.href = createPageUrl('AcessoSistema');
    }
  };

  const loadData = async () => {
    try {
      const loggedUser = localStorage.getItem('ava_acs_user');
      if (!loggedUser) return;
      
      const userData = JSON.parse(loggedUser);
      setUser(userData);
      
      let acsList, avaliacoesList;
      
      if (userData?.perfil === 'administrador') {
        acsList = await base44.entities.ACS.list();
        avaliacoesList = await base44.entities.Avaliacao.list();
      } else {
        const userEmail = `${userData.usuario}@sistema.local`;
        acsList = await base44.entities.ACS.filter({ created_by: userEmail });
        avaliacoesList = await base44.entities.Avaliacao.filter({ created_by: userEmail });
      }
      
      const metasList = await base44.entities.Meta.filter({ ativa: true });
      
      setStats({
        acs: acsList.length,
        avaliacoes: avaliacoesList.length,
        metas: metasList.length
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAccess = () => {
    setShowAdminAuth(false);
    window.location.href = createPageUrl('PainelAdmin');
  };

  const handleLogout = () => {
    localStorage.removeItem('ava_acs_user');
    window.location.href = createPageUrl('AcessoSistema');
  };

  const menuItems = [
    {
      title: 'Cadastrar ACS',
      description: 'Cadastre novos Agentes Comunitários de Saúde',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      link: 'CadastroACS'
    },
    {
      title: 'Avaliar ACS',
      description: 'Realize avaliações dos agentes',
      icon: ClipboardCheck,
      color: 'from-emerald-500 to-teal-600',
      link: 'Avaliacao'
    },
    {
      title: 'Relatórios',
      description: 'Visualize relatórios e indicadores',
      icon: FileBarChart,
      color: 'from-purple-500 to-purple-600',
      link: 'Relatorios'
    },
    {
      title: 'Painel Admin',
      description: 'Acesso restrito à gestão',
      icon: Settings,
      color: 'from-orange-500 to-red-500',
      isAdmin: true
    }
  ];

  // Adicionar item de Gerenciar Usuários apenas para admins
  if (user?.perfil === 'administrador') {
    menuItems.push({
      title: 'Gerenciar Usuários',
      description: 'Gerenciar usuários e senhas do sistema',
      icon: Users,
      color: 'from-indigo-500 to-purple-500',
      link: 'GerenciarCredenciais'
    });
  }

  const statsCards = [
    { label: 'ACS Cadastrados', value: stats.acs, icon: UserCheck, color: 'text-blue-600 bg-blue-50' },
    { label: 'Avaliações', value: stats.avaliacoes, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Metas Ativas', value: stats.metas, icon: Activity, color: 'text-purple-600 bg-purple-50' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            Bem-vindo, <strong>{user?.nome_completo}</strong>
            {user?.perfil === 'administrador' && (
              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">Admin</span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
        <Header />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {statsCards.map((stat, idx) => (
            <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item, idx) => (
            item.isAdmin ? (
              <Card 
                key={idx}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group"
                onClick={() => setShowAdminAuth(true)}
              >
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-r ${item.color} p-6 text-white`}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                        <item.icon className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{item.title}</h3>
                        <p className="text-white/80 text-sm mt-1">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Link key={idx} to={createPageUrl(item.link)}>
                <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group h-full">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-r ${item.color} p-6 text-white`}>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                          <item.icon className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{item.title}</h3>
                          <p className="text-white/80 text-sm mt-1">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            AVA – ACS © 2024 • Sistema de Avaliação do Agente Comunitário de Saúde
          </p>
        </div>
      </div>

      <AdminAuth 
        isOpen={showAdminAuth}
        onClose={() => setShowAdminAuth(false)}
        onSuccess={handleAdminAccess}
      />
    </div>
  );
}