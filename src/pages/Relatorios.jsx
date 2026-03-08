import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  ArrowLeft, 
  FileBarChart,
  Filter,
  Download,
  Search,
  User,
  Building2,
  Calendar,
  TrendingUp,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Header from '@/components/common/Header';
import { UAPS_DATA, getUniqueUAPS, getINEsByUAPS, getUniqueDistritos, getUAPSByDistrito } from '@/components/common/UAPSData';

export default function Relatorios() {
  const [user, setUser] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAvaliacao, setSelectedAvaliacao] = useState(null);
  
  const [filters, setFilters] = useState({
    distrito: '',
    uaps: '',
    ine: '',
    mes: ''
  });

  const distritos = getUniqueDistritos();
  const [uapsList, setUapsList] = useState([]);
  const [inesList, setInesList] = useState([]);

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

  useEffect(() => {
    if (filters.distrito) {
      setUapsList(getUAPSByDistrito(filters.distrito));
      setFilters(prev => ({ ...prev, uaps: '', ine: '' }));
      setInesList([]);
    } else {
      setUapsList(getUniqueUAPS());
    }
  }, [filters.distrito]);

  useEffect(() => {
    if (filters.uaps) {
      const ines = getINEsByUAPS(filters.uaps);
      setInesList(ines);
      setFilters(prev => ({ ...prev, ine: '' }));
    } else {
      setInesList([]);
    }
  }, [filters.uaps]);

  const loadData = async () => {
    try {
      const loggedUser = localStorage.getItem('ava_acs_user');
      if (!loggedUser) return;
      
      const userData = JSON.parse(loggedUser);
      setUser(userData);
      
      let list;
      if (userData?.perfil === 'administrador') {
        list = await base44.entities.Avaliacao.list('-created_date');
      } else {
        const userEmail = `${userData.usuario}@sistema.local`;
        list = await base44.entities.Avaliacao.filter({ created_by: userEmail }, '-created_date');
      }
      setAvaliacoes(list);
      setUapsList(getUniqueUAPS());
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAvaliacoes = avaliacoes.filter(av => {
    if (filters.distrito && av.distrito !== filters.distrito) return false;
    if (filters.uaps && av.cnes !== filters.uaps) return false;
    if (filters.ine && av.ine !== filters.ine) return false;
    if (filters.mes && av.mes_referencia !== filters.mes) return false;
    return true;
  });

  const clearFilters = () => {
    setFilters({
      distrito: '',
      uaps: '',
      ine: '',
      mes: ''
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getProgressColor = (percentual) => {
    if (percentual >= 80) return 'bg-emerald-500';
    if (percentual >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatMes = (mes) => {
    if (!mes) return '-';
    const [year, month] = mes.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[parseInt(month) - 1]}/${year}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to={createPageUrl('Home')} className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao início
        </Link>

        <Header />

        {/* Filtros */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="border-b bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Distrito</Label>
                <Select 
                  value={filters.distrito} 
                  onValueChange={(v) => setFilters({ ...filters, distrito: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos</SelectItem>
                    {distritos.map((d) => (
                      <SelectItem key={d} value={d}>Distrito {d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>UAPS</Label>
                <Select 
                  value={filters.uaps} 
                  onValueChange={(v) => setFilters({ ...filters, uaps: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todas</SelectItem>
                    {uapsList.map((u) => (
                      <SelectItem key={u.cnes} value={u.cnes}>{u.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>INE</Label>
                <Select 
                  value={filters.ine} 
                  onValueChange={(v) => setFilters({ ...filters, ine: v })}
                  disabled={!filters.uaps}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos</SelectItem>
                    {inesList.map((ine) => (
                      <SelectItem key={ine} value={ine}>{ine}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mês</Label>
                <Input
                  type="month"
                  value={filters.mes}
                  onChange={(e) => setFilters({ ...filters, mes: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="w-5 h-5 text-purple-600" />
                Relatório de Avaliações
              </CardTitle>
              <Badge variant="outline">
                {filteredAvaliacoes.length} registro(s)
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Carregando...</div>
            ) : filteredAvaliacoes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileBarChart className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Nenhuma avaliação encontrada</p>
                <p className="text-sm mt-2">Ajuste os filtros ou realize novas avaliações</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAvaliacoes.map((av) => (
                  <Card key={av.id} className="border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-800">{av.acs_nome}</h3>
                            <Badge variant={av.status === 'finalizada' ? 'default' : 'secondary'}>
                              {av.status === 'finalizada' ? 'Finalizada' : 'Rascunho'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              {av.uaps_nome}
                            </div>
                            <div>
                              <span className="text-gray-400">INE:</span> {av.ine}
                            </div>
                            <div>
                              <span className="text-gray-400">Distrito:</span> {av.distrito}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatMes(av.mes_referencia)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`px-4 py-2 rounded-xl font-bold text-xl ${getScoreColor(av.pontuacao_total)}`}>
                            {av.pontuacao_total?.toFixed(0)}%
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedAvaliacao(av)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedAvaliacao} onOpenChange={() => setSelectedAvaliacao(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-600">
              <TrendingUp className="w-5 h-5" />
              Detalhes da Avaliação
            </DialogTitle>
          </DialogHeader>
          
          {selectedAvaliacao && (
            <div className="space-y-6">
              {/* Info do ACS */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-bold text-lg mb-2">{selectedAvaliacao.acs_nome}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">UAPS:</span> {selectedAvaliacao.uaps_nome}</div>
                  <div><span className="text-gray-500">INE:</span> {selectedAvaliacao.ine}</div>
                  <div><span className="text-gray-500">Distrito:</span> {selectedAvaliacao.distrito}</div>
                  <div><span className="text-gray-500">Período:</span> {formatMes(selectedAvaliacao.mes_referencia)}</div>
                  <div><span className="text-gray-500">Avaliador:</span> {selectedAvaliacao.enfermeiro_avaliador}</div>
                </div>
              </div>

              {/* Pontuação Total */}
              <div className={`p-4 rounded-xl text-center ${getScoreColor(selectedAvaliacao.pontuacao_total)}`}>
                <p className="text-sm opacity-70">Pontuação Total</p>
                <p className="text-4xl font-bold">{selectedAvaliacao.pontuacao_total?.toFixed(1)}%</p>
              </div>

              {/* Metas */}
              <div>
                <h4 className="font-semibold mb-3">Metas Avaliadas</h4>
                <div className="space-y-3">
                  {selectedAvaliacao.metas_avaliadas?.map((meta, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{meta.meta_descricao}</span>
                        <Badge className={getScoreColor(meta.percentual_atingido)}>
                          {meta.percentual_atingido?.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Atingido: {meta.valor_atingido}</span>
                        <span>/</span>
                        <span>Meta: {meta.valor_meta}</span>
                      </div>
                      <Progress 
                        value={meta.percentual_atingido} 
                        className="h-2 mt-2"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Observações */}
              {selectedAvaliacao.observacoes && (
                <div>
                  <h4 className="font-semibold mb-2">Observações</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedAvaliacao.observacoes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}