import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  ArrowLeft, 
  Users,
  UserPlus,
  User as UserIcon,
  Trash2,
  Crown,
  Search,
  Edit2,
  Save,
  X,
  Lock,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function GerenciarCredenciais() {
  const [currentUser, setCurrentUser] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nome_completo: '',
    usuario: '',
    senha: '',
    perfil: 'usuario',
    ativo: true
  });

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = () => {
    const loggedUser = localStorage.getItem('ava_acs_user');
    if (!loggedUser) {
      window.location.href = createPageUrl('AcessoSistema');
      return;
    }
    
    const user = JSON.parse(loggedUser);
    setCurrentUser(user);
    
    if (user.perfil !== 'administrador') {
      window.location.href = createPageUrl('Home');
    }
  };

  const loadData = async () => {
    try {
      const list = await base44.entities.CredencialUsuario.list('-created_date');
      setUsuarios(list);
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
      if (editingUser) {
        await base44.entities.CredencialUsuario.update(editingUser.id, formData);
      } else {
        // Verificar se usuário já existe
        const existe = await base44.entities.CredencialUsuario.filter({ usuario: formData.usuario });
        if (existe.length > 0) {
          alert('Este nome de usuário já está em uso');
          setSaving(false);
          return;
        }
        
        await base44.entities.CredencialUsuario.create(formData);
      }
      
      setShowForm(false);
      setEditingUser(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nome_completo: user.nome_completo || '',
      usuario: user.usuario || '',
      senha: user.senha || '',
      perfil: user.perfil || 'usuario',
      ativo: user.ativo !== false
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await base44.entities.CredencialUsuario.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      nome_completo: '',
      usuario: '',
      senha: '',
      perfil: 'usuario',
      ativo: true
    });
  };

  const filteredUsuarios = usuarios.filter(u => 
    u.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.usuario?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to={createPageUrl('Home')} className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao início
        </Link>

        <Header />

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Gerenciar Usuários e Senhas
              </CardTitle>
              <Button 
                onClick={() => {
                  resetForm();
                  setEditingUser(null);
                  setShowForm(true);
                }}
                className="bg-white text-indigo-600 hover:bg-indigo-50"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Lista de Usuários */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Carregando...</div>
            ) : filteredUsuarios.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <UserIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Nenhum usuário cadastrado</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredUsuarios.map((usuario) => (
                  <Card key={usuario.id} className="border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${
                              usuario.perfil === 'administrador' 
                                ? 'bg-orange-100' 
                                : 'bg-blue-100'
                            }`}>
                              {usuario.perfil === 'administrador' ? (
                                <Crown className="w-4 h-4 text-orange-600" />
                              ) : (
                                <UserIcon className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                {usuario.nome_completo}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>Usuário: {usuario.usuario}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={usuario.perfil === 'administrador' ? 'default' : 'secondary'}>
                            {usuario.perfil === 'administrador' ? 'Administrador' : 'Usuário'}
                          </Badge>
                          <Badge variant={usuario.ativo ? 'default' : 'secondary'}>
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(usuario)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          {usuario.id !== currentUser?.id && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteConfirm(usuario)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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
            <DialogTitle className="flex items-center gap-2 text-indigo-600">
              <UserPlus className="w-5 h-5" />
              {editingUser ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome Completo *</Label>
              <Input
                value={formData.nome_completo}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                placeholder="Nome completo do usuário"
                required
              />
            </div>

            <div>
              <Label>Nome de Usuário (login) *</Label>
              <Input
                value={formData.usuario}
                onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                placeholder="nome.usuario"
                required
              />
            </div>

            <div>
              <Label>Senha *</Label>
              <Input
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                placeholder="Digite a senha"
                required
              />
            </div>

            <div>
              <Label>Perfil de Acesso *</Label>
              <Select 
                value={formData.perfil} 
                onValueChange={(v) => setFormData({ ...formData, perfil: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usuario">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      Usuário
                    </div>
                  </SelectItem>
                  <SelectItem value="administrador">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Administrador
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Usuário Ativo</p>
                <p className="text-sm text-gray-500">Permitir acesso ao sistema</p>
              </div>
              <Switch
                checked={formData.ativo}
                onCheckedChange={(v) => setFormData({ ...formData, ativo: v })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                  resetForm();
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={saving}
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
              Tem certeza que deseja excluir o usuário "{deleteConfirm?.nome_completo}"? 
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