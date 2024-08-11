const pool = require('../config/database');

// Obtener todas las acciones
const getActions = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM test_actions');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener una acción por ID
const getActionById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM test_actions WHERE id = $1', [id]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear una nueva acción
const createAction = async (req, res) => {
    const { description } = req.body;
    try {
        // Verificar si la acción ya existe
        const existingAction = await pool.query(
            'SELECT * FROM test_actions WHERE description = $1',
            [description]
        );

        if (existingAction.rows.length > 0) {
            // Si la acción ya existe, devolverla en lugar de crear una nueva
            return res.status(200).json(existingAction.rows[0]);
        }

        // Si no existe, crear una nueva
        const result = await pool.query(
            'INSERT INTO test_actions (description) VALUES ($1) RETURNING *',
            [description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar una acción
const updateAction = async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    try {
        const result = await pool.query(
            'UPDATE test_actions SET description = $1 WHERE id = $2 RETURNING *',
            [description, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar una acción
const deleteAction = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM test_actions WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getActions,
    getActionById,
    createAction,
    updateAction,
    deleteAction,
};
