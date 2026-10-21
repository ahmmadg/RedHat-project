export function createLoginUser({
  userRepository,
  passwordHasher,
  tokenService,
}) {
  return async function loginUser({ email, password }) {
    const user = await userRepository.findByEmail(email);

    // Use the same message whether the email or password is wrong.
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const passwordMatches = await passwordHasher.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const token = tokenService.generate({
      sub: user.id,
      role: user.role,
    });

    // Never return the stored password hash.
    const { passwordHash, ...safeUser } = user;

    return {
      user: safeUser,
      token,
    };
  };
}