import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  ArrowLeft, 
  Settings,
  Target,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Header from '@/components/common/Header';

export default function PainelAdmin() {
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMeta, setEditingMeta] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    descricao: '',
    valor_meta: '',
    unidade: '',
    periodo: 'mensal',
    ativa: true
  });

  useEffect(() => {
    checkAuth();
    loadMetas();
  }, []);

  const checkAuth = () => {
    const loggedUser = localStorage.getItem('ava_acs_user');
    if (!loggedUser) {
      window.location.href = createPageUrl('AcessoSistema');
      return;
    }
    
    const user = JSON.parse(loggedUser);
    if (user.perfil !== 'administrador') {
      window.location.href = createPageUrl('Home');
    }
  };

  const loadMetas = async () => {
    try {
      const list = await base44.entities.Meta.list('-created_date');
      setMetas(list);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const data = {
        ...formData,
        valor_meta: parseFloat(formData.valor_meta)
      };
      
      if (editingMeta) {
        await base44.entities.Meta.update(editingMeta.id, data);
      } else {
        await base44.entities.Meta.create(data);
      }
      
      setShowForm(false);
      setEditingMeta(null);
      resetForm();
      loadMetas();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (meta) => {
    setEditingMeta(meta);
    setFormData({
      descricao: meta.descricao || '',
      valor_meta: meta.valor_meta?.toString() || '',
      unidade: meta.unidade || '',
      periodo: meta.periodo || 'mensal',
      ativa: meta.ativa !== false
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await base44.entities.Meta.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      loadMetas();
    }
  };

  const handleToggleStatus = async (meta) => {
    await base44.entities.Meta.update(meta.id, { ativa: !meta.ativa });
    loadMetas();
  };

  const resetForm = () => {
    setFormData({
      descricao: '',
      valor_meta: '',
      unidade: '',
      periodo: 'mensal',
      ativa: true
    });
  };

  const periodoLabels = {
    mensal: 'Mensal',
    trimestral: 'Trimestral',
    semestral: 'Semestral',
    anual: 'Anual'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-red-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to={createPageUrl('Home')} className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao início
        </Link>

        <Header />

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Painel Administrativo - Gestão de Metas
              </CardTitle>
              <Button 
                onClick={() => {
                  resetForm();
                  setEditingMeta(null);
                  setShowForm(true);
                }}
                className="bg-white text-orange-600 hover:bg-orange-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Meta
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Carregando...</div>
            ) : metas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Nenhuma meta cadastrada</p>
                <p className="text-sm mt-2">Clique em "Nova Meta" para começar</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {metas.map((meta) => (
                  <Card key={meta.id} className={`border ${meta.ativa ? '' : 'opacity-60'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-800">{meta.descricao}</h3>
                            <Badge variant={meta.ativa ? 'default' : 'secondary'}>
                              {meta.ativa ? 'Ativa' : 'Inativa'}
                            </Badge>
                            <Badge variant="outline">
                              {periodoLabels[meta.periodo] || 'Mensal'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{meta.valor_meta}</span>
                              {meta.unidade && <span className="text-gray-400">({meta.unidade})</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {meta.ativa ? 'Ativa' : 'Inativa'}
                            </span>
                            <Switch
                              checked={meta.ativa}
                              onCheckedChange={() => handleToggleStatus(meta)}
                            />
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(meta)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteConfirm(meta)}
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modal de Cadastro/Edição */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <Target className="w-5 h-5" />
              {editingMeta ? 'Editar Meta' : 'Cadastrar Nova Meta'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Descrição da Meta *</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva a meta a ser atingida..."
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor da Meta *</Label>
                <Input
                  type="number"
                  value={formData.valor_meta}
                  onChange={(e) => setFormData({ ...formData, valor_meta: e.target.value })}
                  placeholder="Ex: 100"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label>Unidade</Label>
                <Input
                  value={formData.unidade}
                  onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                  placeholder="Ex: %, visitas, etc"
                />
              </div>
            </div>

            <div>
              <Label>Período</Label>
              <Select 
                value={formData.periodo} 
                onValueChange={(v) => setFormData({ ...formData, periodo: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="semestral">Semestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Meta Ativa</p>
                <p className="text-sm text-gray-500">Metas ativas aparecem nas avaliações</p>
              </div>
              <Switch
                checked={formData.ativa}
                onCheckedChange={(v) => setFormData({ ...formData, ativa: v })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingMeta(null);
                  resetForm();
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-orange-600 hover:bg-orange-700"
                disabled={saving || !formData.descricao || !formData.valor_meta}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a meta "{deleteConfirm?.descricao}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}