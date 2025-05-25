const { pool } = require('../db');

// Get vault (medicine inventory) for a patient
exports.getPatientVault = async (req, res) => {
  const patientId = req.params.patientId;
  
  try {
    const [vaultItems] = await pool.query(`
      SELECT 
        v.Vault_ID,
        v.Medicine_ID,
        v.Medicine_Pieces,
        v.Last_Updated,
        m.Medicine_Name,
        m.Generic_Name,
        m.Dosage,
        m.Description,
        m.Expiration_Date
      FROM VAULT v
      JOIN MED_CABINET m ON v.Medicine_ID = m.Medicine_ID
      WHERE v.Patient_ID = ?
      ORDER BY v.Last_Updated DESC
    `, [patientId]);
    
    res.status(200).json({ vaultItems });
  } catch (error) {
    console.error('Get patient vault error:', error);
    res.status(500).json({ message: 'Server error retrieving patient vault' });
  }
};

// Update medicine quantity in vault
exports.updateVaultQuantity = async (req, res) => {
  const vaultId = req.params.vaultId;
  const { quantity } = req.body;
  
  try {
    // Get vault data
    const [vaults] = await pool.query('SELECT * FROM VAULT WHERE Vault_ID = ?', [vaultId]);
    
    if (vaults.length === 0) {
      return res.status(404).json({ message: 'Vault item not found' });
    }
    
    const vault = vaults[0];
    
    // Check authorization (the patient or a caretaker assigned to the patient can update vault)
    let isAuthorized = false;
    
    if (req.user.id === vault.Patient_ID) {
      isAuthorized = true;
    } else {
      // Check if the user is a caretaker for this patient
      const [caretakers] = await pool.query(
        'SELECT * FROM CARETAKER_PATIENT WHERE Caretaker_ID = ? AND Patient_ID = ?',
        [req.user.id, vault.Patient_ID]
      );
      
      if (caretakers.length > 0) {
        isAuthorized = true;
      }
    }
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'You are not authorized to update this vault item' });
    }
    
    // Get medicine data for report
    const [medicines] = await pool.query('SELECT * FROM MED_CABINET WHERE Medicine_ID = ?', [vault.Medicine_ID]);
    const medicine = medicines[0];
    
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update quantity
      await connection.query(
        'UPDATE VAULT SET Medicine_Pieces = ? WHERE Vault_ID = ?',
        [quantity, vaultId]
      );
      
      // Create inventory update report
      await connection.query(
        'INSERT INTO REPORT (Report_Type, Creator_ID, Patient_ID, Notes) VALUES (?, ?, ?, ?)',
        ['Inventory Update', req.user.id, vault.Patient_ID, `Updated quantity for ${medicine.Medicine_Name} from ${vault.Medicine_Pieces} to ${quantity}`]
      );
      
      // Commit transaction
      await connection.commit();
      
      res.status(200).json({ message: 'Vault quantity updated successfully' });
    } catch (error) {
      // Rollback in case of error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update vault quantity error:', error);
    res.status(500).json({ message: 'Server error updating vault quantity' });
  }
};

// Get low inventory medicines (less than 7 pieces)
exports.getLowInventory = async (req, res) => {
  const patientId = req.params.patientId;
  
  try {
    const [lowInventory] = await pool.query(`
      SELECT 
        v.Vault_ID,
        v.Medicine_ID,
        v.Medicine_Pieces,
        v.Last_Updated,
        m.Medicine_Name,
        m.Generic_Name,
        m.Dosage,
        m.Description,
        m.Expiration_Date
      FROM VAULT v
      JOIN MED_CABINET m ON v.Medicine_ID = m.Medicine_ID
      WHERE v.Patient_ID = ? AND v.Medicine_Pieces <= 7
      ORDER BY v.Medicine_Pieces ASC
    `, [patientId]);
    
    res.status(200).json({ lowInventory });
  } catch (error) {
    console.error('Get low inventory error:', error);
    res.status(500).json({ message: 'Server error retrieving low inventory data' });
  }
}; 