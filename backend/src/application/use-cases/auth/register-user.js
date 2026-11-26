export function createRegisterUser(userRepository, passwordHasher) {
  return async function registerUser({
    fullName,
    email,
    phone,
    password,
  }) {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      const error = new Error("Email already registered");
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await passwordHasher.hash(password);

    const user = await userRepository.create({
      fullName,
      email,
      phone,
      passwordHash,
    });

    // Never return the password hash to the caller.
    const { passwordHash: ignored, ...safeUser } = user;

    return safeUser;
  };
}
