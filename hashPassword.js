import bcrypt from "bcryptjs";

const password = process.argv[2]; // Get password from command line argument

if (!password) {
  console.error("Please provide a password as an argument");
  console.log("Usage: node hashPassword.js <password>");
  process.exit(1);
}

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password
    console.log("Hashed Password:", hashedPassword);
  } catch (error) {
    console.error("Error hashing password:", error);
  }
};

hashPassword(password);