import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  ArrowLeft, 
  Users,
  UserPlus,
  Mail,
  Shield,
  User as UserIcon,
  Trash2,
  Crown,
  Search
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

export default function GerenciarUsuarios() {
  const [user, setUser] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviting, setInviting] = useState(false);
  
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'user'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Verificar se é admin
      if (currentUser?.role !== 'admin') {
        window.location.href = createPageUrl('Home');
        return;
      }
      
      const list = await base44.entities.User.list('-created_date');
      setUsuarios(list);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    
    try {
      await base44.users.inviteUser(inviteData.email, inviteData.role);
      
      alert(`Convite enviado para ${inviteData.email}! O usuário receberá um email para criar sua conta.`);
      
      setShowInviteForm(false);
      setInviteData({ email: '', role: 'user' });
      
      // Recarregar lista após alguns segundos
      setTimeout(loadData, 2000);
    } catch (error) {
      console.error('Erro ao convidar:', error);
      alert('Erro ao enviar convite. Verifique se o email já não está cadastrado.');
    } finally {
      setInviting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      try {
        await base44.entities.User.delete(deleteConfirm.id);
        setDeleteConfirm(null);
        loadData();
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir usuário');
      }
    }
  };

  const filteredUsuarios = usuarios.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <Users className="w-5 h-5" />
                Gerenciar Usuários do Sistema
              </CardTitle>
              <Button 
                onClick={() => setShowInviteForm(true)}
                className="bg-white text-indigo-600 hover:bg-indigo-50"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Convidar Usuário
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Aviso */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Sistema de Autenticação Integrado</p>
                  <p>Os usuários convidados receberão um email para criar suas credenciais de acesso. O login é gerenciado pela plataforma de forma segura.</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
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
                <p>Nenhum usuário encontrado</p>
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
                              usuario.role === 'admin' 
                                ? 'bg-orange-100' 
                                : 'bg-blue-100'
                            }`}>
                              {usuario.role === 'admin' ? (
                                <Crown className="w-4 h-4 text-orange-600" />
                              ) : (
                                <UserIcon className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                {usuario.full_name || 'Nome não informado'}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Mail className="w-3 h-3" />
                                {usuario.email}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={usuario.role === 'admin' ? 'default' : 'secondary'}>
                            {usuario.role === 'admin' ? 'Administrador' : 'Usuário'}
                          </Badge>
                          {usuario.id !== user?.id && (
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

      {/* Modal de Convite */}
      <Dialog open={showInviteForm} onOpenChange={setShowInviteForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-600">
              <UserPlus className="w-5 h-5" />
              Convidar Novo Usuário
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Como funciona:</strong> O usuário receberá um email com um link para criar sua conta e definir sua senha de acesso ao sistema.
              </p>
            </div>

            <div>
              <Label>Email do Usuário *</Label>
              <Input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                placeholder="usuario@exemplo.com"
                required
              />
            </div>

            <div>
              <Label>Nível de Acesso *</Label>
              <Select 
                value={inviteData.role} 
                onValueChange={(v) => setInviteData({ ...inviteData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      Usuário Comum
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Administrador
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {inviteData.role === 'admin' 
                  ? 'Administradores têm acesso total ao sistema' 
                  : 'Usuários comuns podem cadastrar e avaliar ACS que criaram'}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setShowInviteForm(false);
                  setInviteData({ email: '', role: 'user' });
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={inviting || !inviteData.email}
              >
                <Mail className="w-4 h-4 mr-2" />
                {inviting ? 'Enviando...' : 'Enviar Convite'}
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
              Tem certeza que deseja excluir o usuário "{deleteConfirm?.full_name || deleteConfirm?.email}"? 
              Esta ação não pode ser desfeita e o usuário perderá acesso ao sistema.
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