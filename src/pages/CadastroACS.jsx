import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  ArrowLeft, 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2,
  Building2,
  Phone,
  Mail,
  User,
  Save,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import { UAPS_DATA, getUniqueUAPS, getINEsByUAPS, getUniqueDistritos } from '@/components/common/UAPSData';

export default function CadastroACS() {
  const [user, setUser] = useState(null);
  const [acsList, setAcsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingACS, setEditingACS] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    matricula: '',
    uaps_nome: '',
    cnes: '',
    ine: '',
    distrito: '',
    telefone: '',
    email: '',
    status: 'ativo'
  });

  const uniqueUAPS = getUniqueUAPS();
  const [availableINEs, setAvailableINEs] = useState([]);

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
        list = await base44.entities.ACS.list('-created_date');
      } else {
        const userEmail = `${userData.usuario}@sistema.local`;
        list = await base44.entities.ACS.filter({ created_by: userEmail }, '-created_date');
      }
      setAcsList(list);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUAPSChange = (cnes) => {
    const selectedUAPS = uniqueUAPS.find(u => u.cnes === cnes);
    const ines = getINEsByUAPS(cnes);
    setAvailableINEs(ines);
    
    setFormData(prev => ({
      ...prev,
      cnes,
      uaps_nome: selectedUAPS?.nome || '',
      distrito: selectedUAPS?.distrito || '',
      ine: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (editingACS) {
        await base44.entities.ACS.update(editingACS.id, formData);
      } else {
        await base44.entities.ACS.create(formData);
      }
      
      setShowForm(false);
      setEditingACS(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (acs) => {
    setEditingACS(acs);
    setFormData({
      nome: acs.nome || '',
      cpf: acs.cpf || '',
      matricula: acs.matricula || '',
      uaps_nome: acs.uaps_nome || '',
      cnes: acs.cnes || '',
      ine: acs.ine || '',
      distrito: acs.distrito || '',
      telefone: acs.telefone || '',
      email: acs.email || '',
      status: acs.status || 'ativo'
    });
    setAvailableINEs(getINEsByUAPS(acs.cnes));
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await base44.entities.ACS.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      matricula: '',
      uaps_nome: '',
      cnes: '',
      ine: '',
      distrito: '',
      telefone: '',
      email: '',
      status: 'ativo'
    });
    setAvailableINEs([]);
  };

  const filteredList = acsList.filter(acs => 
    acs.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acs.uaps_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acs.ine?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to={createPageUrl('Home')} className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao início
        </Link>

        <Header />

        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Cadastro de ACS
              </CardTitle>
              <Button 
                onClick={() => {
                  resetForm();
                  setEditingACS(null);
                  setShowForm(true);
                }}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Novo ACS
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, UAPS ou INE..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Lista de ACS */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Carregando...</div>
            ) : filteredList.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Nenhum ACS cadastrado</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredList.map((acs) => (
                  <Card key={acs.id} className="border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-800">{acs.nome}</h3>
                            <Badge variant={acs.status === 'ativo' ? 'default' : 'secondary'}>
                              {acs.status || 'ativo'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              {acs.uaps_nome}
                            </div>
                            <div>
                              <span className="text-gray-400">INE:</span> {acs.ine}
                            </div>
                            <div>
                              <span className="text-gray-400">Distrito:</span> {acs.distrito}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(acs)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteConfirm(acs)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <UserPlus className="w-5 h-5" />
              {editingACS ? 'Editar ACS' : 'Cadastrar Novo ACS'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do ACS"
                  required
                />
              </div>

              <div>
                <Label>CPF</Label>
                <Input
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <Label>Matrícula</Label>
                <Input
                  value={formData.matricula}
                  onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                  placeholder="Número da matrícula"
                />
              </div>

              <div className="md:col-span-2">
                <Label>UAPS *</Label>
                <Select value={formData.cnes} onValueChange={handleUAPSChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a UAPS" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueUAPS.map((uaps) => (
                      <SelectItem key={uaps.cnes} value={uaps.cnes}>
                        {uaps.nome} (CNES: {uaps.cnes})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>INE (Equipe) *</Label>
                <Select 
                  value={formData.ine} 
                  onValueChange={(v) => setFormData({ ...formData, ine: v })}
                  disabled={!formData.cnes}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o INE" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableINEs.map((ine) => (
                      <SelectItem key={ine} value={ine}>
                        {ine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Distrito</Label>
                <Input
                  value={formData.distrito}
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Label>Telefone</Label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingACS(null);
                  resetForm();
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={saving || !formData.nome || !formData.cnes || !formData.ine}
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
              Tem certeza que deseja excluir o ACS "{deleteConfirm?.nome}"? 
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