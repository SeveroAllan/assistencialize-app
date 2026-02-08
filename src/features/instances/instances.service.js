
const { supabase } = require('../../config/supabase.js');

/**
 * Fetch all whatsapp instances for the current user.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
async function fetchInstances(userId) {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching instances:', error);
        return [];
    }

    return data;
}

/**
 * Creates a new whatsapp instance.
 * @param {string} userId
 * @param {string} name
 * @param {string} avatar
 * @returns {Promise<object|null>}
 */
async function createInstance(userId, name) {
    if (!userId) {
        console.error('createInstance: userId is missing');
        return null;
    }

    console.log('Creating instance with userId:', userId, 'name:', name);

    const { data, error } = await supabase
        .from('whatsapp_instances')
        .insert([{ user_id: userId, name: name }])
        .select()
        .single();

    if (error) {
        console.error('Error creating instance:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
    }

    console.log('Instance created successfully:', data);
    return data;
}

/**
 * Updates an instance name.
 * @param {string} id
 * @param {string} name
 * @returns {Promise<boolean>}
 */
async function updateInstanceName(id, name) {
    if (!id) return false;

    const { error } = await supabase
        .from('whatsapp_instances')
        .update({ name: name })
        .eq('id', id);

    if (error) {
        console.error('Error updating instance:', error);
        return false;
    }

    return true;
}

/**
 * Deletes an instance.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
async function deleteInstance(id) {
    if (!id) return false;

    const { error } = await supabase
        .from('whatsapp_instances')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting instance:', error);
        return false;
    }

    return true;
}

module.exports = { fetchInstances, createInstance, updateInstanceName, deleteInstance };
