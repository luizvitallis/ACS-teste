import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Activity, Lock, User, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AcessoSistema() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar se já está logado
    const loggedUser = localStorage.getItem('ava_acs_user');
    if (loggedUser) {
      window.location.href = createPageUrl('Home');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credenciais = await base44.entities.CredencialUsuario.filter({
        usuario: usuario,
        senha: senha,
        ativo: true
      });

      if (credenciais.length === 0) {
        setError('Usuário ou senha incorretos');
        setLoading(false);
        return;
      }

      const credencial = credenciais[0];
      
      // Salvar no localStorage
      localStorage.setItem('ava_acs_user', JSON.stringify({
        id: credencial.id,
        nome_completo: credencial.nome_completo,
        usuario: credencial.usuario,
        perfil: credencial.perfil
      }));

      // Redirecionar para home
      window.location.href = createPageUrl('Home');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError('Erro ao fazer login. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg w-fit">
            <Activity className="w-12 h-12 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              AVA – ACS
            </CardTitle>
            <p className="text-sm text-gray-500 mt-2">
              Sistema de Avaliação do Agente Comunitário de Saúde
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="usuario">Usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="usuario"
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Digite seu usuário"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              disabled={loading}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="text-center text-xs text-gray-400 pt-4 border-t">
            © 2024 AVA-ACS • Sistema de Avaliação
          </div>
        </CardContent>
      </Card>
    </div>
  );
}