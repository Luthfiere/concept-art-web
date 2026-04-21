import bcrypt from "bcrypt";
import User from "../model/UserModel.js";

const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  username: u.username,
  role: u.role,
  profile_image: u.profile_image,
});

class UserController {

  static async getById(req, res) {
    try {
      const { user_id } = req.user;
      const user = await User.getById(user_id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({ user: publicUser(user) });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { user_id } = req.user;
      const { username, email, current_password, new_password } = req.body;

      const fields = {};

      if (username && username.trim()) {
        const existing = await User.getByUsername(username);
        if (existing && existing.id !== user_id) {
          return res.status(400).json({ message: "Username already taken" });
        }
        fields.username = username.trim();
      }

      if (email && email.trim()) {
        const existing = await User.getByEmail(email);
        if (existing && existing.id !== user_id) {
          return res.status(400).json({ message: "Email already registered" });
        }
        fields.email = email.trim();
      }

      if (new_password) {
        if (!current_password) {
          return res.status(400).json({ message: "current_password is required to change password" });
        }
        const user = await User.getById(user_id);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const ok = await bcrypt.compare(current_password, user.password);
        if (!ok) {
          return res.status(401).json({ message: "Current password is incorrect" });
        }

        fields.password = await bcrypt.hash(new_password, 12);
      }

      if (Object.keys(fields).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      const updated = await User.update(user_id, fields);
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        message: "Profile updated",
        user: publicUser(updated),
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async updateProfileImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "profile_image file is required" });
      }

      const { user_id } = req.user;
      const profile_image = req.file.path.replace(/\\/g, "/");

      const updated = await User.update(user_id, { profile_image });
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        message: "Profile image updated",
        user: publicUser(updated),
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default UserController;
