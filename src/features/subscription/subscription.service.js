
const { supabase } = require('../../config/supabase.js');

/**
 * Busca a assinatura do usuário atual.
 * @param {string} userId - ID do usuário autenticado.
 * @returns {Promise<object|null>} - Retorna o obj 'subscription' com 'plans' aninhado ou null.
 */
async function getUserSubscription(userId) {
    if (!userId) return null;

    const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
            *,
            plan:plans (
                id,
                name,
                max_instances,
                price
            )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

    if (error) {
        // If the error is PGRST116 (0 rows), it's handled by maybeSingle returning null data.
        // But if it's a real error, log it.
        console.error('Erro ao buscar assinatura:', error);
        return null;
    }

    return data;
}

/**
 * Verifica se o usuário pode adicionar uma nova instância.
 * @param {string} userId - ID do usuário autenticado.
 * @param {number} currentCount - Quantidade atual de instâncias.
 * @returns {Promise<{allowed: boolean, message?: string, maxDetails?: any}>}
 */
async function checkInstanceLimit(userId, currentCount) {
    // 1. Verificar se usuário existe
    if (!userId) {
        return { allowed: false, message: 'Usuário não autenticado.' };
    }

    // 2. Buscar assinatura
    const subscription = await getUserSubscription(userId);

    // 3. Definir regras padrão (Fallback para plano Gratuito se necessário, ou bloquear se obrigatório ter plano)
    // Se não tiver assinatura ativa, vamos assumir 1 instância gratuita por segurança, ou 0.
    // O usuário forneceu tabelas, não disse a regra para "sem plano".
    // Vou assumir que sem registro na tabela = plano básico (1 instância ou bloqueado).
    // Geralmente sistemas SaaS têm um free tier. Se não achar, vou permitir 1 para teste ou bloquear.
    // Melhor abordagem: Se não tiver assinatura, bloqueia ou libera 1. Vou liberar 1 por enquanto.

    let maxInstances = 1;
    let planName = 'Gratuito';

    if (subscription && subscription.plan) {
        maxInstances = subscription.plan.max_instances;
        planName = subscription.plan.name;
    } else {
        // Se não tiver registro, e para não quebrar o app de quem está testando sem pagar:
        maxInstances = 1;
    }

    if (currentCount >= maxInstances) {
        return {
            allowed: false,
            message: `Seu plano "${planName}" permite apenas ${maxInstances} instância(s). Faça upgrade para adicionar mais.`,
            maxDetails: { max: maxInstances, current: currentCount }
        };
    }

    return { allowed: true };
}

module.exports = { getUserSubscription, checkInstanceLimit };
