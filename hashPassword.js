import bcrypt from "bcryptjs";

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password
    console.log("Hashed Password:", hashedPassword);
  } catch (error) {
    console.error("Error hashing password:", error);
  }
};

// Replace "your-plain-text-password" with the password you want to hash
hashPassword("prasarsenal");