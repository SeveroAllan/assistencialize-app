
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

/**
 * Fetch all folders for the current user.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
async function fetchFolders(userId) {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching folders:', error);
        return [];
    }

    return data;
}

/**
 * Creates a new folder.
 * @param {string} userId
 * @param {string} name
 * @returns {Promise<object|null>}
 */
async function createFolder(userId, name) {
    if (!userId) return null;

    const { data, error } = await supabase
        .from('folders')
        .insert([{ user_id: userId, name: name }])
        .select()
        .single();

    if (error) {
        console.error('Error creating folder:', error);
        return null;
    }

    return data;
}

/**
 * Deletes a folder.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
async function deleteFolder(id) {
    if (!id) return false;

    const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting folder:', error);
        return false;
    }

    return true;
}

/**
 * Moves an instance to a folder.
 * @param {string} instanceId
 * @param {string|null} folderId
 * @returns {Promise<boolean>}
 */
async function updateInstanceFolder(instanceId, folderId) {
    if (!instanceId) return false;

    // folderId can be null to move back to root
    const { error } = await supabase
        .from('whatsapp_instances')
        .update({ folder_id: folderId })
        .eq('id', instanceId);

    if (error) {
        console.error('Error moving instance:', error);
        return false;
    }

    return true;
}

/**
 * Updates a folder name.
 * @param {string} id
 * @param {string} name
 * @returns {Promise<boolean>}
 */
async function updateFolderName(id, name) {
    if (!id) return false;

    const { error } = await supabase
        .from('folders')
        .update({ name: name })
        .eq('id', id);

    if (error) {
        console.error('Error updating folder name:', error);
        return false;
    }

    return true;
}

module.exports = {
    fetchInstances,
    createInstance,
    updateInstanceName,
    deleteInstance,
    fetchFolders,
    createFolder,
    deleteFolder,
    updateInstanceFolder,
    updateFolderName
};
