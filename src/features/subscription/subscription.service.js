
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

    // 3. Definir regras
    let maxInstances = 2; // Default Free Plan limit
    let planName = 'Gratuito';

    if (subscription && subscription.plan) {
        maxInstances = subscription.plan.max_instances;
        planName = subscription.plan.name;
    } else {
        // Se não tiver assinatura ativa, busca plano 'Free' no banco para garantir consistência
        const { data: freePlan, error } = await supabase
            .from('plans')
            .select('max_instances, name')
            .ilike('name', '%free%') // Busca por 'Free', 'free', 'Plano Free', etc.
            .maybeSingle();

        if (freePlan) {
            maxInstances = freePlan.max_instances;
            planName = freePlan.name;
        } else {
            // Fallback se não existir plano 'Free' cadastrado no banco
            console.warn('Plano Free não encontrado no banco, usando fallback hardcoded: 2 instâncias.');
            maxInstances = 2;
            planName = 'Gratuito (Padrão)';
        }
    }

    if (currentCount >= maxInstances) {
        return {
            allowed: false,
            message: `Seu plano "${planName}" permite apenas ${maxInstances} instâncias conectadas. Faça upgrade para adicionar mais.`,
            maxDetails: { max: maxInstances, current: currentCount }
        };
    }

    return { allowed: true };
}

module.exports = { getUserSubscription, checkInstanceLimit };
