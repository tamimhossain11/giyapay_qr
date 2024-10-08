import express from 'express';
import xlsx from 'xlsx';
import bcrypt from 'bcrypt';
import upload from '../middleware/uploadMiddleware.js';
import User from '../model/userModel.js';
import Branch from '../model/branchModel.js';
import Admin from '../model/adminModel.js';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';


const router = express.Router();
const saltRounds = 10;
const allowedUserTypes = ['Branch User', 'Co-Admin', 'admin'];

//User upload
router.post('/upload-users', upload.single('file'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication token is missing' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const uploaderAdminId = decodedToken.id;

    const fileBuffer = req.file.buffer;
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const branches = await Branch.findAll({
      where: { admin_id: uploaderAdminId },
    });

    const validBranchIds = new Set(branches.map(branch => branch.id));

    for (let i = 0; i < data.length; i++) {
      const { first_name, last_name, username, email, password, user_type, status, branch_id, admin_id } = data[i];

      let effectiveAdminId;

      if (user_type === 'Co-Admin') {
        effectiveAdminId = admin_id;
        if (!effectiveAdminId) {
          return res.status(400).json({ error: `Admin ID is required for Co-Admin at row ${i + 1}.` });
        }
      } else {
        effectiveAdminId = uploaderAdminId;
      }

      if (!allowedUserTypes.includes(user_type)) {
        return res.status(400).json({ error: `Invalid user type at row ${i + 1}. Must be one of: ${allowedUserTypes.join(', ')}` });
      }

      if (user_type === 'Co-Admin' && branch_id) {
        return res.status(400).json({ error: `Co-Admin cannot have a branch ID at row ${i + 1}.` });
      }

      if (branch_id && !validBranchIds.has(branch_id)) {
        return res.status(400).json({ error: `Branch ID ${branch_id} is not valid for the uploader admin at row ${i + 1}.` });
      }

      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { username: username },
            { email: email }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({ error: `Duplicate entry found for username/email at row ${i + 1}.` });
      }

      const branchIdToUse = user_type === 'Co-Admin' ? null : branch_id;

      const hashedPassword = await bcrypt.hash(password, saltRounds);
      await User.create({
        first_name,
        last_name,
        username,
        email,
        password: hashedPassword,
        user_type,
        status,
        branch_id: branchIdToUse,
        admin_id: effectiveAdminId
      });
    }
    res.status(200).json({ message: 'Users successfully uploaded and added.' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process the file.' });
  }
});


//Branch upload
router.post('/upload-branches', upload.single('file'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication token is missing' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const uploaderAdminId = decodedToken.id;

    const fileBuffer = req.file.buffer;
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    for (let i = 0; i < data.length; i++) {
      const { branch_name, bank_name, bank_branch, admin_id } = data[i];

      if (!branch_name) {
        return res.status(400).json({ error: `Branch name is required at row ${i + 1}.` });
      }
      if (!bank_name) {
        return res.status(400).json({ error: `Bank name is required at row ${i + 1}.` });
      }
      if (!bank_branch) {
        return res.status(400).json({ error: `Bank branch is required at row ${i + 1}.` });
      }

      let effectiveAdminId = uploaderAdminId;

      if (admin_id) {
        const foundAdmin = await Admin.findOne({ where: { id: admin_id } });

        if (foundAdmin) {
          if (foundAdmin.id !== uploaderAdminId) {
            return res.status(400).json({ error: `Admin ID ${admin_id} does not match the uploader's ID at row ${i + 1}.` });
          }
        } else {
          const foundCoAdmin = await CoAdmin.findOne({ where: { id: admin_id } });
          if (!foundCoAdmin) {
            return res.status(400).json({ error: `Admin ID ${admin_id} is invalid at row ${i + 1}.` });
          }

          if (foundCoAdmin.admin_id !== uploaderAdminId) {
            return res.status(400).json({ error: `Co-Admin ID ${admin_id} does not correspond to the uploader's admin ID at row ${i + 1}.` });
          }

          effectiveAdminId = foundCoAdmin.admin_id;
        }
      }

      const existingBranch = await Branch.findOne({
        where: { branch_name: branch_name }
      });

      if (existingBranch) {
        return res.status(400).json({ error: `Duplicate entry found for branch name "${branch_name}" at row ${i + 1}.` });
      }

      await Branch.create({
        branch_name,
        bank_name,
        bank_branch,
        admin_id: effectiveAdminId
      });
    }

    res.status(200).json({ message: 'Branches successfully uploaded and added.' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process the file.' });
  }
});


export default router;
