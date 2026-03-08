import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  ArrowLeft, 
  ClipboardCheck, 
  Search,
  User,
  Calendar,
  Target,
  Save,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from '@/components/common/Header';

export default function Avaliacao() {
  const [user, setUser] = useState(null);
  const [acsList, setAcsList] = useState([]);
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedACS, setSelectedACS] = useState(null);
  const [step, setStep] = useState('select'); // select, evaluate
  const [saving, setSaving] = useState(false);
  
  const [avaliacaoData, setAvaliacaoData] = useState({
    mes_referencia: new Date().toISOString().slice(0, 7),
    metas_avaliadas: [],
    observacoes: ''
  });

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
      
      let list;
      if (userData?.perfil === 'administrador') {
        list = await base44.entities.ACS.filter({ status: 'ativo' }, '-created_date');
      } else {
        const userEmail = `${userData.usuario}@sistema.local`;
        list = await base44.entities.ACS.filter({ 
          created_by: userEmail,
          status: 'ativo'
        }, '-created_date');
      }
      setAcsList(list);
      
      const metasAtivas = await base44.entities.Meta.filter({ ativa: true });
      setMetas(metasAtivas);
      
      // Inicializar metas_avaliadas
      setAvaliacaoData(prev => ({
        ...prev,
        metas_avaliadas: metasAtivas.map(m => ({
          meta_id: m.id,
          meta_descricao: m.descricao,
          valor_meta: m.valor_meta,
          valor_atingido: 0,
          percentual_atingido: 0
        }))
      }));
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectACS = (acs) => {
    setSelectedACS(acs);
    setStep('evaluate');
  };

  const handleMetaChange = (metaId, valor) => {
    const valorNum = parseFloat(valor) || 0;
    setAvaliacaoData(prev => ({
      ...prev,
      metas_avaliadas: prev.metas_avaliadas.map(m => {
        if (m.meta_id === metaId) {
          const percentual = m.valor_meta > 0 ? (valorNum / m.valor_meta) * 100 : 0;
          return {
            ...m,
            valor_atingido: valorNum,
            percentual_atingido: Math.min(percentual, 100)
          };
        }
        return m;
      })
    }));
  };

  const calcularPontuacaoTotal = () => {
    if (avaliacaoData.metas_avaliadas.length === 0) return 0;
    const soma = avaliacaoData.metas_avaliadas.reduce((acc, m) => acc + m.percentual_atingido, 0);
    return (soma / avaliacaoData.metas_avaliadas.length).toFixed(1);
  };

  const handleSave = async (status) => {
    setSaving(true);
    try {
      const avaliacao = {
        acs_id: selectedACS.id,
        acs_nome: selectedACS.nome,
        uaps_nome: selectedACS.uaps_nome,
        cnes: selectedACS.cnes,
        ine: selectedACS.ine,
        distrito: selectedACS.distrito,
        mes_referencia: avaliacaoData.mes_referencia,
        enfermeiro_avaliador: user.nome_completo,
        metas_avaliadas: avaliacaoData.metas_avaliadas,
        observacoes: avaliacaoData.observacoes,
        pontuacao_total: parseFloat(calcularPontuacaoTotal()),
        status
      };
      
      await base44.entities.Avaliacao.create(avaliacao);
      
      // Reset
      setStep('select');
      setSelectedACS(null);
      setAvaliacaoData({
        mes_referencia: new Date().toISOString().slice(0, 7),
        metas_avaliadas: metas.map(m => ({
          meta_id: m.id,
          meta_descricao: m.descricao,
          valor_meta: m.valor_meta,
          valor_atingido: 0,
          percentual_atingido: 0
        })),
        observacoes: ''
      });
      
      alert('Avaliação salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar avaliação');
    } finally {
      setSaving(false);
    }
  };

  const filteredList = acsList.filter(acs => 
    acs.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acs.uaps_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgressColor = (percentual) => {
    if (percentual >= 80) return 'bg-emerald-500';
    if (percentual >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to={createPageUrl('Home')} className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao início
        </Link>

        <Header />

        {step === 'select' && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Selecione o ACS para Avaliar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou UAPS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-500">Carregando...</div>
              ) : filteredList.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Nenhum ACS disponível para avaliação</p>
                  <p className="text-sm mt-2">Cadastre um ACS primeiro</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredList.map((acs) => (
                    <Card 
                      key={acs.id} 
                      className="border cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all"
                      onClick={() => handleSelectACS(acs)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">{acs.nome}</h3>
                          <p className="text-sm text-gray-500">
                            {acs.uaps_nome} • INE: {acs.ine} • Distrito: {acs.distrito}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 'evaluate' && selectedACS && (
          <div className="space-y-6">
            {/* Info do ACS */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedACS.nome}</h2>
                    <p className="text-gray-500">
                      {selectedACS.uaps_nome} • INE: {selectedACS.ine}
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setStep('select');
                      setSelectedACS(null);
                    }}
                  >
                    Trocar ACS
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Período */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <div className="flex-1">
                    <Label>Mês de Referência</Label>
                    <Input
                      type="month"
                      value={avaliacaoData.mes_referencia}
                      onChange={(e) => setAvaliacaoData({ ...avaliacaoData, mes_referencia: e.target.value })}
                      className="max-w-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metas */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-emerald-600">
                  <Target className="w-5 h-5" />
                  Avaliação de Metas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {metas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Nenhuma meta cadastrada</p>
                    <p className="text-sm mt-2">Acesse o painel administrativo para cadastrar metas</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {avaliacaoData.metas_avaliadas.map((meta, idx) => (
                      <div key={meta.meta_id} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-800">{meta.meta_descricao}</h4>
                            <p className="text-sm text-gray-500">Meta: {meta.valor_meta}</p>
                          </div>
                          <Badge 
                            className={`${
                              meta.percentual_atingido >= 80 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : meta.percentual_atingido >= 50 
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {meta.percentual_atingido.toFixed(0)}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <Input
                            type="number"
                            value={meta.valor_atingido || ''}
                            onChange={(e) => handleMetaChange(meta.meta_id, e.target.value)}
                            placeholder="Valor atingido"
                            className="w-32"
                            min="0"
                          />
                          <div className="flex-1">
                            <Progress 
                              value={meta.percentual_atingido} 
                              className="h-3"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pontuação Total */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100">Pontuação Total</p>
                    <p className="text-4xl font-bold">{calcularPontuacaoTotal()}%</p>
                  </div>
                  <CheckCircle className="w-16 h-16 text-white/30" />
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <Label>Observações</Label>
                <Textarea
                  value={avaliacaoData.observacoes}
                  onChange={(e) => setAvaliacaoData({ ...avaliacaoData, observacoes: e.target.value })}
                  placeholder="Adicione observações sobre a avaliação..."
                  className="mt-2"
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline"
                onClick={() => handleSave('rascunho')}
                disabled={saving}
              >
                Salvar Rascunho
              </Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleSave('finalizada')}
                disabled={saving || metas.length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Finalizar Avaliação'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}