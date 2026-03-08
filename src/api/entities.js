/**
 * entities.js
 * 
 * Wrapper que imita a interface do base44.entities usando Supabase.
 * Cada entidade expõe: list(order?), filter(query, order?), create(data), update(id, data), delete(id)
 */
import { supabase } from './supabaseClient';

// ─── Utilitários ───────────────────────────────────────────────────────────────

/**
 * Converte o parâmetro de ordenação do base44 (ex: '-created_date', 'nome')
 * para o formato do Supabase { column, ascending }
 */
function parseOrder(orderStr) {
  if (!orderStr) return { column: 'created_date', ascending: false };
  const ascending = !orderStr.startsWith('-');
  const column = ascending ? orderStr : orderStr.slice(1);
  return { column, ascending };
}

/**
 * Fábrica de entidade genérica para uma tabela do Supabase
 */
function makeEntity(tableName) {
  return {
    /**
     * Lista todos os registros ordenados
     * @param {string} order - ex: '-created_date' ou 'nome'
     */
    async list(order) {
      const { column, ascending } = parseOrder(order);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order(column, { ascending });
      if (error) throw error;
      return data ?? [];
    },

    /**
     * Filtra registros por campos exatos
     * @param {object} query - ex: { usuario: 'admin', ativo: true }
     * @param {string} order - ex: '-created_date'
     */
    async filter(query = {}, order) {
      const { column, ascending } = parseOrder(order);
      let req = supabase.from(tableName).select('*');

      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          req = req.eq(key, value);
        }
      }

      req = req.order(column, { ascending });
      const { data, error } = await req;
      if (error) throw error;
      return data ?? [];
    },

    /**
     * Cria um novo registro
     * @param {object} data - campos do registro
     */
    async create(data) {
      const { data: created, error } = await supabase
        .from(tableName)
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return created;
    },

    /**
     * Atualiza um registro existente pelo id
     * @param {string} id - UUID do registro
     * @param {object} data - campos a atualizar
     */
    async update(id, data) {
      const { data: updated, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },

    /**
     * Remove um registro pelo id
     * @param {string} id - UUID do registro
     */
    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    },
  };
}

// ─── Entidades ─────────────────────────────────────────────────────────────────

export const entities = {
  ACS: makeEntity('acs'),
  Avaliacao: makeEntity('avaliacao'),
  Meta: makeEntity('meta'),
  CredencialUsuario: makeEntity('credenciais_usuario'),
};
